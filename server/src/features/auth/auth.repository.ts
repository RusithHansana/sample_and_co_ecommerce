import prisma from "../../lib/prisma.js";
import type { Prisma, RefreshToken, User } from "../../generated/prisma/client.js";

type TxClient = Prisma.TransactionClient;

class AuthRepository {
    findUserByEmail = (email: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { email } });
    }

    findUserById = (id: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { id } });
    }

    createUser = (data: { id: string, email: string, passwordHash: string, name: string }, tx?: TxClient): Promise<User> => {
        const client = tx ?? prisma;

        return client.user.create({
            data: {
                id: data.id,
                email: data.email,
                passwordHash: data.passwordHash,
                name: data.name,
                role: "CUSTOMER"
            }
        });
    }

    createRefreshToken = (data: { id: string, tokenHash: string, userId: string, expiresAt: Date }, tx?: TxClient): Promise<RefreshToken> => {
        const client = tx ?? prisma;

        return client.refreshToken.create({
            data: {
                id: data.id,
                tokenHash: data.tokenHash,
                userId: data.userId,
                expiresAt: data.expiresAt
            }
        });
    }

    findRefreshTokenById = (tokenId: string): Promise<RefreshToken | null> => {
        return prisma.refreshToken.findUnique({
            where: {
                id: tokenId,
            }
        });
    }

    revokeRefreshToken = (tokenId: string, tx?: TxClient): Promise<RefreshToken> => {
        const client = tx ?? prisma;

        return client.refreshToken.update({
            where: { id: tokenId },
            data: { isRevoked: true }
        });
    }

    revokeAllUserRefreshTokens = (userId: string, tx?: TxClient) => {
        const client = tx ?? prisma;

        return client.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true }
        })
    }
}

export const authRepository = new AuthRepository();