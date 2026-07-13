import { type Request, type Response, type NextFunction } from "express";

import { AppError, ValidationError } from "../types/app-error.js";

import type { ApiErrorResponse } from "../types/api-response.js";


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

        req.log.error({ err}, "Application Error Occured");
    
        return res.status(err.statusCode).json(body);
    }

    req.log.error({err}, "Unknown Error Occurred.");

    const body: ApiErrorResponse = {
        error: {
            message: "Internal Server Error",
            code: "INTERNAL_SERVER_ERROR",
        }
    };

    res.status(500).json(body);
}