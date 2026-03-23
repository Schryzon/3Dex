import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import { MOCK_PRODUCTS } from '@/lib/mocks/products';
import type {
    Model,
    ModelFilters,
    PaginatedResponse,
    Review
} from '@/lib/types';

export const productKeys = {
    all: ['models'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters?: ModelFilters) => [...productKeys.lists(), filters] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
    reviews: (id: string) => [...productKeys.detail(id), 'reviews'] as const,
    infinite: (filters?: ModelFilters) => [...productKeys.all, 'infinite', filters] as const,
} as const;

// Set this to true to use mock data, or false to use the real database
export const USE_MOCK_DATA = false;


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
    isPurchased: item.isPurchased,
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
        if (USE_MOCK_DATA) {
            let data = [...MOCK_PRODUCTS];

            // Basic filtering for mock data
            if (filters) {
                if (filters.search) {
                    const search = filters.search.toLowerCase();
                    data = data.filter(item =>
                        item.title.toLowerCase().includes(search) ||
                        item.description.toLowerCase().includes(search)
                    );
                }
                if (filters.category && filters.category !== 'all') {
                    data = data.filter(item => item.category.toLowerCase() === filters.category?.toLowerCase());
                }
            }

            // Mock pagination
            const page = filters?.page || 1;
            const limit = filters?.limit || 20;
            const start = (page - 1) * limit;
            const paginatedData = data.slice(start, start + limit);

            return {
                data: paginatedData,
                pagination: {
                    page,
                    limit,
                    total: data.length,
                    totalPages: Math.ceil(data.length / limit)
                }
            };
        }

        try {
            const params = new URLSearchParams();

            if (filters) {
                if (filters.search) params.append('search', filters.search);
                if (filters.category && filters.category !== 'all') params.append('category', filters.category);
                if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
                if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
                if (filters.format) filters.format.forEach((f: string) => params.append('format', f));
                if (filters.types) filters.types.forEach((t: string) => params.append('types', t));
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
        if (USE_MOCK_DATA && id.startsWith('mock-')) {
            const product = MOCK_PRODUCTS.find(p => p.id === id);
            if (!product) throw new Error('Product not found');
            return product;
        }

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
        return apiClient.get<Review[]>(API_ENDPOINTS.REVIEWS.MODEL(id));
    },

    async addReview(id: string, data: { rating: number; comment: string }): Promise<Review> {
        return apiClient.post<Review>(API_ENDPOINTS.REVIEWS.MODEL(id), data);
    },

    async downloadProduct(id: string): Promise<{ downloadUrl: string; expiresAt: string; remainingDownloads: number }> {
        return apiClient.get(API_ENDPOINTS.MODELS.DOWNLOAD(id));
    },
};
