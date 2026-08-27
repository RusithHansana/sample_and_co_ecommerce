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