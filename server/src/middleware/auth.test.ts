import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

// ──────────────────────────────────────────────
// Mocks — MUST be declared before app import
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

vi.mock("../lib/prisma.js", () => ({
    default: mockPrisma,
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

// ──────────────────────────────────────────────
// Imports — AFTER mocks
// ──────────────────────────────────────────────
import app from "../app.ts";
import { config } from "../config/index.ts";
import bcrypt from "bcryptjs";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const TEST_USER_ID = randomUUID();

/** Create a valid, signed access token JWT */
function createAccessToken(
    payload: { userId: string; role: string },
    options?: jwt.SignOptions,
): string {
    return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: options?.expiresIn ?? "15m",
    });
}

/** Create an expired access token JWT */
function createExpiredAccessToken(payload: {
    userId: string;
    role: string;
}): string {
    return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: "0s",
    });
}

/** Create a valid, signed refresh token JWT */
function createRefreshToken(
    payload: { userId: string; tokenId: string },
    options?: jwt.SignOptions,
): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: options?.expiresIn ?? "7d",
    });
}

/** Build a fake User DB record */
function buildUser(overrides: Partial<{
    id: string;
    email: string;
    name: string;
    role: string;
    passwordHash: string;
}> = {}) {
    return {
        id: overrides.id ?? TEST_USER_ID,
        email: overrides.email ?? "user@example.com",
        name: overrides.name ?? "Test User",
        role: overrides.role ?? "CUSTOMER",
        passwordHash: overrides.passwordHash ?? "hashed-password",
    };
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

describe("authentication middleware", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when no Authorization header is present", () => {
        it("should call next with an UnauthorizedError", async () => {
            const { authenticate } = await import("./auth.js");

            const req = { headers: {} } as any;
            const res = {} as any;
            const next = vi.fn();


            await authenticate(req, res, next);

            expect(next).toHaveBeenCalledOnce();

            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(401);
        });
    });

    describe("when the Authorization header does not start with Bearer", () => {
        it("should call next with UnauthorizedError", async () => {
            const { authenticate } = await import("./auth.js");

            const req = { headers: { authorization: "Basic 12312sadqw4" } } as any;
            const res = {} as any;
            const next = vi.fn();

            await authenticate(req, res, next);

            expect(next).toHaveBeenCalledOnce();
            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(401);
        });
    });

    describe("when provided with an invalid/ expired JWT", () => {
        it("should call next with an UnauthorizedError with the message Invalid Token when token is invalid", async () => {
            const { authenticate } = await import("./auth.js");

            const req = { headers: { authorization: "Bearer invalid-jwt-token" } } as any;
            const res = {} as any;
            const next = vi.fn();

            await authenticate(req, res, next);

            expect(next).toHaveBeenCalledOnce();
            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(401);
            expect(error.message).toBe("Invalid Token")
        });

        it("should call next with UnauthorizedError with the message Invalid Token when token is expired", async () => {
            const { authenticate } = await import("./auth.js");

            const expiredToken = createExpiredAccessToken({ userId: TEST_USER_ID, role: "CUSTOMER" });

            await new Promise((r) => setTimeout(r, 50));

            const req = { headers: { authorization: `Bearer ${expiredToken}` } } as any;
            const res = {} as any;
            const next = vi.fn();

            await authenticate(req, res, next);

            expect(next).toHaveBeenCalledOnce();
            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(401);
            expect(error.message).toBe("Invalid Token")
        });
    });

    describe("when the JWT is valid but the user does not exist in the database", () => {
        it("should call next with an UnauthorizedError", async () => {
            const { authenticate } = await import("./auth.js");

            const accessToken = createAccessToken({ userId: TEST_USER_ID, role: "CUSTOMER" });

            mockPrisma.user.findUnique.mockResolvedValue(null);

            const req = {
                headers: { authorization: `Bearer ${accessToken}` },
            } as any;
            const res = {} as any;
            const next = vi.fn();

            await authenticate(req, res, next);

            expect(next).toHaveBeenCalledOnce();
            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(401);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: TEST_USER_ID },
            });
        });
    });

    describe("when the JWT role does not match the database role", () => {
        it("should call next with a ForbiddenError", async () => {
            const { authenticate } = await import("./auth.js");

            // JWT claims ADMIN
            const token = createAccessToken({
                userId: TEST_USER_ID,
                role: "ADMIN",
            });

            // DB says CUSTOMER
            mockPrisma.user.findUnique.mockResolvedValue(
                buildUser({ id: TEST_USER_ID, role: "CUSTOMER" }),
            );

            const req = {
                headers: { authorization: `Bearer ${token}` },
            } as any;
            const res = {} as any;
            const next = vi.fn();

            await authenticate(req, res, next);

            expect(next).toHaveBeenCalledOnce();
            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(403);
        });
    });

    describe("when the JWT is valid and the DB user matches", () => {
        it("should attach req.user and call next() with no error", async () => {
            const { authenticate } = await import("./auth.js");

            const token = createAccessToken({
                userId: TEST_USER_ID,
                role: "CUSTOMER",
            });

            const dbUser = buildUser({
                id: TEST_USER_ID,
                email: "user@example.com",
                role: "CUSTOMER",
            });

            mockPrisma.user.findUnique.mockResolvedValue(dbUser);

            const req = {
                headers: { authorization: `Bearer ${token}` },
            } as any;
            const res = {} as any;
            const next = vi.fn();

            await authenticate(req, res, next);

            // next() called with no arguments = success
            expect(next).toHaveBeenCalledOnce();
            expect(next).toHaveBeenCalledWith();

            expect(req.user).toEqual({
                id: TEST_USER_ID,
                email: "user@example.com",
                role: "CUSTOMER",
            });
        });
    });
});

describe("requireRole middleware", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when the user's role is in the allowed list", () => {
        it("should call next() with no error", async () => {
            const { requireRole } = await import("./auth.js");

            const middleware = await requireRole("ADMIN", "CUSTOMER");

            const req = {
                user: { id: TEST_USER_ID, email: "user@example.com", role: "ADMIN" },
            } as any;
            const res = {} as any;
            const next = vi.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalledOnce();
            expect(next).toHaveBeenCalledWith();
        });
    });

    describe("when the user's role is NOT in the allowed list", () => {
        it("should call next with a ForbiddenError", async () => {
            const { requireRole } = await import("./auth.js");

            const middleware = requireRole("ADMIN");

            const req = {
                user: { id: TEST_USER_ID, email: "user@example.com", role: "CUSTOMER" },
            } as any;
            const res = {} as any;
            const next = vi.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalledOnce();
            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(403);
        });
    });

    describe("when req.user is missing (unauthenticated)", () => {
        it("should call next with a ForbiddenError", async () => {
            const { requireRole } = await import("./auth.js");

            const middleware = requireRole("ADMIN");

            const req = {} as any; // no user property
            const res = {} as any;
            const next = vi.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalledOnce();
            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(403);
        });
    });
});