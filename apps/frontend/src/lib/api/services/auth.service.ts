import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User
} from '@/lib/types';

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        // Store token and user in localStorage
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            data
        );

        // Store token and user in localStorage
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    async logout(): Promise<void> {
        try {
            await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } finally {
            // Clear localStorage regardless of API response
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    },

    async getCurrentUser(): Promise<User> {
        try {
            return await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
        } catch {
            // Fall back to stored user if /auth/me is unavailable
            const stored = this.getStoredUser();
            if (stored) return stored;
            throw new Error('Not authenticated');
        }
    },

    getStoredUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
},

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};
