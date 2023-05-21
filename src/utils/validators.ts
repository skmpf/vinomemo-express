import { body } from "express-validator";

export const loginValidator = [
  body("email").notEmpty().trim().isEmail().withMessage("Email must be valid"),
  body("password")
    .notEmpty()
    .trim()
    .isLength({ min: 6, max: 20 })
    .escape()
    .withMessage("Password must be between 6 and 20 characters"),
];

export const signupValidator = [
  body("name").notEmpty().escape().withMessage("Name is required"),
  ...loginValidator,
];

export const updateUserValidator = [
  body("name").optional().escape(),
  body("email").optional().trim().isEmail().withMessage("Email must be valid"),
  body("password")
    .optional()
    .trim()
    .isLength({ min: 6, max: 20 })
    .escape()
    .withMessage("Password must be between 6 and 20 characters"),
];
