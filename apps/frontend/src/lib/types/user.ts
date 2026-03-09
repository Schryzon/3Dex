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
    banner_url?: string;
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
    show_nsfw?: boolean;
    _count?: {
        followers: number;
        following: number;
    };
}
