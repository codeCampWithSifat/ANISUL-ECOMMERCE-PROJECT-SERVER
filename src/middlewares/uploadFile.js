import multer from "multer";
import path from "path";
import createError from "http-errors";

const whitelist = ["png", "jpg"];
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/users");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype !== "image/png" &&
    file.mimetype !== "image/jpg" &&
    file.mimetype !== "image/jpeg"
  ) {
    console.log(file.mimetype);
    return cb(createError(400, "Only png and jpg are Allowed"));
  } else {
    cb(null, true);
  }
};
const maxSize = 1024 * 1024 * 1;

const upload = multer({
  storage: storage,
  limits: { fieldSize: maxSize },
  fileFilter,
});

export { upload };
