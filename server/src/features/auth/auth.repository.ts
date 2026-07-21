import prisma from "../../lib/prisma.js";
import type { Prisma, RefreshToken, User } from "../../generated/prisma/client.js";

type TxClient = Prisma.TransactionClient;

class AuthRepository {
    findUserByEmail = (email: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { email } });
    }

    createUser = (data: { id: string, email: string, passwordHash: string, name: string }, tx: TxClient): Promise<User> => {
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

    createRefreshToken = (data: { tokenHash: string, userId: string, expiresAt: Date }, tx: TxClient): Promise<RefreshToken> => {
        const client = tx ?? prisma;

        return client.refreshToken.create({
            data: {
                tokenHash: data.tokenHash,
                userId: data.userId,
                expiresAt: data.expiresAt
            }
        });
    }
}

export const authRepository = new AuthRepository();