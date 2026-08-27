import type { Response } from "express";
import type { ApiSuccessResponse } from "../types/api-response.js";

export function sendSuccessResponse<T>(
    res: Response,
    data: T,
    status = 200,
    pagination?: ApiSuccessResponse<T>["pagination"]
) {
    const response: ApiSuccessResponse<T> = {
        data, ...(pagination && { pagination })
    };

    res.status(status).json(response)
}