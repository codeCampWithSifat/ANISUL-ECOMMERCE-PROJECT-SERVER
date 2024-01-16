// import fs from "fs/promises";

// const deleteImage = async (imagePath) => {
//   try {
//     await fs.access(imagePath);
//     await fs.unlink(imagePath);
//     console.log("Image Deleted Successfully");
//   } catch (error) {
//     console.log("Failed To Delete Image , Try Again Later", error.toString());
//   }
// };

// export { deleteImage };

// const deleteImage = async (imagePath) => {
//     fs.access(imagePath)
//       .then(() => fs.unlink(imagePath))
//       .then(() => console.log("Image Deleted Successfully"))
//       .catch((error) =>
//         console.log("Failed To Delete Image , Try Again Later", error.toString())
//       );
//   };
