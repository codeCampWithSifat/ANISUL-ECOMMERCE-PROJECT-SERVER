import express, { Router } from "express";
import {
  deleteUserById,
  getUserById,
  getUsers,
  processRegister,
  activateUserAccount,
  updateUserById,
  handleBanUserById,
  handleUnBanUserById,
  handleBanUnBanUserById,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
} from "../controllers/userController.js";
import { upload } from "../middlewares/uploadFile.js";
import { validateUserRegistraion } from "../validators/auth.js";
import { runValidation } from "../validators/index.js";
import { isAdmin, isLoggedIn, isLoggedOut } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post(
  "/process-register",
  upload.single("image"),
  isLoggedOut,
  validateUserRegistraion,
  runValidation,
  processRegister
);
userRouter.post("/forget-password", handleForgetPassword);
userRouter.put("/reset-password", handleResetPassword);

userRouter.post("/verify", isLoggedOut, activateUserAccount);
userRouter.get("/", isLoggedIn, isAdmin, getUsers);
userRouter.get("/:id", isLoggedIn, getUserById);
userRouter.delete("/:id", isLoggedIn, deleteUserById);
userRouter.put("/:id", upload.single("image"), isLoggedIn, updateUserById);
userRouter.put("/ban-user/:id", isLoggedIn, isAdmin, handleBanUserById);
userRouter.put("/unban-user/:id", isLoggedIn, isAdmin, handleUnBanUserById);
userRouter.put(
  "/ban-unban-user/:id",
  isLoggedIn,
  isAdmin,
  handleBanUnBanUserById
);
userRouter.put("/update-password/:id", isLoggedIn, handleUpdatePassword);

export default userRouter;
