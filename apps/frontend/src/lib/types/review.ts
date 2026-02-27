export interface Review {
    id: string;
    rating: number;
    comment: string;
    user_id: string;
    user: {
        username: string;
        avatar_url?: string;
    };
    model_id: string;
    created_at: string;
}

export interface UserReview {
    id: string;
    rating: number;
    comment: string;
    reviewer_id: string;
    reviewer: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    target_user_id: string;
    created_at: string;
}
