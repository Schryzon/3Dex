import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';

export const purchaseKeys = {
    all: ['purchases'] as const,
} as const;

export interface Purchase {
    id: string;
    model_id: string;
    price_paid: number;
    created_at: string;
    license: 'PERSONAL_USE' | 'COMMERCIAL_USE';
    model: {
        id: string;
        title: string;
        preview_url: string;
        file_format: string;
    };
}

export const purchaseService = {
    async getPurchases(): Promise<Purchase[]> {
        return apiClient.get<Purchase[]>('/purchases/me/purchases');
    },

    async getDownloadUrl(modelId: string): Promise<{ download_url: string; license: string }> {
    return apiClient.get(API_ENDPOINTS.MODELS.DOWNLOAD(modelId));
},

    async buyModel(modelId: string, license: 'PERSONAL_USE' | 'COMMERCIAL_USE' = 'PERSONAL_USE'): Promise<any> {
        return apiClient.post(`/models/${modelId}/buy`, { license });
    }
};
