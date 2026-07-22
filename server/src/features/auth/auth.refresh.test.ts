import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

vi.mock("../../lib/prisma.js", () => ({
    default: {
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
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));


import app from "../../app.js";
import { config } from "../../config/index.js";
import bcrypt from "bcryptjs";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const TEST_USER_ID = randomUUID();
const TEST_TOKEN_ID = randomUUID();

/** Create a valid, signed refresh token JWT */
async function createRefreshToken(
    payload: { userId: string; tokenId: string },
    options?: jwt.SignOptions,
) {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: options?.expiresIn ?? "7d",
    });
}

/** Create an expired refresh token JWT */
async function createExpiredRefreshToken(payload: {
    userId: string;
    tokenId: string;
}) {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: "0s",
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

describe("POST /api/auth/refresh", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("health check", () => {
        it("should return 200 with ok message", async () => {
            const res = await request(app).get("/api/health").send();

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBeDefined();
            expect(res.body.data.status).toMatch("ok");
        })
    });

    describe("when no refresh token cookie is present", () => {
        it("should return 401 with UNAUTHORIZED code", async () => {
            const res = await request(app)
                .post("/api/auth/refresh")
                .send()

            expect(res.status).toBe(401);
            expect(res.body.error).toBeDefined();
            expect(res.body.error.code).toMatch("UNAUTHORIZED")
        })
    });

    describe("when the refresh token is expired", () => {
        it("should return 401 and clear the refresh token cookie", async () => {
            const expiredToken = await createExpiredRefreshToken({
                userId: TEST_USER_ID,
                tokenId: TEST_TOKEN_ID,
            });

            // waiting for token to expire.
            await new Promise((r) => setTimeout(r, 50));

            const res = await request(app)
                .post("/api/auth/refresh")
                .set("Cookie", `refreshToken=${expiredToken}`)
                .send();

            expect(res.status).toBe(401);
            expect(res.body.error).toBeDefined();

            const cookies = res.headers["set-cookie"];

            if (cookies) {
                const cookieStr = Array.isArray(cookies) ? cookies.join(";") : cookies;

                expect(cookieStr).toMatch(/refreshToken=;|refreshToken=\s*;|Max-Age=0|Expires=Thu, 01 Jan 1970/i);
            }
        })
    })
});