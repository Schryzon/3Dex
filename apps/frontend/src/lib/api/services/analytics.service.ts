import { apiClient } from '../client';
import type { ArtistAnalyticsStats, PublicAnalyticsStats } from '@/types';

export const analyticsKeys = {
    publicStats: ['public-stats'] as const,
    artistStats: ['artist-stats'] as const,
} as const;

export const analyticsService = {
    getPublicStats: async (): Promise<PublicAnalyticsStats> =>
        apiClient.get<PublicAnalyticsStats>('/analytics/public'),
    getArtistStats: async (): Promise<ArtistAnalyticsStats> =>
        apiClient.get<ArtistAnalyticsStats>('/analytics/artist'),
};
