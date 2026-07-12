import { type Request, type Response, type NextFunction } from "express";
import { NotFoundError } from "../types/app-error.ts";

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
    next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}