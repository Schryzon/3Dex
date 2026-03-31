import { User } from "./auth";

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

// token is no longer sent in the response body — it is set as an HTTP-only cookie.
// Kept as optional here for backward compatibility with any code that may still reference it.
export interface AuthResponse {
    token?: string;
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
export interface ModelFilters {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    format?: string[];
    types?: string[];
    isPrintable?: boolean;
    sort?: string;
    artistId?: string;
    page?: number;
    limit?: number;
}

export interface PublicAnalyticsStats {
    models: number;
    customers: number;
    artists: number;
    providers: number;
}

export interface ArtistRecentSale {
    id: string;
    created_at: string;
    price_paid: number;
    model: { title: string };
    user: { username: string };
}

export interface ArtistTopModel {
    id: string;
    title: string;
    sales: number;
}

export interface ArtistAnalyticsStats {
    total_sales: number;
    total_earnings: number;
    recent_sales: ArtistRecentSale[];
    sales_by_month: Record<string, number>;
    top_models: ArtistTopModel[];
}

export interface ProviderRecentOrder {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    user: { username: string };
    items: {
        price: number;
        print_status: string;
        model: { title: string } | null;
    }[];
}

export interface ProviderAnalyticsStats {
    total_jobs: number;
    completed_jobs: number;
    pending_jobs: number;
    failed_jobs: number;
    total_earnings: number;
    completion_rate: number;
    recent_orders: ProviderRecentOrder[];
    earnings_by_month: Record<string, number>;
    rating: number;
    review_count: number;
}
