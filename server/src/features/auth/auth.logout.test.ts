import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────

const { mockPrisma } = vi.hoisted(() => {
    return {
        mockPrisma: {
            user: {
                findUnique: vi.fn(),
                create: vi.fn(),
            },
            refreshToken: {
                create: vi.fn(),
                findMany: vi.fn(),
                update: vi.fn(),
                updateMany: vi.fn(),
            },
            $transaction: vi.fn(),
        },
    };
});

vi.mock("../../lib/prisma.js", () => ({
    default: mockPrisma,
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

// ──────────────────────────────────────────────
// Imports
// ──────────────────────────────────────────────
import app from "../../app.js";
import { config } from "../../config/index.js";
import bcrypt from "bcryptjs";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const TEST_USER_ID = randomUUID();
const TEST_TOKEN_ID = randomUUID();

/** Create a valid, signed refresh token JWT */
function createRefreshToken(
    payload: { userId: string; tokenId: string },
    options?: jwt.SignOptions,
): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: options?.expiresIn ?? "7d",
    });
}

/** Build a fake RefreshToken DB record */
function buildStoredToken(overrides: Partial<{
    id: string;
    tokenHash: string;
    userId: string;
    isRevoked: boolean;
    expiresAt: Date;
    createdAt: Date;
}> = {}) {
    return {
        id: overrides.id ?? randomUUID(),
        tokenHash: overrides.tokenHash ?? "hashed-token",
        userId: overrides.userId ?? TEST_USER_ID,
        isRevoked: overrides.isRevoked ?? false,
        expiresAt: overrides.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: overrides.createdAt ?? new Date(),
    };
}

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────