import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        product: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
        },
        $queryRaw: vi.fn(),
    },
}));

vi.mock("../../lib/prisma.js", () => ({
    default: mockPrisma,
}));

// ──────────────────────────────────────────────
// Imports
// ──────────────────────────────────────────────
import app from "../../app.ts";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function buildProduct(overrides: Partial<{
    id: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    variants: Array<{ price: number | string }>;
}> = {}) {
    return {
        id: overrides.id ?? randomUUID(),
        name: overrides.name ?? "Classic Crew Tee",
        description: overrides.description ?? "Premium heavyweight cotton t-shirt with a relaxed fit.",
        images: overrides.images ?? [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
        ],
        category: overrides.category ?? "T-Shirts",
        isActive: overrides.isActive ?? true,
        createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: overrides.updatedAt ?? new Date("2026-01-01T00:00:00.000Z"),
        variants: overrides.variants ?? [
            { price: 24.99 },
            { price: 29.99 },
        ],
    };
}

// ──────────────────────────────────────────────
// Tests: Story 4.2 — Product Listing API
// ──────────────────────────────────────────────

describe("GET /api/products", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when no filters are provided (default listing)", () => {
        it("should return 200 with default pagination and shaped product list items", async () => {
            const product1 = buildProduct({
                name: "Essential Hoodie",
                category: "Hoodies",
                variants: [{ price: 49.99 }, { price: 54.99 }],
            });
            const product2 = buildProduct({
                name: "Classic Crew Tee",
                category: "T-Shirts",
                images: ["https://images.unsplash.com/photo-tee.jpg"],
                variants: [{ price: 24.99 }],
            });

            mockPrisma.product.count.mockResolvedValue(2);
            mockPrisma.product.findMany.mockResolvedValue([product1, product2]);

            const res = await request(app)
                .get("/api/products")
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.pagination).toEqual({
                page: 1,
                pageSize: 12,
                total: 2,
            });

            // Verify first item DTO mapping
            expect(res.body.data[0]).toEqual({
                id: product1.id,
                name: "Essential Hoodie",
                primaryImage: product1.images[0],
                category: "Hoodies",
                priceRange: { min: 49.99, max: 54.99 },
                averageRating: 0,
                reviewCount: 0,
            });

            // Verify Prisma call parameters
            expect(mockPrisma.product.count).toHaveBeenCalledWith({
                where: { isActive: true },
            });
            expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
                where: { isActive: true },
                include: {
                    variants: {
                        where: { isActive: true },
                        select: { price: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: 0,
                take: 12,
            });
        });

        it("should return an empty string for primaryImage when images array is empty", async () => {
            const productWithoutImages = buildProduct({
                images: [],
                variants: [{ price: 19.99 }],
            });

            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([productWithoutImages]);

            const res = await request(app)
                .get("/api/products")
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data[0].primaryImage).toBe("");
        });
    });

    describe("price range calculation", () => {
        it("should calculate correct min and max when variants have different prices", async () => {
            const product = buildProduct({
                variants: [{ price: 34.5 }, { price: 19.99 }, { price: 49.0 }],
            });

            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([product]);

            const res = await request(app)
                .get("/api/products")
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data[0].priceRange).toEqual({ min: 19.99, max: 49.0 });
        });

        it("should return min === max when product has only one variant", async () => {
            const product = buildProduct({
                variants: [{ price: 29.99 }],
            });

            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([product]);

            const res = await request(app)
                .get("/api/products")
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data[0].priceRange).toEqual({ min: 29.99, max: 29.99 });
        });

        it("should return min: 0, max: 0 when product has no active variants", async () => {
            const product = buildProduct({
                variants: [],
            });

            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([product]);

            const res = await request(app)
                .get("/api/products")
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data[0].priceRange).toEqual({ min: 0, max: 0 });
        });
    });

    describe("category filter", () => {
        it("should filter by category with case-insensitive equals", async () => {
            const product = buildProduct({ category: "Hoodies" });

            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([product]);

            const res = await request(app)
                .get("/api/products?category=Hoodies")
                .send();

            expect(res.status).toBe(200);
            expect(mockPrisma.product.count).toHaveBeenCalledWith({
                where: {
                    isActive: true,
                    AND: [
                        { category: { equals: "Hoodies", mode: "insensitive" } },
                    ],
                },
            });
        });

        it("should apply case-insensitive matching when category query is lowercase", async () => {
            const product = buildProduct({ category: "Hoodies" });

            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([product]);

            const res = await request(app)
                .get("/api/products?category=hoodies")
                .send();

            expect(res.status).toBe(200);
            expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        isActive: true,
                        AND: [
                            { category: { equals: "hoodies", mode: "insensitive" } },
                        ],
                    },
                }),
            );
        });

        it("should return empty data and 0 total when no products match the category", async () => {
            mockPrisma.product.count.mockResolvedValue(0);
            mockPrisma.product.findMany.mockResolvedValue([]);

            const res = await request(app)
                .get("/api/products?category=NonExistent")
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
            expect(res.body.pagination).toEqual({
                page: 1,
                pageSize: 12,
                total: 0,
            });
        });
    });

    describe("text search filter", () => {
        it("should search name and description case-insensitively with OR condition", async () => {
            const product = buildProduct({ name: "Essential Hoodie" });

            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([product]);

            const res = await request(app)
                .get("/api/products?search=hoodie")
                .send();

            expect(res.status).toBe(200);
            expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        isActive: true,
                        AND: [
                            {
                                OR: [
                                    { name: { contains: "hoodie", mode: "insensitive" } },
                                    { description: { contains: "hoodie", mode: "insensitive" } },
                                ],
                            },
                        ],
                    },
                }),
            );
        });
    });

    describe("attribute filtering (JSONB)", () => {
        it("should query raw SQL with JSON containment and filter by returned product IDs", async () => {
            const matchedProductId = randomUUID();
            mockPrisma.$queryRaw.mockResolvedValue([{ id: matchedProductId }]);

            const product = buildProduct({ id: matchedProductId });
            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([product]);

            const res = await request(app)
                .get("/api/products?attributes%5Bsize%5D=M")
                .send();

            expect(res.status).toBe(200);
            expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
            expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        isActive: true,
                        AND: [
                            { id: { in: [matchedProductId] } },
                        ],
                    },
                }),
            );
        });

        it("should handle multiple attributes with AND logic", async () => {
            const matchedProductId = randomUUID();
            mockPrisma.$queryRaw.mockResolvedValue([{ id: matchedProductId }]);

            const product = buildProduct({ id: matchedProductId });
            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([product]);

            const res = await request(app)
                .get("/api/products?attributes%5Bsize%5D=M&attributes%5Bcolor%5D=Black")
                .send();

            expect(res.status).toBe(200);
            expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
            expect(res.body.data).toHaveLength(1);
        });

        it("should short-circuit and return empty data when no product IDs match attribute filters", async () => {
            mockPrisma.$queryRaw.mockResolvedValue([]);

            const res = await request(app)
                .get("/api/products?attributes%5Bsize%5D=XXXL")
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
            expect(res.body.pagination).toEqual({
                page: 1,
                pageSize: 12,
                total: 0,
            });

            // count and findMany should NOT be called on short-circuit
            expect(mockPrisma.product.count).not.toHaveBeenCalled();
            expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
        });
    });

    describe("pagination parameters", () => {
        it("should apply page and pageSize skip/take calculations", async () => {
            mockPrisma.product.count.mockResolvedValue(25);
            mockPrisma.product.findMany.mockResolvedValue([buildProduct(), buildProduct()]);

            const res = await request(app)
                .get("/api/products?page=3&pageSize=2")
                .send();

            expect(res.status).toBe(200);
            expect(res.body.pagination).toEqual({
                page: 3,
                pageSize: 2,
                total: 25,
            });

            // (page - 1) * pageSize = (3 - 1) * 2 = 4
            expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 4,
                    take: 2,
                }),
            );
        });
    });

    describe("combined filters", () => {
        it("should combine search, category, attributes, and pagination in a single query", async () => {
            const matchedId = randomUUID();
            mockPrisma.$queryRaw.mockResolvedValue([{ id: matchedId }]);

            const product = buildProduct({ id: matchedId, category: "T-Shirts" });
            mockPrisma.product.count.mockResolvedValue(1);
            mockPrisma.product.findMany.mockResolvedValue([product]);

            const res = await request(app)
                .get("/api/products?category=T-Shirts&search=crew&attributes%5Bcolor%5D=White&page=1&pageSize=5")
                .send();

            expect(res.status).toBe(200);
            expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        isActive: true,
                        AND: [
                            { category: { equals: "T-Shirts", mode: "insensitive" } },
                            {
                                OR: [
                                    { name: { contains: "crew", mode: "insensitive" } },
                                    { description: { contains: "crew", mode: "insensitive" } },
                                ],
                            },
                            { id: { in: [matchedId] } },
                        ],
                    },
                    skip: 0,
                    take: 5,
                }),
            );
        });
    });

    describe("validation errors", () => {
        it("should return 422 when page is less than 1", async () => {
            const res = await request(app)
                .get("/api/products?page=0")
                .send();

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
            expect(res.body.error.code).toBe("VALIDATION_ERROR");
        });

        it("should return 422 when page is negative", async () => {
            const res = await request(app)
                .get("/api/products?page=-1")
                .send();

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
        });

        it("should return 422 when pageSize exceeds 50", async () => {
            const res = await request(app)
                .get("/api/products?pageSize=100")
                .send();

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
        });

        it("should return 422 when pageSize is less than 1", async () => {
            const res = await request(app)
                .get("/api/products?pageSize=0")
                .send();

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
        });

        it("should return 422 when search query exceeds 200 characters", async () => {
            const longSearch = "a".repeat(201);
            const res = await request(app)
                .get(`/api/products?search=${longSearch}`)
                .send();

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
        });

        it("should return 422 when attributes parameter is an array instead of key-value object", async () => {
            const res = await request(app)
                .get("/api/products?attributes%5B%5D=invalid")
                .send();

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
        });

        it("should return 422 when an attribute key has an empty value", async () => {
            const res = await request(app)
                .get("/api/products?attributes%5Bsize%5D=")
                .send();

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
        });
    });
});
