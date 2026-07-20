import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { ConflictError } from "../../types/app-error.js";
import { authRepository } from "./auth.repository.js";
import { config } from "../../config/index.js";

class AuthService {
    register = async (data: { email: string, password: string, name: string }) => {
        const existingUser = await authRepository.findUserByEmail(data.email);

        if (existingUser) {
            throw new ConflictError(
                "A user with this email already exist",
                "DUPLICATE_EMAIL"
            );
        }

        const passwordHash = await bcrypt.hash(data.password, config.BCRYPT_SALT_ROUNDS);

        let user;

        try {
            user = await authRepository.createUser({ email: data.email, passwordHash, name: data.name });
        } catch (error) {
            throw error
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_ACCESS_EXPIRY }
        )

        const refreshToken = jwt.sign(
            { userId: user.id, tokenId: randomUUID() },
            config.JWT_REFRESH_SECRET,
            { expiresIn: config.JWT_REFRESH_EXPIRY_DAYS }
        )

        const hashedRefreshToken = await bcrypt.hash(refreshToken, config.BCRYPT_SALT_ROUNDS);

        const expiersAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        try {
            await authRepository.createRefreshToken({
                tokenHash: hashedRefreshToken,
                userId: user.id,
                expiresAt: expiersAt
            });
        } catch (error) {
            throw error
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            accessToken,
            refreshToken
        }
    }
}

export const authService = new AuthService();