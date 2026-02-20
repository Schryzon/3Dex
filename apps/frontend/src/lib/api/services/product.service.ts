import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';
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
    images: item.preview_url ? [item.preview_url] : [], // Fallback for components using 'images'
    modelFileUrl: item.file_url,
    fileFormat: Array.isArray(item.fileFormat) ? item.fileFormat : (item.fileFormat ? [item.fileFormat] : []),
    category: item.category?.name || item.category || 'General',
    tags: Array.isArray(item.tags) ? item.tags.map((t: any) => typeof t === 'string' ? t : t.name) : [],
    isPrintable: false,
    status: item.status,
    artistId: item.artist_id,
    artist: {
        id: item.artist?.id || '',
        username: item.artist?.username || 'Unknown',
        avatar_url: item.artist?.avatar_url
    },
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    polyCount: item.poly_count || 0,
    rating: item.avg_rating || item.rating || 0,
    reviewCount: item.review_count || 0
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
                if (filters.format) filters.format.forEach((f: string) => params.append('format', f));
                if (filters.isPrintable !== undefined) params.append('isPrintable', filters.isPrintable.toString());
                if (filters.sort) params.append('sort', filters.sort);
                if (filters.artistId) params.append('artist_id', filters.artistId);
                if (filters.page) params.append('page', filters.page.toString());
                if (filters.limit) params.append('limit', filters.limit.toString());
            }

            const queryString = params.toString();
            const url = queryString ? `${API_ENDPOINTS.MODELS.LIST}?${queryString}` : API_ENDPOINTS.MODELS.LIST;

            const response = await apiClient.get<any>(url);

            // Safety check for backend response structure
            if (!response || !response.data) {
                throw new Error('Invalid response format from server');
            }

            return {
                data: response.data.map(mapModel),
                pagination: {
                    page: response.meta?.page || 1,
                    limit: response.meta?.limit || 20,
                    total: response.meta?.total || 0,
                    totalPages: response.meta?.pages || 1
                }
            };
        } catch (error) {
            console.error('getProducts failed:', error);
            throw error;
        }
    },

    async getProductById(id: string): Promise<Model> {
        try {
            const data = await apiClient.get<any>(API_ENDPOINTS.MODELS.DETAIL(id));
            if (!data) throw new Error('Product not found');
            return mapModel(data);
        } catch (error) {
            console.error(`getProductById(${id}) failed:`, error);
            throw error;
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
