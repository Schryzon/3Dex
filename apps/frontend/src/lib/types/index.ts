export interface User {
    id: string;
    email: string;
    username: string;
    role: 'CUSTOMER' | 'ARTIST' | 'PRINTER' | 'ADMIN';
    avatar?: string;
    createdAt: string;
}

export interface Model {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnails: string[];
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
        avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
    rating?: number;
    reviewCount?: number;
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    userId: string;
    user: {
        username: string;
        avatar?: string;
    };
    modelId: string;
    createdAt: string;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    paymentMethod?: string;
    shippingAddress?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    modelId: string;
    model: Model;
    quantity: number;
    price: number;
}

export interface Purchase {
    id: string;
    userId: string;
    modelId: string;
    model: Model;
    amount: number;
    downloadCount: number;
    maxDownloads: number;
    expiresAt: string;
    createdAt: string;
}

export interface WishlistItem {
    id: string;
    userId: string;
    modelId: string;
    model: Model;
    createdAt: string;
}

export interface CartItem {
    id: string;
    modelId: string;
    model: Model;
    quantity: number;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
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
    email: string;
    username: string;
    password: string;
    role?: 'CUSTOMER' | 'ARTIST';
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ModelFilters {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    format?: string[];
    isPrintable?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular';
    page?: number;
    limit?: number;
}
