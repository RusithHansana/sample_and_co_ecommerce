import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

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
        }
    }
});

vi.mock("../../lib/prisma.js", () => ({
    default: mockPrisma
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
function createRefreshToken(
    payload: { userId: string; tokenId: string },
    options?: jwt.SignOptions,
): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: options?.expiresIn ?? "7d",
    });
}

/** Create an expired refresh token JWT */
function createExpiredRefreshToken(payload: {
    userId: string;
    tokenId: string;
}): string {
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
            const expiredToken = createExpiredRefreshToken({
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
    });

    describe("when the JWT is valid but no matching token exists in DB", () => {
        it("should return 401", async () => {
            const rawRefreshToken = createRefreshToken({
                userId: TEST_USER_ID,
                tokenId: TEST_TOKEN_ID
            });

            mockPrisma.refreshToken.findMany.mockResolvedValue([
                buildStoredToken({ userId: TEST_USER_ID })
            ]);

            (bcrypt.compare as Mock).mockResolvedValue(false);

            const res = await request(app)
                .post("/api/auth/refresh")
                .set("Cookie", `refreshToken=${rawRefreshToken}`)
                .send();

            expect(res.status).toBe(401);
            expect(res.body.error).toBeDefined();
        })
    });

    describe("when a valid, non-revoked refresh token is presented", () => {
        it("should return 200 with a new access token and set a new refresh token cookie", async () => {
            const rawRefreshToken = createRefreshToken({
                userId: TEST_USER_ID,
                tokenId: TEST_TOKEN_ID,
            });

            const storedToken = buildStoredToken({
                userId: TEST_USER_ID,
                isRevoked: false,
            });

            mockPrisma.user.findUnique.mockResolvedValue({
                id: TEST_USER_ID,
                email: "test@example.com",
                name: "Test User",
                role: "CUSTOMER",
            });

            mockPrisma.refreshToken.findMany.mockResolvedValue([storedToken]);

            (bcrypt.compare as Mock).mockResolvedValue(true);

            (bcrypt.hash as Mock).mockResolvedValue("new-hashed-token");

            mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
                return fn(mockPrisma);
            });

            mockPrisma.refreshToken.update.mockResolvedValue({
                ...storedToken,
                isRevoked: true,
            });

            mockPrisma.refreshToken.create.mockResolvedValue(
                buildStoredToken({ tokenHash: "new-hashed-token" }),
            );

            const res = await request(app)
                .post("/api/auth/refresh")
                .set("Cookie", `refreshToken=${rawRefreshToken}`)
                .send();

            expect(res.status).toBe(200);

            expect(res.body.data).toBeDefined();
            expect(res.body.data.accessToken).toBeDefined();
            expect(typeof res.body.data.accessToken).toBe("string");

            const cookies = res.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookieStr = Array.isArray(cookies)
                ? cookies.join("; ")
                : cookies;
            expect(cookieStr).toContain("refreshToken=");
            expect(cookieStr).toContain("HttpOnly");
        });
    });
});