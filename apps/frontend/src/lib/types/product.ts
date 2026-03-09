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
