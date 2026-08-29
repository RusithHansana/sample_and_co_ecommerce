import { param, query, type ValidationChain } from "express-validator";

function attributeValidator(value: any): boolean {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Attributes must be valid key-value object");
    }

    for (const [key, val] of Object.entries(value)) {
        if (typeof key !== "string" || key.trim() === "") {
            throw new Error("Attribute keys must be valid non-empty strings");
        }

        if (typeof val !== "string" || val.trim() === "") {
            throw new Error("Attribute values must be valid non-empty strings");
        }
    }

    return true;
}

function attributeSanitizer(value: any): Record<string, string> {
    if (!value || typeof value !== "object") return value;

    const sanitized: Record<string, string> = {};

    for (const [key, val] of Object.entries(value)) {
        const trimmedKey = key.trim();
        // Skip prototype pollution vectors
        if (trimmedKey === "__proto__" || trimmedKey === "constructor" || trimmedKey === "prototype") {
            continue;
        }
        sanitized[trimmedKey] = String(val).trim();
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
        .isInt({ min: 1, max: 50 }).withMessage("Page size must be between 1 and 50")
        .toInt(),

    query("search")
        .optional()
        .isString().withMessage("Search must be a string")
        .isLength({ max: 200 }).withMessage("Search query cannot exceed 200 characters")
        .trim(),

    query("category")
        .optional()
        .isString().withMessage("Category must be a string")
        .trim(),

    query("attributes")
        .optional()
        .custom((value) => attributeValidator(value))
        .customSanitizer((value) => attributeSanitizer(value))
];

export const getProductDetailsIdValidation: ValidationChain[] = [
    param("id")
        .isUUID()
        .withMessage("Product ID must be a valid UUID")
];