import { apiClient } from '../client';
import type { ArtistAnalyticsStats, PublicAnalyticsStats, ProviderAnalyticsStats } from '@/types';

export const analyticsKeys = {
    publicStats: ['public-stats'] as const,
    artistStats: ['artist-stats'] as const,
    providerStats: ['provider-stats'] as const,
} as const;

export const analyticsService = {
    getPublicStats: async (): Promise<PublicAnalyticsStats> =>
        apiClient.get<PublicAnalyticsStats>('/analytics/public'),
    getArtistStats: async (): Promise<ArtistAnalyticsStats> =>
        apiClient.get<ArtistAnalyticsStats>('/analytics/artist'),
    getProviderStats: async (): Promise<ProviderAnalyticsStats> =>
        apiClient.get<ProviderAnalyticsStats>('/analytics/provider'),
};
