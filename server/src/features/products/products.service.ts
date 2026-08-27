import type { Prisma, Product, ProductVariant } from "../../generated/prisma/client.js";
import type { ListProductParams, PaginationParams, ProductFilters, ProductListItemDTO } from "../../types/product.ts";
import { productsRepository } from "./products.repository.ts";

type ProductWithVariants = Product & {
    variants: Pick<ProductVariant, "price">[];
};

class ProductsService {
    private calculatePriceRange = (variants: { price: Prisma.Decimal }[]): { min: number, max: number } => {
        if (variants.length === 0) {
            return { min: 0, max: 0 }
        }

        // Convert price to number because Prisma.Decimal is not treated as a number
        const prices = variants.map((v) => Number(v.price));

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        return { min, max };
    }

    private toProductDTO = (product: ProductWithVariants): ProductListItemDTO => {
        return {
            id: product.id,
            name: product.name,
            primaryImage: product.images[0] ?? "",
            category: product.category,
            priceRange: this.calculatePriceRange(product.variants),
            averageRating: 0, // TODO - EPIC 8
            reviewCount: 0, // TODO - EPIC 8
        }
    }

    listProducts = async (params: ListProductParams) => {
        const page = Number(params.page ?? 1);
        const pageSize = Math.min(params.pageSize ?? 12, 50);

        const filters: ProductFilters = {};

        if (params.search) {
            filters.search = params.search;
        }

        if (params.category) {
            filters.category = params.category
        }

        if (params.attributes && Object.keys(params.attributes).length > 0) {
            filters.attributes = params.attributes;
        }

        const pagination: PaginationParams = { page, pageSize };

        const { products, total } = await productsRepository.findManyProducts(filters, pagination);

        const data = products.map((p) => this.toProductDTO(p));

        return {
            data,
            pagination: {
                page,
                pageSize,
                total
            }
        };
    }
}

export const productsService = new ProductsService();