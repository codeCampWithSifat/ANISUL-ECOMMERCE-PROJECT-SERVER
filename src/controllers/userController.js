import createError from "http-errors";
import { User } from "../models/userModel.js";
import { successResponse } from "./responseController.js";
import mongoose from "mongoose";
import { createJSONWebToken } from "../helper/jsonwebtoken.js";
import { clientURL, jwtActivationKey, jwtResetPasswordKey } from "../secret.js";
import { sendEmailWithNodeMailer } from "../helper/nodeMailer.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../helper/cloudinayImageUploader.js";
import { publicIdWithoutExtensionFromUrl } from "../helper/deleteCloudinaryImage.js";
import bcrypt from "bcryptjs";
import { cloudinary } from "../config/cloudinaryConfig.js";
const getUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

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
    const existingUser = await User.findOne({ _id: id });
    if (existingUser && existingUser.image) {
      const publicId = await publicIdWithoutExtensionFromUrl(
        existingUser.image
      );
      const { result } = await cloudinary.uploader.destroy(
        `AnisulEcommerceMern/users/${publicId}`
      );
      console.log(result);
    }
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

    // // upload file in cloudinary
    // const userImage = await uploadOnCloudinary(localImage);
    // create jsonwebtoken
    const token = createJSONWebToken(
      { name, email, password, phone, address, image: localImage },
      jwtActivationKey,
      "1d"
    );
    // prepare email

    const emailData = {
      email,
      subject: "Account Activation Email . Please Active Your Account ✔", // Subject line
      html: `
        <h2>Hello ${name} . Hope You Are Well?.</h2>
        <p>Please Click Here to this link <a href="${clientURL}/api/users/activate/${token}" target="_blank">activate your account</a> </p>
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

    const image = decoded?.image;
    if (image) {
      const response = await cloudinary.uploader.upload(image, {
        folder: "AnisulEcommerceMern/users",
      });
      decoded.image = response?.secure_url;
    }
    await User.create(decoded);

    return successResponse(res, {
      statusCode: 201,
      message: "Your Account Registered Successfully. Please Login",
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

const updateUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, address, phone } = req.body;
    const image = req.file?.path;

    // delete image from cloudinary
    const existingUser = await User.findById({ _id: id });
    if (existingUser && existingUser?.image) {
      const publicId = await publicIdWithoutExtensionFromUrl(
        existingUser?.image
      );
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(result);
    }

    // updated content
    if (!name || !address || !phone) {
      throw createError(400, "All Fields Are Required");
    }
    const userImage = await uploadOnCloudinary(image);
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { name, address, phone, image: userImage?.url } },
      { new: true }
    ).select("-password");
    return successResponse(res, {
      statusCode: 200,
      message: "Update A User Successfully",
      payload: { user },
    });
  } catch (error) {
    if (error instanceof mongoose.Error) {
      next(createError(400, "Invalid User Id"));
    }
    next(error);
  }
};

const handleBanUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isBanned: true } },
      { new: true }
    ).select("-password");
    return successResponse(res, {
      statusCode: 200,
      message: "Banned A User Successfully",
      payload: { user },
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(404, "Invalid Mongodb id");
    }
    return next(error);
  }
};

const handleUnBanUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isBanned: false } },
      { new: true }
    ).select("-password");
    return successResponse(res, {
      statusCode: 200,
      message: "Banned A User Successfully",
      payload: { user },
    });
  } catch (error) {
    return next(error);
  }
};

const handleBanUnBanUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { action } = req.body;

    let update;
    let successMessage;
    if (action === "ban") {
      update = { isBanned: true };
      successMessage = "User Ban Successfully";
    } else if (action === "unban") {
      update = { isBanned: false };
      successMessage = "User Unbanned Successfully";
    } else {
      throw createError(400, "Invalid Action... Please Take A Valid Action");
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).select("-password");

    return successResponse(res, {
      statusCode: 200,
      message: successMessage,
      payload: { user },
    });
  } catch (error) {
    return next(error);
  }
};

const handleUpdatePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.params.id;
    const user = await User.findOne({ $or: [{ email }, { _id: userId }] });
    if (!user) {
      throw createError(404, "User Not Exists");
    }
    const isPasswordMatch = await bcrypt.compare(oldPassword, user?.password);
    if (!isPasswordMatch) {
      throw createError(401, "Your Old Password Not Matched");
    } else if (newPassword !== confirmPassword) {
      throw createError(401, "newPassword/confirmPassword Not Matched");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { password: newPassword } },
      { new: true }
    );

    if (!updatedUser) {
      throw createError(400, "User Not Updated, Internal Error");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Update User Password Successfully",
      payload: { updatedUser },
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return createError(404, "User Id Not Found");
    }
    return next(error);
  }
};

const handleForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const isExists = await User.findOne({ email: email });
    if (!isExists) {
      throw createError(404, "User Not Found In This Email");
    }

    // create jsonwebtoken
    const token = createJSONWebToken({ email }, jwtResetPasswordKey, "1d");

    // prepare email

    const emailData = {
      email,
      subject: "Account Foget Password Email . Try Out Your Forget Password ✔", // Subject line
      html: `
        <h2>Hello ${isExists.name} . Hope You Are Well?.</h2>
        <p>Please Click Here to this link <a href="${clientURL}/api/users/reset-password/activate/${token}" target="_blank">Reset Your Password</a> </p>
      `,
    };

    // send email with nodemailer

    try {
      await sendEmailWithNodeMailer(emailData);
    } catch (error) {
      next(createError(404, "Send To Failed .... Reset Password Email"));
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Forget Password Handler Done Successfully",
      payload: { token },
    });
  } catch (error) {
    return next(error);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw createError(401, "Token/NewPassword is missing");
    }
    const decoded = jwt.verify(token, jwtResetPasswordKey);
    if (!decoded) {
      throw createError(401, "Reset Password Decoded Failed");
    }
    // console.log(decoded);
    const email = decoded?.email;
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { password: newPassword } },
      { new: true }
    ).select("-password");
    return successResponse(res, {
      statusCode: 200,
      message: "Reset Your Password Successfullly",
      payload: { updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
  updateUserById,
  handleBanUserById,
  handleUnBanUserById,
  handleBanUnBanUserById,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
};
