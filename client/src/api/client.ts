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
    },
    withCredentials: true
});

// stop recursing into an infinite loop while refreshing.
// `api` instance with the expired refresh token will throw 401
// which in turn try another refresh creating an infinite loop
const refreshApi: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    withCredentials: true
});


let isRefreshing = false;
let retryQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
    retryQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token)
    });

    retryQueue = [];
}

// TODO: Epic 2 - Attach access token from AuthContext
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const accessToken = (window as any).__accessToken;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

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
    async (error: AxiosError<ApiError>) => {
        if (!error) {
            return Promise.reject(new Error("Unknown Error. Please try again."));
        }

        if (!axios.isAxiosError(error)) {
            return Promise.reject(error);
        }

        // Creating a snapshot of the original request config
        // with additional optional retry attribute
        // to gaurd against retrying the same request twice.
        const originalRequest = error.config as | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        if (error?.response?.status == 401 && originalRequest && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise<string | null>((resolve, reject) => {
                    retryQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                        }

                        return api(originalRequest)
                    })
                    .catch((error) => Promise.reject(error));
            }

            isRefreshing = true;
            originalRequest._retry = true;

            try {
                const response = await refreshApi.post('/auth/refresh');
                const newAccessToken = response.data.data.accessToken;

                (window as any).__accessToken = newAccessToken;

                // retries all the other requests that kept in the queue
                processQueue(null, newAccessToken);

                // retries the request that triggered the refresh
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                } else {
                    originalRequest.headers = { Authorization: `Bearer ${newAccessToken}` } as any;
                }

                return api(originalRequest);
            } catch (error) {
                processQueue(error, null); // reject all the requests
                (window as any).__accessToken = undefined;
                window.location.href = '/login';

                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
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
