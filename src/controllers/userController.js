import createError from "http-errors";
import { User } from "../models/userModel.js";
import { successResponse } from "./responseController.js";
import mongoose from "mongoose";
import { createJSONWebToken } from "../helper/jsonwebtoken.js";
import { clientURL, jwtActivationKey } from "../secret.js";
import { sendEmailWithNodeMailer } from "../helper/nodeMailer.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../helper/cloudinayImageUploader.js";

const getUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;

    const searchRegExp = new RegExp(".*" + search + ".*" + "i");

    const filter = {
      isAdmin: { $ne: true },
      $or: [
        { name: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    };
    const options = { password: 0 };
    const users = await User.find(filter, options)
      .limit(limit)
      .skip((page - 1) * limit);
    const count = await User.find(filter).countDocuments();

    if (!users) {
      throw createError(404, "User Not Found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "users were returned",
      payload: {
        users,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");

    if (!user) {
      throw createError(404, "User Not Found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Get A Single User Successfully",
      payload: { user },
    });
  } catch (error) {
    if (error instanceof mongoose.Error) {
      next(createError(400, "Invalid User Id"));
    }
    next(error);
  }
};

const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    }).select("-password");
    if (!user) {
      throw createError(404, "User Not Found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Delete User Successfully",
      payload: { user },
    });
  } catch (error) {
    if (error instanceof mongoose.Error) {
      next(createError(400, "Invalid User Id"));
    }
    next(error);
  }
};

const processRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const localImage = req.file?.path;
    if (parseInt(localImage.size) > 1024 * 1024 * 0.5) {
      throw createError(404, "File Need is less 500kb");
    }
    const userExists = await User.exists({ email: email });
    if (userExists) {
      throw createError(404, "User Already Exists. Please Login");
    }

    // upload file in cloudinary
    const userImage = await uploadOnCloudinary(localImage);
    // create jsonwebtoken
    const token = createJSONWebToken(
      { name, email, password, phone, address, image: userImage?.url },
      jwtActivationKey,
      "1d"
    );
    // prepare email

    const emailData = {
      email,
      subject: "Account Activation Email . Please Active Your Account ✔", // Subject line
      html: `
        <h2>Hello ${name} . Hope You Are Well?.</h2>
        <p>Please Click Here to this link <a href="${clientURL}/users/activate/${token}" target="_blank">activate your account</a> </p>
      `,
    };

    // send email with nodemailer

    try {
      await sendEmailWithNodeMailer(emailData);
    } catch (error) {
      next(createError(404, "Sending Email Falied. Internal Server Error"));
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Check Your Email And Verify Your Email Address",
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

const activateUserAccount = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!token) {
      throw createError(404, "Token Not Found");
    }
    const decoded = jwt.verify(token, jwtActivationKey);
    if (!decoded) {
      throw createError(401, "Unable To Verify User");
    }

    const userExists = await User.exists({ email: decoded?.email });
    if (userExists) {
      throw createError(
        401,
        "User With This Email Already Exists, Please Login"
      );
    }

    await User.create(decoded);

    return successResponse(res, {
      statusCode: 201,
      message: "Your Account Registered Successfully. Please Login",
      payload: decoded,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw createError(401, "Token Has Expired");
    } else if (error.name === "JsonWebTokenError") {
      throw createError(401, "Invalid Token ");
    } else {
      next(error);
    }
  }
};

export {
  getUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
};
