import prisma from "../../lib/prisma.js";
import type { RefreshToken, User } from "../../generated/prisma/client.js";

export function findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
}

export function createUser(data: { email: string, passwordHash: string, name: string }): Promise<User> {
    return prisma.user.create({
        data: {
            email: data.email,
            passwordHash: data.passwordHash,
            name: data.name,
            role: "CUSTOMER"
        }
    });
}

export function createRefreshToken(data: { tokenHash: string, userId: string, expiresAt: Date }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
        data: {
            tokenHash: data.tokenHash,
            userId: data.userId,
            expiresAt: data.expiresAt
        }
    });
}