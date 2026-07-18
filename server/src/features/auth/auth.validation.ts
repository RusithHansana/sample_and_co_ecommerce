import type { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { ValidationError } from "../../types/app-error.js";

export const registerValidation = [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be atleast 8 characters"),
    body("name").trim().notEmpty().withMessage("Name is required"),
];

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ValidationError(
            "Validation failed",
            errors.array().map(e => ({ field: e.type === 'field' ? e.path : "unknown", message: e.msg }))
        );
    }

    next();
}