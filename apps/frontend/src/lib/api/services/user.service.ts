import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';

export const userKeys = {
    all: ['user'] as const,
    profile: () => [...userKeys.all, 'profile'] as const,
} as const;

export interface ArtistApplicationData {
    role: 'ARTIST';
    portfolio: { title: string; url: string; description?: string }[];
    display_name?: string;
    bio?: string;
    website?: string;
    location?: string;
    social_twitter?: string;
    social_instagram?: string;
    social_artstation?: string;
    social_behance?: string;
}

export interface ProviderApplicationData {
    role: 'PROVIDER';
    provider_config: {
        materials: string[];
        colors: string[];
        printerTypes: string[];
        basePrice?: number;
        maxDimensions?: { x: number; y: number; z: number };
    };
    display_name?: string;
    bio?: string;
    website?: string;
    location?: string;
}

export const userService = {
    async applyForRole(data: ArtistApplicationData) {
        return apiClient.post<{ message: string; user: any }>(
            API_ENDPOINTS.USERS.APPLY_ROLE,
            data
        );
    },

    async applyForProvider(data: ProviderApplicationData) {
        return apiClient.post<{ message: string; user: any }>(
            API_ENDPOINTS.USERS.APPLY_ROLE,
            data
        );
    },

    async searchUsers(query: string, role?: string) {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (role) params.append('role', role);
        return apiClient.get<any[]>(`${API_ENDPOINTS.USERS.SEARCH}?${params.toString()}`);
    },

    async getPublicProfile(username: string) {
        return apiClient.get<any>(API_ENDPOINTS.USERS.PUBLIC_PROFILE(username));
    },
    
    async followUser(userId: string) {
        return apiClient.post<{ message: string }>(API_ENDPOINTS.USERS.FOLLOW(userId));
    },
    
    async unfollowUser(userId: string) {
        return apiClient.delete<{ message: string }>(API_ENDPOINTS.USERS.UNFOLLOW(userId));
    }
};
