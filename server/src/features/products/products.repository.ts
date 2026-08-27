import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../lib/prisma.js";
import type { PaginationParams, ProductFilters } from "../../types/product.js";

class ProductsRepository {
    private buildWhereClause = (filters: ProductFilters, attributeMatchedIds?: string[]): Prisma.ProductWhereInput => {
        const where: Prisma.ProductWhereInput = {
            isActive: true,
        }

        const andConditions: Prisma.ProductWhereInput[] = [];

        if (filters.category) {
            andConditions.push({
                category: { equals: filters.category, mode: "insensitive" }
            });
        }

        if (filters.search) {
            andConditions.push({
                OR: [
                    { name: { contains: filters.search, mode: "insensitive" } },
                    { description: { contains: filters.search, mode: "insensitive" } }
                ]
            });
        }

        if (attributeMatchedIds) {
            andConditions.push({
                id: { in: attributeMatchedIds }
            })
        }

        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        return where;
    }

    findProductIdsByAttributes = async (attributes: Record<string, string>): Promise<string[]> => {
        const jsonValue = JSON.stringify(attributes);

        const results = await prisma.$queryRaw<{ id: string }[]>(
            Prisma.sql`
                SELECT DISTINCT p.id
                FROM "Product" p
                JOIN "ProductVariant" pv ON pv."productId" = p.id
                WHERE p."isActive" = true
                 AND pv."isActive" = true
                 AND pv.stock > 0
                 AND pv.attributes @> CAST(${jsonValue} AS jsonb)
            `
        );

        return results.map((r) => r.id);
    }

    findManyProducts = async (filters: ProductFilters, pagination: PaginationParams) => {
        let attributeMatchedIds: string[] | undefined;

        if (filters.attributes && Object.keys(filters.attributes).length > 0) {
            attributeMatchedIds = await this.findProductIdsByAttributes(filters.attributes);

            if (attributeMatchedIds.length === 0) {
                return { products: [], total: 0 }
            }
        }

        const where = this.buildWhereClause(filters, attributeMatchedIds);

        const [total, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                include: {
                    variants: {
                        where: {
                            isActive: true,
                            stock: { gt: 0 }
                        },
                        select: {
                            price: true
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (pagination.page - 1) * pagination.pageSize,
                take: pagination.pageSize,
            }),
        ]);

        return { products, total }

    }
}

export const productsRepository = new ProductsRepository();