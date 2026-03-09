import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';

export interface Purchase {
    id: string;
    user_id: string;
    model_id: string;
    price_paid: number;
    purchase_date: string;
    license: string;
    model: {
        id: string;
        title: string;
        preview_url: string;
        file_size: number;
        file_format: string[];
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
