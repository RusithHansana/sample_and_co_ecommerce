interface ApiResponse<T> {
    data: T;
    pagination?: {
        page: number,
        pageSize: number,
        total: number
    };
}

interface ApiError {
    error: {
        message: string;
        code: string;
        details?: { field: string; message: string }[]
    };
}