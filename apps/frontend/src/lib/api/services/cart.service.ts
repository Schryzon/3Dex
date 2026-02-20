import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type { CartItem } from '@/lib/types';

// Maps raw backend cart item to frontend CartItem shape
function mapCartItem(raw: any): CartItem {
    const model = raw.model || {};
    return {
        id: raw.id,
        model_id: raw.model_id,
        quantity: raw.quantity,
        model: {
            id: model.id,
            title: model.title || '',
            description: model.description || '',
            price: model.price || 0,
            thumbnails: model.preview_url ? [model.preview_url] : [],
            images: model.preview_url ? [model.preview_url] : [],
            modelFileUrl: model.file_url || '',
            fileFormat: model.file_url
                ? [model.file_url.split('.').pop()?.toUpperCase() || 'GLB']
                : ['GLB'],
            category: model.category?.name || 'General',
            tags: [],
            isPrintable: false,
            status: model.status || 'APPROVED',
            artistId: model.artist_id || '',
            artist: {
                id: model.artist?.id || '',
                username: model.artist?.username || 'Unknown',
                avatar_url: model.artist?.avatar_url,
            },
            createdAt: model.created_at || '',
            updatedAt: model.updated_at || '',
            rating: model.avg_rating || 0,
            reviewCount: model.review_count || 0,
        },
    };
}

export const cartService = {
    async getCart(): Promise<CartItem[]> {
        try {
            const raw = await apiClient.get<any[]>(API_ENDPOINTS.CART.LIST);
            return Array.isArray(raw) ? raw.map(mapCartItem) : [];
        } catch (error) {
            console.warn('Cart API error (user may not be logged in):', error);
            return [];
        }
    },

    async addToCart(modelId: string, quantity: number = 1): Promise<CartItem> {
        const raw = await apiClient.post<any>(API_ENDPOINTS.CART.ADD, { modelId, quantity });
        return mapCartItem(raw);
    },

    async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
        const raw = await apiClient.patch<any>(API_ENDPOINTS.CART.UPDATE(itemId), { quantity });
        return mapCartItem(raw);
    },

    async removeItem(itemId: string): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.CART.REMOVE(itemId));
    },

    async clearCart(): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.CART.CLEAR);
    },

    async getCartCount(): Promise<number> {
        const items = await this.getCart();
        return items.reduce((total, item) => total + item.quantity, 0);
    },

    async getCartTotal(): Promise<number> {
        const items = await this.getCart();
        return items.reduce((total, item) => total + (item.model.price * item.quantity), 0);
    },
};
