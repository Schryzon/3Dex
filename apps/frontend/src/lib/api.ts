import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Legacy axios instance — used by older service files that import from '@/lib/api'
// Prefer apiClient from '@/lib/api/client' for new code
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Required: instructs the browser to include the HTTP-only auth cookie
    withCredentials: true,
});

// Request interceptor — logging only; no token injection needed
// because the browser attaches the auth cookie automatically
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — redirect on 401 for protected pages
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        console.error(
            `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
            error.response?.status,
            error.response?.data
        );

        if (error.response?.status === 401) {
            const isLandingPage =
                window.location.pathname === '/' ||
                window.location.pathname === '';

            // Redirect to root only on protected pages; skip the landing page
            // to avoid infinite redirect loops
            if (!isLandingPage) {
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);
