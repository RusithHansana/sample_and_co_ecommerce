export interface ProductFilters {
    search?: string;
    category?: string;
    attributes?: Record<string, string>;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
}