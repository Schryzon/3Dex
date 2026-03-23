import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import { USE_MOCK_DATA } from './product.service';
import { MOCK_PRODUCTS } from '@/lib/mocks/products';
import type { CartItem } from '@/types';

export const cartKeys = {
    all: ['cart'] as const,
} as const;

const MOCK_CART_KEY = '3dex_mock_cart';

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
        if (USE_MOCK_DATA) {
            const stored = localStorage.getItem(MOCK_CART_KEY);
            return stored ? JSON.parse(stored) : [];
        }
        try {
            const raw = await apiClient.get<any[]>(API_ENDPOINTS.CART.LIST);
            return Array.isArray(raw) ? raw.map(mapCartItem) : [];
        } catch (error) {
            console.warn('Cart API error (user may not be logged in):', error);
            return [];
        }
    },

    async addToCart(modelId: string, quantity: number = 1): Promise<CartItem> {
        if (USE_MOCK_DATA) {
            const items = await this.getCart();
            const existing = items.find(i => i.model_id === modelId);

            if (existing) {
                existing.quantity += quantity;
                localStorage.setItem(MOCK_CART_KEY, JSON.stringify(items));
                return existing;
            }

            const product = MOCK_PRODUCTS.find(p => p.id === modelId);
            if (!product) throw new Error('Product not found');

            const newItem: CartItem = {
                id: `mock-cart-${Date.now()}`,
                model_id: modelId,
                quantity,
                model: product
            };

            items.push(newItem);
            localStorage.setItem(MOCK_CART_KEY, JSON.stringify(items));
            return newItem;
        }

        const raw = await apiClient.post<any>(API_ENDPOINTS.CART.ADD, { modelId, quantity });
        return mapCartItem(raw);
    },

    async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
        if (USE_MOCK_DATA) {
            const items = await this.getCart();
            const item = items.find(i => i.id === itemId);
            if (!item) throw new Error('Item not found');
            item.quantity = quantity;
            localStorage.setItem(MOCK_CART_KEY, JSON.stringify(items));
            return item;
        }
        const raw = await apiClient.patch<any>(API_ENDPOINTS.CART.UPDATE(itemId), { quantity });
        return mapCartItem(raw);
    },

    async removeItem(itemId: string): Promise<void> {
        if (USE_MOCK_DATA) {
            const items = await this.getCart();
            const filtered = items.filter(i => i.id !== itemId);
            localStorage.setItem(MOCK_CART_KEY, JSON.stringify(filtered));
            return;
        }
        await apiClient.delete(API_ENDPOINTS.CART.REMOVE(itemId));
    },

    async clearCart(): Promise<void> {
        if (USE_MOCK_DATA) {
            localStorage.removeItem(MOCK_CART_KEY);
            return;
        }
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
