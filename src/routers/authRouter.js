import express from "express";
import {
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleProtected,
} from "../controllers/authController.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/auth.js";

const authRouter = express.Router();

authRouter.post("/login", isLoggedOut, handleLogin);
authRouter.post("/logout", isLoggedIn, handleLogout);
authRouter.get("/refresh-token", handleRefreshToken);
authRouter.get("/protected", handleProtected);

export { authRouter };
