import { validationResult } from "express-validator";
import { errrorResponse } from "../controllers/responseController.js";

const runValidation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //   console.log(errors.array()[0].msg);
      return errrorResponse(res, {
        statusCode: 422,
        message: errors.array()[0].msg,
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

export { runValidation };
