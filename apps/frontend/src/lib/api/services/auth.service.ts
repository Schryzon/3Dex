import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import type { LoginRequest, RegisterRequest, User } from '@/lib/types';

export const authKeys = {
    all: ['auth'] as const,
    current: () => [...authKeys.all, 'current'] as const,
} as const;

// Shape returned by login, googleLogin.
interface AuthResponse {
    user: User;
    needs_username?: boolean;
}

export const authService = {
    // POST /auth/login
    // Cookie is set by the server in the response; no token handling needed here
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    },

    // POST /auth/register
    // Returns the new user's id and email only; no auto-login token is issued
    async register(data: RegisterRequest): Promise<{ id: string; email: string }> {
        return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    },

    // POST /auth/google
    // Cookie is set by the server after verifying the Google ID token
    async googleLogin(credential: string): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.GOOGLE, { credential });
    },

    // POST /auth/logout
    // Instructs the server to clear the HTTP-only cookie
    async logout(): Promise<void> {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    // GET /auth/me
    // Verifies the current cookie session and returns the user's profile
    async getCurrentUser(): Promise<User> {
        return apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    },

    // POST /auth/complete-profile
    // Saves the user-chosen username after a Google sign-up
    async completeProfile(username: string): Promise<User> {
        return apiClient.post<User>(API_ENDPOINTS.AUTH.COMPLETE_PROFILE, { username });
    },

    // Read user data cached in localStorage (UI only — not the auth token)
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

    // Persist user data in localStorage for instant UI hydration on next load.
    // This does NOT store a token — the real auth credential is the HTTP-only cookie.
    storeUser(user: User): void {
        localStorage.setItem('user', JSON.stringify(user));
    },

    clearStoredUser(): void {
        localStorage.removeItem('user');
    },
};
