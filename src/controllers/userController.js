import createError from "http-errors";
import { User } from "../models/userModel.js";
import { successResponse } from "./responseController.js";
import mongoose from "mongoose";

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

export { getUsers, getUserById, deleteUserById };
