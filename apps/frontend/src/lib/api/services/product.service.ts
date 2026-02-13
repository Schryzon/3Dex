import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import { MOCK_MODELS } from '../mockData';
import type {
    Model,
    ModelFilters,
    PaginatedResponse,
    Review
} from '@/lib/types';


const mapModel = (item: any): Model => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    price: item.price,
    thumbnails: item.preview_url ? [item.preview_url] : [],
    modelFileUrl: item.file_url,
    fileFormat: ['GLB'],
    category: item.category?.name || 'Uncategorized',
    tags: item.tags ? item.tags.map((t: any) => t.name) : [],
    isPrintable: false,
    status: item.status,
    artistId: item.artist_id,
    artist: {
        id: item.artist?.id || '',
        username: item.artist?.username || 'Unknown',
        avatar: item.artist?.avatar_url
    },
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    rating: 0,
    reviewCount: 0
});

export const productService = {
    async getProducts(filters?: ModelFilters): Promise<PaginatedResponse<Model>> {
        try {
            const params = new URLSearchParams();

            if (filters) {
                if (filters.search) params.append('search', filters.search);
                if (filters.category && filters.category !== 'all') params.append('category', filters.category);
                if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
                if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
                if (filters.format) filters.format.forEach(f => params.append('format', f));
                if (filters.isPrintable !== undefined) params.append('isPrintable', filters.isPrintable.toString());
                if (filters.sort) params.append('sort', filters.sort);
                if (filters.artistId) params.append('artist_id', filters.artistId);
                if (filters.page) params.append('page', filters.page.toString());
                if (filters.limit) params.append('limit', filters.limit.toString());
            }

            const queryString = params.toString();
            const url = queryString ? `${API_ENDPOINTS.MODELS.LIST}?${queryString}` : API_ENDPOINTS.MODELS.LIST;

            const response = await apiClient.get<any>(url);

            return {
                data: response.data.map(mapModel),
                pagination: {
                    page: response.meta.page,
                    limit: response.meta.limit,
                    total: response.meta.total,
                    totalPages: response.meta.pages
                }
            };
        } catch (error) {
            console.warn('API Error in getProducts, falling back to mock data:', error);
            // Path 2: Return mock data as fallback
            const filteredModels = filters?.category && filters.category !== 'all'
                ? MOCK_MODELS.filter(m => m.category.toLowerCase() === filters.category?.toLowerCase())
                : MOCK_MODELS;

            return {
                data: filteredModels,
                pagination: {
                    page: filters?.page || 1,
                    limit: filters?.limit || 20,
                    total: filteredModels.length,
                    totalPages: 1
                }
            };
        }
    },

    async getProductById(id: string): Promise<Model> {
        try {
            const data = await apiClient.get<any>(API_ENDPOINTS.MODELS.DETAIL(id));
            return mapModel(data);
        } catch (error) {
            console.warn(`API Error in getProductById(${id}), falling back to mock data:`, error);
            const model = MOCK_MODELS.find(m => m.id === id);
            if (!model) throw new Error('Product not found');
            return model;
        }
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
