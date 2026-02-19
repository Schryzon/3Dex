export interface Address {
    label: string;
    city: string;
    region: string;
    country: string;
    details: string;
    postalCode?: string;
}

export interface ProviderConfig {
    materials: string[];
    colors: string[];
    printerTypes: string[];
    basePrice?: number;
    maxDimensions?: { x: number; y: number; z: number };
}

export interface PortfolioItem {
    url: string;
    description?: string;
    title?: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    display_name?: string;
    bio?: string;
    website?: string;
    location?: string;
    role: 'CUSTOMER' | 'ARTIST' | 'PROVIDER' | 'ADMIN';
    avatar_url?: string;
    avatar?: string;
    created_at: string;
    account_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    addresses: Address[];
    provider_config?: ProviderConfig;
    portfolio?: PortfolioItem[];
    rating: number;
    review_count: number;
    social_twitter?: string;
    social_instagram?: string;
    social_artstation?: string;
    social_behance?: string;
    two_factor_enabled?: boolean;
}

export interface Model {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnails: string[];
    model_file_url: string;
    file_format: string[];
    poly_count?: number;
    category: string;
    tags: string[];
    is_printable: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    artist_id: string;
    artist: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    created_at: string;
    updated_at: string;
    rating?: number;
    review_count?: number;
}

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

export interface Post {
    id: string;
    user_id: string;
    user?: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    caption?: string;
    media_urls: string[];
    like_count: number;
    comment_count: number;
    created_at: string;
    liked_by_me?: boolean;
}

export interface PostComment {
    id: string;
    post_id: string;
    user_id: string;
    user: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    content: string;
    created_at: string;
}

export interface PrintConfig {
    material: string;
    color: string;
    scale: number;
    infill?: number;
    layerHeight?: number;
}

export interface OrderItem {
    id: string;
    model_id: string;
    model?: Model;
    quantity: number;
    price: number;
    print_config?: PrintConfig;
    print_status?: 'PENDING' | 'ACCEPTED' | 'PRINTING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

export interface Order {
    id: string;
    user_id: string;
    provider_id?: string;
    provider?: User;
    items: OrderItem[];
    total_amount: number;
    status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    type: 'PURCHASE' | 'PRINT_JOB';
    payment_method?: string;
    shipping_address?: Address;
    courier_name?: string;
    tracking_number?: string;
    created_at: string;
    updated_at: string;
}

export interface Purchase {
    id: string;
    user_id: string;
    model_id: string;
    model: Model;
    amount: number;
    download_count: number;
    max_downloads: number;
    expires_at: string;
    created_at: string;
}

export interface WishlistItem {
    id: string;
    user_id: string;
    model_id: string;
    model: Model;
    created_at: string;
}

export interface CartItem {
    id: string;
    model_id: string;
    model: Model;
    quantity: number;
    print_config?: PrintConfig;
    type?: 'DIGITAL' | 'PRINT';
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role?: 'CUSTOMER' | 'ARTIST' | 'PROVIDER';
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ProviderFilters {
    city?: string;
    country?: string;
    material?: string;
    sort?: string;
    page?: number;
    limit?: number;
}
