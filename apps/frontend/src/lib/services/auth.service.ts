import { api } from '../api';
import { User, LoginRequest, RegisterRequest } from '@/lib/types';


interface AuthResponse {
    user: User;
}

// Legacy auth service used by AuthProvider via '@/lib/services/auth.service'.
// Mirrors the Service-pattern version in '@/lib/api/services/auth.service'.
export const authService = {
    // POST /auth/login — cookie is set by the server response
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<{ id: string; email: string }> {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    // POST /auth/google — cookie is set by the server after verifying the Google token
    async googleLogin(credential: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/google', { credential });
        return response.data;
    },

    // POST /auth/logout — server clears the HTTP-only cookie
    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    // GET /auth/me — validates the current cookie session
    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    // Returns user data cached in localStorage (UI only — not the auth token)
    getStoredUser(): User | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    // Persist user data for instant UI hydration. Does NOT store a token.
    storeUser(user: User): void {
        localStorage.setItem('user', JSON.stringify(user));
    },

    clearStoredUser(): void {
        localStorage.removeItem('user');
    },

    // Kept for backward-compat; always returns null now — token is in a cookie
    getStoredToken(): null {
        return null;
    },
};
