import createError from "http-errors";
import jwt from "jsonwebtoken";
import { jwtAccessKey } from "../secret.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      throw createError(404, "Access Token Not Found");
    }
    const decoded = jwt.verify(token, jwtAccessKey);
    if (!decoded) {
      throw createError(404, "Invalid Access Token... Please Login Again");
    }
    req.user = decoded?.user;
    next();
  } catch (error) {
    return next(error);
  }
};

const isLoggedOut = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, jwtAccessKey);
        if (decoded) {
          throw createError(400, "User Already Logged In");
        } else {
          throw createError(404, "Token Expired... Please Login Again");
        }
      } catch (error) {
        throw next(error);
      }
    }

    next();
  } catch (error) {
    return next(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const isAdmin = req.user?.isAdmin;
    if (!isAdmin) {
      throw createError(403, "Only For Admin Access, Forbidden");
    }
    next();
  } catch (error) {
    return next(error);
  }
};

export { isLoggedIn, isLoggedOut, isAdmin };
