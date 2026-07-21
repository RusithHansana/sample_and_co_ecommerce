import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { ConflictError, UnauthorizedError } from "../../types/app-error.js";
import { authRepository } from "./auth.repository.js";
import { config } from "../../config/index.js";
import prisma from "../../lib/prisma.js";

class AuthService {
    register = async (data: { email: string, password: string, name: string }) => {
        const existingUser = await authRepository.findUserByEmail(data.email);

        if (existingUser) {
            throw new ConflictError(
                "A user with this email already exists",
                "DUPLICATE_EMAIL"
            );
        }

        const userId = randomUUID();
        const role = "CUSTOMER"

        const passwordHash = await bcrypt.hash(data.password, config.BCRYPT_SALT_ROUNDS);

        const accessToken = jwt.sign(
            { userId, role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_ACCESS_EXPIRY }
        )

        const refreshToken = jwt.sign(
            { userId, tokenId: randomUUID() },
            config.JWT_REFRESH_SECRET,
            { expiresIn: config.JWT_REFRESH_EXPIRY }
        )

        const hashedRefreshToken = await bcrypt.hash(refreshToken, config.BCRYPT_SALT_ROUNDS);

        const expiresAt = new Date(Date.now() + config.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        const user = await prisma.$transaction(async (tx) => {
            const createdUser = await authRepository.createUser({
                id: userId,
                email: data.email,
                passwordHash,
                name: data.name
            }, tx);

            await authRepository.createRefreshToken({
                tokenHash: hashedRefreshToken,
                userId: createdUser.id,
                expiresAt
            }, tx);

            return createdUser;
        });

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

    login = async (data: { email: string, password: string }) => {
        const user = await authRepository.findUserByEmail(data.email);

        if (!user) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const isValid = bcrypt.compare(data.password, user.passwordHash);

        if (!isValid) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_ACCESS_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, tokenId: randomUUID() },
            config.JWT_REFRESH_SECRET,
            { expiresIn: config.JWT_REFRESH_EXPIRY }
        );

        const hashedRefreshToken = await bcrypt.hash(refreshToken, config.BCRYPT_SALT_ROUNDS);

        const expiresAt = new Date(Date.now() + config.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        await authRepository.createRefreshToken({
            tokenHash: hashedRefreshToken,
            userId: user.id,
            expiresAt
        });

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