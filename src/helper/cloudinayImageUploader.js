import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dze2tntce",
  api_key: "591597841633266",
  api_secret: "m2Hxw68oYJd5HdPRK244Jfxcyqc",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally save temporary file operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
