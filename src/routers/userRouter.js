import express from "express";
import {
  deleteUserById,
  getUserById,
  getUsers,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.delete("/:id", deleteUserById);

export default userRouter;
