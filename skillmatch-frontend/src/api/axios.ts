/* ─────────────────────────────────────────────────────────────────────────────
 * Axios instance — central HTTP client with interceptors for auth
 * ──────────────────────────────────────────────────────────────────────────── */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000,
});

// ── Request interceptor: attach access token ───────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 + token refresh ───────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
                        refreshToken,
                    });
                    const { accessToken, refreshToken: newRefresh } = data.data.tokens;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefresh);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch {
                    // Refresh failed → clear tokens, redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    },
);

export default api;
