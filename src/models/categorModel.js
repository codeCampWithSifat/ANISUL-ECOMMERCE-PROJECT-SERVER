import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "category name is required"],
      minlength: [3, "minimum length is 3"],
      maxlength: [31, "maximum length is 31"],
    },
    slug: {
      type: String,
      lowercase: true,
      uniqe: true,
    },
  },
  { timestamps: true }
);
export const Category = mongoose.model("Category", categorySchema);
