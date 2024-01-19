import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { successResponse } from "./responseController.js";
import { createJSONWebToken } from "../helper/jsonwebtoken.js";
import bcrypt from "bcryptjs";
import { jwtAccessKey, jwtRefreshKey } from "../secret.js";

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

    //create jwt accessToken
    const accessToken = createJSONWebToken({ user }, jwtAccessKey, "5m");
    res.cookie("accessToken", accessToken, {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
      //   secure: true,
      sameSite: "none",
    });
    // set refreshToken
    const refreshToken = createJSONWebToken({ user }, jwtRefreshKey, "7d");
    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
    res.clearCookie("refreshToken");
    return successResponse(res, {
      statusCode: 201,
      message: "User Logout  Successfully",
      payload: {},
    });
  } catch (error) {
    return next(error);
  }
};

const handleRefreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    // verify the old refresh token
    const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);
    if (!decodedToken) {
      throw createError(
        401,
        "Invalid Handle Refresh Token.... Please Login Again"
      );
    }

    //create jwt accessToken
    const accessToken = createJSONWebToken(
      decodedToken.user,
      jwtAccessKey,
      "1m"
    );
    res.cookie("accessToken", accessToken, {
      maxAge: 1 * 60 * 1000,
      httpOnly: true,
      //   secure: true,
      sameSite: "none",
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Refresh Token Generate Successfully",
      payload: { accessToken },
    });
  } catch (error) {
    return next(error);
  }
};

const handleProtected = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    // verify the accesstoken
    const decodedToken = jwt.verify(accessToken, jwtAccessKey);
    if (!decodedToken) {
      throw createError(
        401,
        "Invalid Handle Protected Token..... Please Login Again"
      );
    }

    return successResponse(res, {
      statusCode: 201,
      message: "Handle Protected Resources Access Successfully",
      payload: { accessToken },
    });
  } catch (error) {
    return next(error);
  }
};

export { handleLogin, handleLogout, handleRefreshToken, handleProtected };
