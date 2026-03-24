import { apiClient } from '../client';

export const analyticsKeys = {
    publicStats: ['public-stats'] as const,
} as const;

export const analyticsService = {
    getPublicStats: async () => {
        const res = await apiClient.get('/analytics/public');
        return res as any;
    }
};
