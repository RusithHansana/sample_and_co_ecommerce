import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ValidationError } from "../types/app-error.js";

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