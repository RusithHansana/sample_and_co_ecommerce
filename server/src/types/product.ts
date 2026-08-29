export interface ProductFilters {
    search?: string;
    category?: string;
    attributes?: Record<string, string>;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
}

export interface ListProductParams {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    attributes?: Record<string, string>
}

export interface ProductListItemDTO {
    id: string;
    name: string;
    primaryImage: string,
    category: string,
    priceRange: {
        min: number,
        max: number,
    };
    averageRating: number;
    reviewCount: number;
}

export interface ProductVariantDetailDTO {
    id: string;
    attributes: Record<string, string>;
    price: number;
    stockStatus: "In Stock" | "Out of Stock";
}

export interface ProductDetailDTO {
    id: string;
    name: string;
    descritpion: string;
    images: string[];
    category: string,
    variants: ProductVariantDetailDTO[];
    averageRating: number | null;
    reviewCount: number;
}