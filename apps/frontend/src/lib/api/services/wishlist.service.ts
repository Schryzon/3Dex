import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type { WishlistItem, Model } from '@/lib/types';

export const wishlistService = {
    async getWishlist(): Promise<WishlistItem[]> {
        return apiClient.get<WishlistItem[]>(API_ENDPOINTS.WISHLIST.LIST);
    },

    async addToWishlist(modelId: string): Promise<WishlistItem> {
        return apiClient.post<WishlistItem>(API_ENDPOINTS.WISHLIST.ADD, { modelId });
    },

    async removeFromWishlist(modelId: string): Promise<void> {
        return apiClient.delete(API_ENDPOINTS.WISHLIST.REMOVE(modelId));
    },

    async toggleWishlist(modelId: string, isInWishlist: boolean): Promise<void> {
        if (isInWishlist) {
            await this.removeFromWishlist(modelId);
        } else {
            await this.addToWishlist(modelId);
        }
    },
};
