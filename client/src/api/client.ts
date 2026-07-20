import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

export interface ApiResponse<T> {
    data: T;
    pagination?: {
        page: number,
        pageSize: number,
        total: number
    };
}

export interface ApiError {
    error: {
        message: string;
        code: string;
        details?: { field: string; message: string }[]
    };
}

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    headers: {
        'Content-Type': 'application/json'
    }
});

// TODO: Epic 2 - Attach access token from AuthContext
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// TODO: Epic 2 - Token refresh with queue/mutex pattern
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response
    },
    (error: AxiosError<ApiError>) => {
        if (!error) {
            return Promise.reject(new Error("Unknown Error. Please try again."));
        }

        if (!axios.isAxiosError(error)) {
            return Promise.reject(error);
        }

        if (error?.response?.status == 401) {
            // refresh logic
        }

        if (error.response) {
            return Promise.reject(error)
        }

        // for errors that originates from network issues
        // eg: CORS, DNS, timeouts
        return Promise.reject(
            new Error("Network Error. Please check your connection and try again later.")
        )

    }
)

export default api;
