import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        product: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("../../lib/prisma.js", () => ({
    default: mockPrisma,
}));

// ──────────────────────────────────────────────
// Imports
// ──────────────────────────────────────────────
import app from "../../app.js";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const TEST_PRODUCT_ID = randomUUID();

function buildVariantDetail(overrides: Partial<{
    id: string;
    productId: string;
    attributes: Record<string, string>;
    price: number | string;
    stock: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}> = {}) {
    return {
        id: overrides.id ?? randomUUID(),
        productId: overrides.productId ?? TEST_PRODUCT_ID,
        attributes: overrides.attributes ?? { size: "M", color: "Black" },
        price: overrides.price ?? 49.99,
        stock: overrides.stock ?? 15,
        isActive: overrides.isActive ?? true,
        createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: overrides.updatedAt ?? new Date("2026-01-01T00:00:00.000Z"),
    };
}

function buildProductDetail(overrides: Partial<{
    id: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    variants: Array<ReturnType<typeof buildVariantDetail>>;
}> = {}) {
    return {
        id: overrides.id ?? TEST_PRODUCT_ID,
        name: overrides.name ?? "Essential Hoodie",
        description: overrides.description ?? "Heavyweight French terry hoodie with custom ribbing.",
        images: overrides.images ?? [
            "https://images.unsplash.com/photo-hoodie-1.jpg",
            "https://images.unsplash.com/photo-hoodie-2.jpg",
        ],
        category: overrides.category ?? "Hoodies",
        isActive: overrides.isActive ?? true,
        createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: overrides.updatedAt ?? new Date("2026-01-01T00:00:00.000Z"),
        variants: overrides.variants ?? [
            buildVariantDetail({
                id: "variant-in-stock-1",
                attributes: { size: "M", color: "Black" },
                stock: 15,
                price: 49.99,
            }),
            buildVariantDetail({
                id: "variant-out-of-stock-1",
                attributes: { size: "L", color: "Black" },
                stock: 0,
                price: 54.99,
            }),
        ],
    };
}

// ──────────────────────────────────────────────
// Tests: Story 4.3 — Product Detail API
// ──────────────────────────────────────────────

describe("GET /api/products/:id", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when a valid UUID for an active product is provided (AC-1)", () => {
        it("should return 200 with complete ProductDetailDTO envelope", async () => {
            const product = buildProductDetail();
            mockPrisma.product.findUnique.mockResolvedValue(product);

            const res = await request(app)
                .get(`/api/products/${product.id}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
            expect(res.body.data).toEqual({
                id: product.id,
                name: "Essential Hoodie",
                description: "Heavyweight French terry hoodie with custom ribbing.",
                images: [
                    "https://images.unsplash.com/photo-hoodie-1.jpg",
                    "https://images.unsplash.com/photo-hoodie-2.jpg",
                ],
                category: "Hoodies",
                variants: [
                    {
                        id: "variant-in-stock-1",
                        attributes: { size: "M", color: "Black" },
                        price: 49.99,
                        stockStatus: "In Stock",
                    },
                    {
                        id: "variant-out-of-stock-1",
                        attributes: { size: "L", color: "Black" },
                        price: 54.99,
                        stockStatus: "Out of Stock",
                    },
                ],
                averageRating: null,
                reviewCount: 0,
            });

            expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
                where: { id: product.id },
                include: {
                    variants: {
                        where: { isActive: true },
                        orderBy: { createdAt: "asc" },
                    },
                },
            });
        });

        it("should preserve the array order of product images", async () => {
            const orderedImages = [
                "https://example.com/front.jpg",
                "https://example.com/back.jpg",
                "https://example.com/detail.jpg",
            ];
            const product = buildProductDetail({ images: orderedImages });
            mockPrisma.product.findUnique.mockResolvedValue(product);

            const res = await request(app)
                .get(`/api/products/${product.id}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data.images).toEqual(orderedImages);
        });
    });

    describe("stock status masking (AC-2)", () => {
        it("should expose 'In Stock' when variant stock is greater than 0", async () => {
            const product = buildProductDetail({
                variants: [
                    buildVariantDetail({ stock: 5 }),
                ],
            });
            mockPrisma.product.findUnique.mockResolvedValue(product);

            const res = await request(app)
                .get(`/api/products/${product.id}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data.variants[0].stockStatus).toBe("In Stock");
        });

        it("should expose 'Out of Stock' when variant stock is 0 or less", async () => {
            const product = buildProductDetail({
                variants: [
                    buildVariantDetail({ id: "v-zero", stock: 0 }),
                    buildVariantDetail({ id: "v-neg", stock: -1 }),
                ],
            });
            mockPrisma.product.findUnique.mockResolvedValue(product);

            const res = await request(app)
                .get(`/api/products/${product.id}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data.variants[0].stockStatus).toBe("Out of Stock");
            expect(res.body.data.variants[1].stockStatus).toBe("Out of Stock");
        });

        it("should never expose exact integer stock counts in any variant object", async () => {
            const product = buildProductDetail({
                variants: [
                    buildVariantDetail({ stock: 42 }),
                ],
            });
            mockPrisma.product.findUnique.mockResolvedValue(product);

            const res = await request(app)
                .get(`/api/products/${product.id}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data.variants[0]).not.toHaveProperty("stock");
        });
    });

    describe("when the product does not exist (AC-3)", () => {
        it("should return 404 with NOT_FOUND error code", async () => {
            const nonExistentId = randomUUID();
            mockPrisma.product.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .get(`/api/products/${nonExistentId}`)
                .send();

            expect(res.status).toBe(404);
            expect(res.body.error).toBeDefined();
            expect(res.body.error.code).toBe("NOT_FOUND");
            expect(res.body.error.message).toMatch(/product not found/i);
        });
    });

    describe("when the product is inactive (soft-deleted) (AC-3)", () => {
        it("should return 404 with NOT_FOUND error code", async () => {
            const inactiveProduct = buildProductDetail({ isActive: false });
            mockPrisma.product.findUnique.mockResolvedValue(inactiveProduct);

            const res = await request(app)
                .get(`/api/products/${inactiveProduct.id}`)
                .send();

            expect(res.status).toBe(404);
            expect(res.body.error).toBeDefined();
            expect(res.body.error.code).toBe("NOT_FOUND");
            expect(res.body.error.message).toMatch(/product not found/i);
        });
    });

    describe("inactive variants filtering (AC-4)", () => {
        it("should include isActive: true and orderBy createdAt: asc in Prisma query", async () => {
            const product = buildProductDetail();
            mockPrisma.product.findUnique.mockResolvedValue(product);

            await request(app)
                .get(`/api/products/${product.id}`)
                .send();

            expect(mockPrisma.product.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: {
                        variants: {
                            where: { isActive: true },
                            orderBy: { createdAt: "asc" },
                        },
                    },
                }),
            );
        });
    });

    describe("invalid UUID validation (AC-5)", () => {
        it("should return 422 validation error when product id is not a valid UUID", async () => {
            const res = await request(app)
                .get("/api/products/not-a-valid-uuid")
                .send();

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
            expect(res.body.error.code).toBe("VALIDATION_ERROR");
            expect(mockPrisma.product.findUnique).not.toHaveBeenCalled();
        });

        it("should return 422 when product id is a numeric ID instead of UUID", async () => {
            const res = await request(app)
                .get("/api/products/12345")
                .send();

            expect(res.status).toBe(422);
            expect(res.body.error).toBeDefined();
            expect(mockPrisma.product.findUnique).not.toHaveBeenCalled();
        });
    });

    describe("decimal price conversion (AC-6)", () => {
        it("should safely convert Prisma Decimal prices to JavaScript numbers", async () => {
            const product = buildProductDetail({
                variants: [
                    buildVariantDetail({ price: "79.95" as any }),
                ],
            });
            mockPrisma.product.findUnique.mockResolvedValue(product);

            const res = await request(app)
                .get(`/api/products/${product.id}`)
                .send();

            expect(res.status).toBe(200);
            expect(typeof res.body.data.variants[0].price).toBe("number");
            expect(res.body.data.variants[0].price).toBe(79.95);
        });
    });

    describe("rating placeholders (AC-7)", () => {
        it("should return averageRating as null and reviewCount as 0", async () => {
            const product = buildProductDetail();
            mockPrisma.product.findUnique.mockResolvedValue(product);

            const res = await request(app)
                .get(`/api/products/${product.id}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.data.averageRating).toBeNull();
            expect(res.body.data.reviewCount).toBe(0);
        });
    });
});
