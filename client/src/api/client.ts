import axios, { type AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// TODO: Epic 2 - Attach access token from AuthContext
api.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// TODO: Epic 2 - Token refresh with queue/mutex pattern
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.statue == 401) {
            // refresh logic
        }
        return Promise.reject(error)
    }
)


export default api;