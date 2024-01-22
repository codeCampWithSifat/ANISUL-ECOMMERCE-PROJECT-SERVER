import { successResponse } from "./responseController.js";
import createError from "http-errors";
import slugify from "slugify";
import { Category } from "../models/categorModel.js";

const handleCreateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      throw createError(401, "Category Name Is Required");
    }
    const newCategory = await Category.create({
      name: name,
      slug: slugify(name),
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Category Created Successfully",
      payload: { newCategory },
    });
  } catch (error) {
    return next(error);
  }
};

const handleGetCategories = async (req, res, next) => {
  try {
    const getAllCategories = await Category.find({}).select("name slug").lean();
    return successResponse(res, {
      statusCode: 200,
      message: "Category Fetched Successfully",
      payload: getAllCategories,
    });
  } catch (error) {
    return next(error);
  }
};

const handleGetSingleCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const getCategory = await Category.findOne({ slug: slug })
      .select("name slug")
      .lean();
    if (!getCategory) {
      throw createError(404, "Category Not Found");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Category Fetched Successfully",
      payload: getCategory,
    });
  } catch (error) {
    return next(error);
  }
};

const handleUpdateCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;
    const getCategory = await Category.findOne({ slug: slug });
    if (!getCategory) {
      throw createError(404, "Category Not Found");
    }
    const updateCategory = await Category.findOneAndUpdate(
      { slug },
      { $set: { slug: slugify(name), name: name } },
      { new: true }
    );
    if (!updateCategory) {
      throw createError(404, "Updated Category Not Found");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Category Fetched Successfully",
      payload: updateCategory,
    });
  } catch (error) {
    return next(error);
  }
};

const handleDeleteCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const deleteCategory = await Category.findOneAndDelete({ slug: slug });
    if (!deleteCategory) {
      throw createError(401, "Category Not Found");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Category Deleted Successfully",
      payload: deleteCategory,
    });
  } catch (error) {
    return next(error);
  }
};

export {
  handleCreateCategory,
  handleGetCategories,
  handleGetSingleCategory,
  handleUpdateCategory,
  handleDeleteCategory,
};
