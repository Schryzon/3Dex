import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';

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
};
