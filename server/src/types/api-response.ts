export type ApiSuccessResponse<T> = {
    data: T;
    pagination?: {
        page:number;
        pageSize:number;
        total:number;
    };
};

export type ApiErrorResponse = {
    error: {
        message: string;
        code: string;
        details?: {
            field: string;
            message: string;
        } [];
    };
};


