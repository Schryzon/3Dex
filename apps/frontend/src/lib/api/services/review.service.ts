import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import { Review, ReviewStats, CreateReviewData } from '@/types';



export const reviewService = {
    /**
     * Get statistics for a model's reviews
     */
    getReviewStats: (modelId: string) =>
        apiClient.get<ReviewStats>(API_ENDPOINTS.REVIEWS.MODEL_STATS(modelId)),

    /**
     * Get all reviews for a specific model
     */
    getReviews: (modelId: string, page = 1) =>
        apiClient.get<Review[]>(`${API_ENDPOINTS.REVIEWS.MODEL(modelId)}?page=${page}`),

    /**
     * Create a new review for a model
     */
    createReview: (modelId: string, review: CreateReviewData) =>
        apiClient.post<Review>(API_ENDPOINTS.REVIEWS.MODEL(modelId), review),

    /**
     * Get reviews for a specific user (Artist/Provider)
     */
    getUserReviews: (userId: string, page: number = 1, limit: number = 10) => {
        return apiClient.get<Review[]>(API_ENDPOINTS.REVIEWS.USER_LIST(userId), {
            params: { page, limit }
        });
    },

    /**
     * Create a review for a user
     */
    createUserReview: async (targetUserId: string, data: CreateReviewData): Promise<Review> => {
        return apiClient.post<Review>(API_ENDPOINTS.REVIEWS.USER_CREATE, {
            target_user_id: targetUserId,
            ...data
        });
    },

    /**
     * Check if current user can review target user
     */
    checkReviewEligibility: async (targetUserId: string): Promise<{ eligible: boolean; reason: string | null }> => {
        return apiClient.get<{ eligible: boolean; reason: string | null }>(
            `${API_ENDPOINTS.REVIEWS.USER_LIST(targetUserId)}/eligible`
        );
    }
};

export default reviewService;
