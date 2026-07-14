import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
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
    (error) => {
        if (error.response?.status == 401) {
            // refresh logic
        }
        return Promise.reject(error)
    }
)


export default api;