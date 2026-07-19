import type { Response } from "express";
import type { ApiSuccessResponse } from "../types/api-response.ts";

export function sendSuccessResponse<T>(res: Response, data: T, status = 200) {
    const response: ApiSuccessResponse<T> = { data };

    res.status(status).json(response)
}