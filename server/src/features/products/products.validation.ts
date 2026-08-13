import { query, type ValidationChain } from "express-validator";
import { AppError } from "../../types/app-error.ts";

function attributeValidator(value: any): boolean {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Attributes must be valid key-value object");
    }

    for (const [key, val] of Object.entries(value)) {
        if (typeof key !== "string" || key.trim() === "") {
            throw new Error("Attribute keys must be valid non-empty strings");
        }

        if (typeof val !== "string" || key.trim() === "") {
            throw new Error("Attribute values must be valid non-empty strings");
        }
    }

    return true;
}

function attributeSanitizer(value: any): Record<string, string> {
    if (!value || typeof value !== "object") return value;

    const sanitized: Record<string, string> = {};

    for (const [key, val] of Object.entries(value)) {
        sanitized[key.trim()] = String(val).trim();
    }

    return sanitized;
}

export const listProductsValidation: ValidationChain[] = [
    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("Page must be a positive integer")
        .toInt(),

    query("pageSize")
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage("Page size must be 1 and 50")
        .toInt(),

    query("search")
        .optional()
        .isString().withMessage("Search must be a string")
        .trim()
        .escape(),

    query("category")
        .optional()
        .isString().withMessage("Category must be a string")
        .trim(),

    query("attributes")
        .optional()
        .custom((value) => attributeValidator(value))
        .customSanitizer((value) => attributeSanitizer(value))
]