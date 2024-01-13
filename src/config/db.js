import mongoose from "mongoose";
import { mongodbURL } from "../secret.js";

const connectDB = async () => {
  try {
    await mongoose.connect(mongodbURL);
    console.log(`Connected To Mongoose Successfully`);
    mongoose.connection.on("error", (error) => {
      console.error(`mongoose connection error`, error);
    });
  } catch (error) {
    console.log(`mongoose connection failed`, error.toString());
    process.exit(1);
  }
};

export default connectDB;
