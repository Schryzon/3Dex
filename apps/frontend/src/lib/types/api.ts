import { User } from "./user";

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
    isPrintable?: boolean;
    sort?: string;
    artistId?: string;
    page?: number;
    limit?: number;
}
