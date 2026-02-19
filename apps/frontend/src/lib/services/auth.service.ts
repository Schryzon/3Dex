import { api } from '../api';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/lib/types';

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<{ id: string; email: string }> {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    getStoredToken(): string | null {
        return localStorage.getItem('auth_token');
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

    storeAuth(token: string, user: User) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
};
