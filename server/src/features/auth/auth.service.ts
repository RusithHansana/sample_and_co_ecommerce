import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
import { ConflictError, UnauthorizedError } from "../../types/app-error.js";
import { authRepository } from "./auth.repository.js";
import { config } from "../../config/index.js";
import prisma from "../../lib/prisma.js";

interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
}

class AuthService {
    private hashToken = (token: string): string => {
        return createHash('sha256').update(token).digest("hex");
    }

    register = async (data: { email: string, password: string, name: string }) => {
        const existingUser = await authRepository.findUserByEmail(data.email);

        if (existingUser) {
            throw new ConflictError(
                "A user with this email already exists.",
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

        const tokenId = randomUUID();

        const refreshToken = jwt.sign(
            { userId, tokenId },
            config.JWT_REFRESH_SECRET,
            { expiresIn: config.JWT_REFRESH_EXPIRY }
        )

        const hashedRefreshToken = this.hashToken(refreshToken);

        const expiresAt = new Date(Date.now() + config.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        const user = await prisma.$transaction(async (tx) => {
            const createdUser = await authRepository.createUser({
                id: userId,
                email: data.email,
                passwordHash,
                name: data.name
            }, tx);

            await authRepository.createRefreshToken({
                id: tokenId,
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
            throw new UnauthorizedError("Invalid email or password.");
        }

        const isValid = await bcrypt.compare(data.password, user.passwordHash);

        if (!isValid) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_ACCESS_EXPIRY }
        );

        const tokenId = randomUUID();

        const refreshToken = jwt.sign(
            { userId: user.id, tokenId },
            config.JWT_REFRESH_SECRET,
            { expiresIn: config.JWT_REFRESH_EXPIRY }
        );

        const hashedRefreshToken = this.hashToken(refreshToken);

        const expiresAt = new Date(Date.now() + config.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        await authRepository.createRefreshToken({
            id: tokenId,
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

    refreshTokens = async (rawToken: string) => {
        try {
            let payload: RefreshTokenPayload;

            try {
                payload = jwt.verify(rawToken, config.JWT_REFRESH_SECRET) as RefreshTokenPayload;
            } catch (err) {
                throw new UnauthorizedError("Invalid Token", "INVALID_TOKEN");
            }

            if (!payload.userId || !payload.tokenId) {
                throw new UnauthorizedError("Invalid Token", "INVALID_TOKEN");
            }

            let matchedToken = await authRepository.findRefreshTokenById(payload.tokenId);

            if (!matchedToken) {
                throw new UnauthorizedError("Invalid Token", "INVALID_TOKEN");
            }

            if (matchedToken.expiresAt < new Date()) {
                await authRepository.revokeRefreshToken(matchedToken.id);
                throw new UnauthorizedError("Invalid Token", "INVALID_TOKEN");
            }

            if (matchedToken.isRevoked) {
                await authRepository.revokeAllUserRefreshTokens(matchedToken.userId);
                throw new UnauthorizedError("Invalid Token", "INVALID_TOKEN");
            }

            const user = await authRepository.findUserById(matchedToken.userId);

            if (!user) {
                throw new UnauthorizedError("Invalid Token", "INVALID_TOKEN");
            }

            const newAccessToken = jwt.sign(
                { userId: user.id, role: user.role },
                config.JWT_SECRET,
                { expiresIn: config.JWT_ACCESS_EXPIRY }
            )

            const tokenId = randomUUID();

            const newRefreshToken = jwt.sign(
                { userId: user.id, tokenId },
                config.JWT_REFRESH_SECRET,
                { expiresIn: config.JWT_REFRESH_EXPIRY }
            )

            const hashedRefreshToken = this.hashToken(newRefreshToken);

            const expiresAt = new Date(Date.now() + config.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);


            await prisma.$transaction(async (tx) => {
                await authRepository.revokeRefreshToken(matchedToken.id, tx);

                await authRepository.createRefreshToken({
                    id: tokenId,
                    tokenHash: hashedRefreshToken,
                    userId: user.id,
                    expiresAt
                }, tx);
            });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            }
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                throw err;
            }
            throw err;
        }
    }

    logout = async (rawToken: string) => {
        let payload: RefreshTokenPayload;

        try {
            payload = jwt.verify(rawToken, config.JWT_REFRESH_SECRET) as RefreshTokenPayload
        } catch {
            return;
        }

        const refreshToken = await authRepository.findRefreshTokenById(payload.tokenId);

        if (!refreshToken) return;

        if (!refreshToken.isRevoked) {
            await authRepository.revokeRefreshToken(refreshToken.id)
        }

        return;
    }

    me = async (userId: string) => {
        const user = await authRepository.findUserById(userId);

        if (!user) {
            throw new UnauthorizedError("User not found.");
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    }
}

export const authService = new AuthService();