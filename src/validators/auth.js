import { body, matchedData } from "express-validator";
// registration Validation
const validateUserRegistraion = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 31 })
    .withMessage("Name should be at least 3 to 31 character long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email Address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 3, max: 31 })
    .withMessage("Minimum 3 And Maximum 31"),
  body("image").optional().isString(),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("phone").trim().notEmpty().withMessage("Phone Number is Required"),
];
// signIn Validation

export { validateUserRegistraion };
