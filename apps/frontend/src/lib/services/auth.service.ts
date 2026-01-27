import { api } from '../api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    async register(data: RegisterData): Promise<{ id: string; email: string }> {
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
