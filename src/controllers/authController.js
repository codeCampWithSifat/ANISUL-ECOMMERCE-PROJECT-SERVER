import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { successResponse } from "./responseController.js";
import { createJSONWebToken } from "../helper/jsonwebtoken.js";
import bcrypt from "bcryptjs";
import { jwtAccessKey } from "../secret.js";

const handleLogin = async (req, res, next) => {
  try {
    // email, password
    // check user isExists
    // compare the password
    // isBanned
    // token
    // cookie
    // successResponse
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw createError(404, "User Not Found");
    }

    const isPasswordMatched = await bcrypt.compare(password, user?.password);
    if (!isPasswordMatched) {
      throw createError(404, "Password Not Matched , Try Again");
    }

    if (user?.isBanned) {
      throw createError(403, "You Are Banned Baby, Contact Our Authority");
    }

    //create jwt
    const accessToken = createJSONWebToken({ user }, jwtAccessKey, "15m");

    res.cookie("accessToken", accessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      //   secure: true,
      sameSite: "none",
    });

    return successResponse(res, {
      statusCode: 201,
      message: "User Login Successfully",
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    return successResponse(res, {
      statusCode: 201,
      message: "User Logout  Successfully",
      payload: {},
    });
  } catch (error) {}
};

export { handleLogin, handleLogout };
