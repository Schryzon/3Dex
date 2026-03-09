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
        const isAuthMe = error.config?.url?.includes('/auth/me');

        // Don't log 401 errors for the initial session check as they are normal for guests
        if (!(isAuthMe && error.response?.status === 401)) {
            console.error(
                `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
                error.response?.status,
                error.response?.data
            );
        }

        if (error.response?.status === 401) {
            const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

            const isPublicRoute =
                pathname === '/' ||
                pathname === '' ||
                pathname.startsWith('/catalog') ||
                pathname.startsWith('/print-services') ||
                pathname.startsWith('/community') ||
                pathname.startsWith('/u/');

            // Redirect to root only when the user was on a protected page.
            // Skip the redirect on public routes to allow guest browsing.
            if (!isPublicRoute) {
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);
