import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import { MOCK_MODELS } from '../mockData';
import type { CartItem } from '@/lib/types';

const CART_STORAGE_KEY = 'threedex_cart';

const getLocalCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const saveLocalCart = (items: CartItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export const cartService = {
    async getCart(): Promise<CartItem[]> {
        try {
            return await apiClient.get<CartItem[]>(API_ENDPOINTS.CART.LIST);
        } catch (error) {
            console.warn('API Error in getCart, falling back to local storage:', error);
            return getLocalCart();
        }
    },

    async addToCart(modelId: string, quantity: number = 1): Promise<CartItem> {
        try {
            return await apiClient.post<CartItem>(API_ENDPOINTS.CART.ADD, { modelId, quantity });
        } catch (error) {
            console.warn('API Error in addToCart, falling back to local storage:', error);
            const items = getLocalCart();
            const existingItem = items.find(item => item.modelId === modelId);

            if (existingItem) {
                existingItem.quantity += quantity;
                saveLocalCart(items);
                return existingItem;
            }

            const model = MOCK_MODELS.find(m => m.id === modelId);
            if (!model) throw new Error('Model not found for cart');

            const newItem: CartItem = {
                id: Math.random().toString(36).substr(2, 9),
                modelId,
                model,
                quantity
            };

            items.push(newItem);
            saveLocalCart(items);
            return newItem;
        }
    },

    async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
        try {
            return await apiClient.patch<CartItem>(API_ENDPOINTS.CART.UPDATE(itemId), { quantity });
        } catch (error) {
            console.warn('API Error in updateQuantity, falling back to local storage:', error);
            const items = getLocalCart();
            const item = items.find(i => i.id === itemId);
            if (!item) throw new Error('Cart item not found');

            item.quantity = quantity;
            saveLocalCart(items);
            return item;
        }
    },

    async removeItem(itemId: string): Promise<void> {
        try {
            await apiClient.delete(API_ENDPOINTS.CART.REMOVE(itemId));
        } catch (error) {
            console.warn('API Error in removeItem, falling back to local storage:', error);
            const items = getLocalCart();
            const filtered = items.filter(i => i.id !== itemId);
            saveLocalCart(filtered);
        }
    },

    async clearCart(): Promise<void> {
        try {
            await apiClient.delete(API_ENDPOINTS.CART.CLEAR);
        } catch (error) {
            console.warn('API Error in clearCart, falling back to local storage:', error);
            saveLocalCart([]);
        }
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
