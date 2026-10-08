// Axios instance configured for the blog API.
// - Adds the Authorization header automatically when a token exists
// - On 401 TOKEN_EXPIRED, transparently refreshes and retries
// - On refresh failure, clears tokens and (optionally) redirects to /login

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TOKEN_KEYS = {
    ACCESS: 'accessToken',
    REFRESH: 'refreshToken'
};

// ---- token storage helpers ----
export const tokenStore = {
    getAccess: () => localStorage.getItem(TOKEN_KEYS.ACCESS),
    getRefresh: () => localStorage.getItem(TOKEN_KEYS.REFRESH),
    set: (accessToken, refreshToken) => {
        if (accessToken) localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
        if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
    },
    clear: () => {
        localStorage.removeItem(TOKEN_KEYS.ACCESS);
        localStorage.removeItem(TOKEN_KEYS.REFRESH);
    }
};

// ---- axios instance ----
const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// ---- request interceptor: attach access token ----
api.interceptors.request.use((config) => {
    const token = tokenStore.getAccess();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---- response interceptor: refresh on 401 TOKEN_EXPIRED ----
// Prevents multiple simultaneous refresh calls with a shared promise.
let refreshPromise = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Only attempt refresh for 401s with code TOKEN_EXPIRED, once per request
        const status = error.response?.status;
        const code = error.response?.data?.code;
        const isExpired = status === 401 && code === 'TOKEN_EXPIRED';

        if (!isExpired || original._retry) {
            return Promise.reject(error);
        }

        const refreshToken = tokenStore.getRefresh();
        if (!refreshToken) {
            return Promise.reject(error);
        }

        original._retry = true;

        try {
            // Share one refresh call across concurrent 401s
            if (!refreshPromise) {
                refreshPromise = axios
                    .post(`${API_URL}/auth/refresh-token`, { refreshToken })
                    .then((res) => {
                        const { accessToken, refreshToken: newRefresh } =
                            res.data?.data || {};
                        tokenStore.set(accessToken, newRefresh);
                        return accessToken;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken = await refreshPromise;
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(original);
        } catch (refreshError) {
            // Refresh failed (token revoked or expired) -> clear and reject
            tokenStore.clear();
            // Dispatch event so AuthContext can react (e.g. redirect to login)
            window.dispatchEvent(new CustomEvent('auth:logout'));
            return Promise.reject(error);
        }
    }
);

export default api;