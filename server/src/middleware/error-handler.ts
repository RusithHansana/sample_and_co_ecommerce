import { type Request, type Response, type NextFunction } from "express";

import logger from "../lib/logger.ts";
import { AppError, ValidationError } from "../types/app-error.ts";
import type { ApiErrorResponse } from "../types/api-response.ts";


export function errorHandler (err: Error, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        return next(err);
    }

    if(err instanceof AppError){
        const body: ApiErrorResponse = {
            error: {
                message: err.message,
                code: err.code,
                ...(err instanceof ValidationError && { details: err.details})
            }
        };

        logger.warn({ err}, "Application Error Occured");
    
        return res.status(err.statusCode).json(body);
    }

    logger.warn({err}, "Unknown Error Occured.");

    const body: ApiErrorResponse = {
        error: {
            message: "Internal Server Error",
            code: "INTERNAL_SERVER_ERROR",
        }
    };

    res.status(500).json(body);
}