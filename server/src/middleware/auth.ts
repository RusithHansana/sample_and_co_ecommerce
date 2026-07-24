import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { ForbiddenError, UnauthorizedError } from "../types/app-error.js";
import { config } from "../config/index.js";
import { authRepository } from "../features/auth/auth.repository.js";

interface AccessTokenPayload {
    userId: string;
    role: string;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return next(new UnauthorizedError("Missing or invalid authorization header."));
    }

    const accessToken = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(accessToken, config.JWT_SECRET) as AccessTokenPayload

        const user = await authRepository.findUserById(payload.userId);

        if (!user) {
            return next(new UnauthorizedError("User not found."));
        }

        if (payload.role !== user.role) {
            return next(new ForbiddenError("Role mismatch - Access Denied!"));
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
    } catch (error) {
        return next(new UnauthorizedError("Invalid Token"));
    }

    next();
}

export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ForbiddenError("You do not have access to this resource."));
        }

        next();
    }
}