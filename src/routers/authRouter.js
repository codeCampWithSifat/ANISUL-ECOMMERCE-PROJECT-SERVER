import express from "express";
import { handleLogin, handleLogout } from "../controllers/authController.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/auth.js";

const authRouter = express.Router();

authRouter.post("/login", isLoggedOut, handleLogin);
authRouter.post("/logout", isLoggedIn, handleLogout);

export { authRouter };
