import { body } from "express-validator";

export const registerValidation = [
    body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
    body("password").isLength({ min: 8, max: 72 }).withMessage("Password must be between 8 - 72 characters."),
    body("name").trim().notEmpty().withMessage("Name is required."),
];

export const loginValidation = [
    body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required.")
];
