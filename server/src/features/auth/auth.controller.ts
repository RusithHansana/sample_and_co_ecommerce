import type { Request, Response } from "express";
import { authService } from "./auth.service.js";

class AuthController {
    register = async (req: Request, res: Response) => {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    }
}

export const authController = new AuthController();