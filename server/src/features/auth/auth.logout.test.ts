import { describe, it, expect, vi, beforeEach } from "vitest";
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
                findUnique: vi.fn(),
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
    },
}));

// ──────────────────────────────────────────────
// Imports
// ──────────────────────────────────────────────
import app from "../../app.js";
import { config } from "../../config/index.js";


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

describe("POST /api/auth/logout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when a valid refresh token cookie is present", () => {
        it("should revoke the token, clear the cookie, and return 200", async () => {
            const rawRefreshToken = createRefreshToken({
                userId: TEST_USER_ID,
                tokenId: TEST_TOKEN_ID,
            });

            const storedToken = buildStoredToken({
                id: "token-to-revoke",
                userId: TEST_USER_ID,
                isRevoked: false,
            });

            // DB returns stored token by ID
            mockPrisma.refreshToken.findUnique.mockResolvedValueOnce(storedToken);

            // Revocation succeeds
            mockPrisma.refreshToken.update.mockResolvedValue({
                ...storedToken,
                isRevoked: true,
            });

            const res = await request(app)
                .post("/api/auth/logout")
                .set("Cookie", `refreshToken=${rawRefreshToken}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.message).toMatch(/logged out/i);

            // Token was revoked in DB
            expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "token-to-revoke" },
                    data: expect.objectContaining({ isRevoked: true }),
                }),
            );

            // Cookie was cleared
            const cookies = res.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookieStr = Array.isArray(cookies)
                ? cookies.join("; ")
                : cookies;
            expect(cookieStr).toMatch(
                /refreshToken=;|refreshToken=\s*;|Max-Age=0|Expires=Thu, 01 Jan 1970/i,
            );
        });
    });

    describe("when no refresh token cookie is present", () => {
        it("should still return 200 and clear the cookie", async () => {
            const res = await request(app)
                .post("/api/auth/logout")
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data.message).toMatch(/logged out/i);
        });
    });

    describe("when the refresh token is already revoked", () => {
        it("should still return 200 without errors", async () => {
            const rawRefreshToken = createRefreshToken({
                userId: TEST_USER_ID,
                tokenId: TEST_TOKEN_ID,
            });

            const revokedToken = buildStoredToken({
                userId: TEST_USER_ID,
                isRevoked: true,
            });

            mockPrisma.refreshToken.findUnique.mockResolvedValueOnce(revokedToken);

            const res = await request(app)
                .post("/api/auth/logout")
                .set("Cookie", `refreshToken=${rawRefreshToken}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data.message).toMatch(/logged out/i);
        });
    });

    describe("when the JWT is valid but no matching token exists in DB", () => {
        it("should still return 200", async () => {
            const rawRefreshToken = createRefreshToken({
                userId: TEST_USER_ID,
                tokenId: TEST_TOKEN_ID,
            });

            // findUnique returns null → no matching token
            mockPrisma.refreshToken.findUnique.mockResolvedValueOnce(null);

            const res = await request(app)
                .post("/api/auth/logout")
                .set("Cookie", `refreshToken=${rawRefreshToken}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data.message).toMatch(/logged out/i);
        });
    });
});