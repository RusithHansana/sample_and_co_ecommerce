import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { config } from "../../config/index.js";
import { sendSuccessResponse } from "../../utils/send-api-response.js";
import { UnauthorizedError } from "../../types/app-error.js";
import logger from "../../lib/logger.js";

const maxAge = config.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

const clearCookies = (res: Response) => {
    res.clearCookie(
        'refreshToken',
        {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
            path: '/api/auth'
        }
    )
}

class AuthController {
    register = async (req: Request, res: Response) => {
        const { email, password, name } = req.body;
        const result = await authService.register({ email, password, name });

        res.cookie(
            'refreshToken', result.refreshToken,
            {
                httpOnly: true,
                secure: config.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge,
                path: '/api/auth'
            }
        );

        sendSuccessResponse(res, {
            user: result.user,
            accessToken: result.accessToken
        }, 201);
    }

    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const result = await authService.login({ email, password });

        res.cookie(
            'refreshToken', result.refreshToken,
            {
                httpOnly: true,
                secure: config.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge,
                path: '/api/auth'

            }
        );

        sendSuccessResponse(res, {
            user: result.user,
            accessToken: result.accessToken
        }, 200);
    }

    refresh = async (req: Request, res: Response) => {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            logger.error("Refresh token cookie is missing.");
            clearCookies(res);
            throw new UnauthorizedError("Invalid Token", "INVALID_TOKEN");
        }

        try {

            const result = await authService.refreshTokens(refreshToken);

            res.cookie(
                'refreshToken', result.refreshToken,
                {
                    httpOnly: true,
                    secure: config.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge,
                    path: '/api/auth'

                }
            );

            sendSuccessResponse(res, {
                accessToken: result.accessToken
            }, 200);

        } catch (err: any) {
            clearCookies(res);
            throw err;
        }
    }

    logout = async (req: Request, res: Response) => {
        const { refreshToken } = req.cookies;

        if (refreshToken) {
            try {
                await authService.logout(refreshToken);
            } catch {
                //catching db error silently
            }
        }

        clearCookies(res);
        sendSuccessResponse(res, {
            message: "Logged out Successfully!"
        }, 200);
    }

    me = async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        const me = await authService.me(user.id);

        sendSuccessResponse(res, {
            id: me.id,
            email: me.email,
            name: me.name,
            role: me.role,
        }, 200);
    }
}

export const authController = new AuthController();