import type { Prisma, Product, ProductVariant } from "../../generated/prisma/client.js";
import { NotFoundError } from "../../types/app-error.js";
import type { ListProductParams, PaginationParams, ProductDetailDTO, ProductFilters, ProductListItemDTO } from "../../types/product.js";
import { productsRepository } from "./products.repository.js";

type ProductWithVariants = Product & {
    variants: Pick<ProductVariant, "price">[];
};

type ProductWithAllVariants = Product & {
    variants: ProductVariant[];
}

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

    private toProdcutDetailDTO = (product: ProductWithAllVariants): ProductDetailDTO => {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            images: product.images,
            category: product.category,
            variants: product.variants.map((v) => ({
                id: v.id,
                attributes: v.attributes as Record<string, string>,
                price: Number(v.price),
                stockStatus: v.stock > 0 ? "In Stock" : "Out of Stock",
            })),
            averageRating: null,  // TODO - EPIC 8: SQL AVG() on Review table
            reviewCount: 0,       // TODO - EPIC 8: SQL COUNT() on Review table
        };
    }

    listProducts = async (params: ListProductParams) => {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(Math.max(1, Number(params.pageSize) || 12), 50);

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

    getProductById = async (id: string) => {
        const product = await productsRepository.findProductById(id);

        if (!product || !product.isActive) {
            throw new NotFoundError("Product Not Found");
        }

        return this.toProdcutDetailDTO(product);
    }
}

export const productsService = new ProductsService();