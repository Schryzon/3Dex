import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import type { WishlistItem } from '@/lib/types';

export const wishlistKeys = {
    all: ['wishlist'] as const,
} as const;

// Backend uses /:model_id as URL param (not request body)
export const wishlistService = {
    async getWishlist(): Promise<WishlistItem[]> {
        return apiClient.get<WishlistItem[]>(API_ENDPOINTS.WISHLIST.LIST);
    },

    async addToWishlist(modelId: string): Promise<WishlistItem> {
        // POST /wishlist/:model_id  — no request body needed
        return apiClient.post<WishlistItem>(API_ENDPOINTS.WISHLIST.ADD(modelId), {});
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
