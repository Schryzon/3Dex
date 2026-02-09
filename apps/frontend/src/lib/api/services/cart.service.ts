import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type { CartItem } from '@/lib/types';

export const cartService = {
    async getCart(): Promise<CartItem[]> {
        return apiClient.get<CartItem[]>(API_ENDPOINTS.CART.LIST);
    },

    async addToCart(modelId: string, quantity: number = 1): Promise<CartItem> {
        return apiClient.post<CartItem>(API_ENDPOINTS.CART.ADD, { modelId, quantity });
    },

    async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
        return apiClient.patch<CartItem>(API_ENDPOINTS.CART.UPDATE(itemId), { quantity });
    },

    async removeItem(itemId: string): Promise<void> {
        return apiClient.delete(API_ENDPOINTS.CART.REMOVE(itemId));
    },

    async clearCart(): Promise<void> {
        return apiClient.delete(API_ENDPOINTS.CART.CLEAR);
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
