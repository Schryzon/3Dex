import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type {
    Model,
    ModelFilters,
    PaginatedResponse,
    Review
} from '@/lib/types';

export const productService = {
    async getProducts(filters?: ModelFilters): Promise<PaginatedResponse<Model>> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
            if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
            if (filters.format) filters.format.forEach(f => params.append('format', f));
            if (filters.isPrintable !== undefined) params.append('isPrintable', filters.isPrintable.toString());
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const queryString = params.toString();
        const url = queryString ? `${API_ENDPOINTS.MODELS.LIST}?${queryString}` : API_ENDPOINTS.MODELS.LIST;

        return apiClient.get<PaginatedResponse<Model>>(url);
    },

    async getProductById(id: string): Promise<Model> {
        return apiClient.get<Model>(API_ENDPOINTS.MODELS.DETAIL(id));
    },

    async uploadProduct(formData: FormData, onProgress?: (progress: number) => void): Promise<Model> {
        return apiClient.upload<Model>(API_ENDPOINTS.MODELS.UPLOAD, formData, onProgress);
    },

    async updateProduct(id: string, data: Partial<Model>): Promise<Model> {
        return apiClient.patch<Model>(API_ENDPOINTS.MODELS.UPDATE(id), data);
    },

    async deleteProduct(id: string): Promise<void> {
        return apiClient.delete(API_ENDPOINTS.MODELS.DELETE(id));
    },

    async getProductReviews(id: string): Promise<Review[]> {
        return apiClient.get<Review[]>(API_ENDPOINTS.MODELS.REVIEWS(id));
    },

    async addReview(id: string, data: { rating: number; comment: string }): Promise<Review> {
        return apiClient.post<Review>(API_ENDPOINTS.MODELS.REVIEWS(id), data);
    },

    async downloadProduct(id: string): Promise<{ downloadUrl: string; expiresAt: string; remainingDownloads: number }> {
        return apiClient.get(API_ENDPOINTS.MODELS.DOWNLOAD(id));
    },
};
