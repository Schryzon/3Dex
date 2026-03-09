import { apiClient } from './client';

export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    user_id: string;
    model_id: string;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        username: string;
        avatar_url?: string | null;
    };
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
}

export interface CreateReviewData {
    rating: number;
    comment?: string;
}

export const reviewApi = {
    /**
     * Get statistics for a model's reviews
     */
    getReviewStats: (modelId: string) => apiClient.get<ReviewStats>(`/reviews/model/${modelId}/stats`),

    /**
     * Get all reviews for a specific model
     */
    getReviews: (modelId: string, page = 1) => apiClient.get<Review[]>(`/reviews/model/${modelId}?page=${page}`),

    /**
     * Create a new review for a model
     */
    createReview: (modelId: string, review: CreateReviewData) =>
        apiClient.post<Review>(`/reviews/model/${modelId}`, review),

    /**
     * Get reviews for a specific user (Artist/Provider)
     */
    getUserReviews: async (userId: string, page: number = 1, limit: number = 10): Promise<Review[]> => {
        return apiClient.get<Review[]>(`/reviews/user/${userId}`, {
            params: { page, limit }
        });
    },

    /**
     * Create a review for a user
     */
    createUserReview: async (targetUserId: string, data: CreateReviewData): Promise<Review> => {
        return apiClient.post<Review>('/reviews/user', {
            target_user_id: targetUserId,
            ...data
        });
    }
};

export default reviewApi;
