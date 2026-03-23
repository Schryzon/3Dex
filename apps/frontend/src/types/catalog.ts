export interface Model {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnails: string[];
    images: string[];
    modelFileUrl: string;
    fileFormat: string[];
    polyCount?: number;
    category: string;
    tags: string[];
    isPrintable: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    artistId: string;
    artist: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    is_nsfw?: boolean;
    createdAt: string;
    updatedAt: string;
    rating?: number;
    reviewCount?: number;
    isPurchased?: boolean;
}

export interface WishlistItem {
    id: string;
    user_id: string;
    model_id: string;
    modelId?: string;
    created_at: string;
    model?: Model;
}
import { ThreeElements } from '@react-three/fiber'

declare global {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}
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

export interface UserReview {
    id: string;
    rating: number;
    comment: string | null;
    reviewer_id: string;
    reviewer: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    target_user_id: string;
    created_at: string;
}
