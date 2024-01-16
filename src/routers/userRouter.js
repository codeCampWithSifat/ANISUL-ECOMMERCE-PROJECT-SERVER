import express, { Router } from "express";
import {
  deleteUserById,
  getUserById,
  getUsers,
  processRegister,
  activateUserAccount,
} from "../controllers/userController.js";
import { upload } from "../middlewares/uploadFile.js";

const userRouter = express.Router();

userRouter.post("/process-register", upload.single("image"), processRegister);
userRouter.post("/verify", activateUserAccount);
userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.delete("/:id", deleteUserById);

export default userRouter;
