import express from "express";
import {
  handleCreateCategory,
  handleGetCategories,
  handleGetSingleCategory,
  handleUpdateCategory,
  handleDeleteCategory,
} from "../controllers/categoryController.js";
import { isAdmin, isLoggedIn } from "../middlewares/auth.js";

const categoryRouter = express.Router();

categoryRouter.post("/", isLoggedIn, isAdmin, handleCreateCategory);

categoryRouter.get("/", handleGetCategories);
categoryRouter.get("/:slug", handleGetSingleCategory);
categoryRouter.put("/:slug", isLoggedIn, isAdmin, handleUpdateCategory);
categoryRouter.delete("/:slug", isLoggedIn, isAdmin, handleDeleteCategory);

export { categoryRouter };
