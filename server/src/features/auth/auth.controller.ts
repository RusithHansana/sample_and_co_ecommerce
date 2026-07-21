import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { config } from "../../config/index.js";
import { sendSuccessResponse } from "../../utils/send-api-response.js";

const maxAge = config.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

class AuthController {
    register = async (req: Request, res: Response) => {
        const { email, password, name } = req.body;
        const result = await authService.register({ email, password, name });

        res.cookie(
            'refreshToken', result.refreshToken,
            {
                httpOnly: true,
                secure: config.NODE_ENV === 'production',
                sameSite: 'strict',
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
                sameSite: 'strict',
                maxAge,
                path: '/api/auth'

            }
        );

        sendSuccessResponse(res, {
            user: result.user,
            accessToken: result.accessToken
        }, 200);
    }
}

export const authController = new AuthController();