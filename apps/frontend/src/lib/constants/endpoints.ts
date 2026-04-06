export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const MINIO_BASE_URL = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';
export const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        GOOGLE: '/auth/google',
        COMPLETE_PROFILE: '/auth/complete-profile',
    },

    // Models/Products
    MODELS: {
        LIST: '/models',
        DETAIL: (id: string) => `/models/${id}`,
        UPLOAD: '/models',
        UPDATE: (id: string) => `/models/${id}`,
        DELETE: (id: string) => `/models/${id}`,
        DOWNLOAD: (id: string) => `/models/${id}/download`,
    },

    // Reviews
    REVIEWS: {
        MODEL_STATS: (modelId: string) => `/reviews/model/${modelId}/stats`,
        MODEL: (modelId: string) => `/reviews/model/${modelId}`,
        USER_LIST: (userId: string) => `/reviews/user/${userId}`,
        USER_CREATE: '/reviews/user',
    },

    // Orders
    ORDERS: {
        LIST: '/orders',
        CREATE: '/orders',
        DETAIL: (id: string) => `/orders/${id}`,
        TRACKING: (id: string) => `/orders/${id}/tracking`,
    },

    // Payments
    PAYMENTS: {
        CREATE: '/payments/create',
        CALLBACK: '/payments/callback',
        STATUS: (id: string) => `/payments/${id}/status`,
    },

    // Cart
    CART: {
        LIST: '/cart',
        ADD: '/cart/add',
        UPDATE: (id: string) => `/cart/${id}`,
        REMOVE: (id: string) => `/cart/${id}`,
        CLEAR: '/cart/clear',
    },

    // Wishlist
    WISHLIST: {
        LIST: '/wishlist',
        ADD: (modelId: string) => `/wishlist/${modelId}`,
        REMOVE: (id: string) => `/wishlist/${id}`,
    },

    // Purchases
    PURCHASES: {
        LIST: '/purchases',
        DETAIL: (id: string) => `/purchases/${id}`,
    },

    // Users
    USERS: {
        PROFILE: '/users/profile',
        UPDATE: '/users/profile',
        DELETE_ME: '/users/me',
        APPLY_ROLE: '/users/apply-role',
        SEARCH: '/users/search',
        LIBRARY: '/users/library',
        PUBLIC_PROFILE: (username: string) => `/users/${username}`,
        FOLLOW: (userId: string) => `/users/${userId}/follow`,
        UNFOLLOW: (userId: string) => `/users/${userId}/follow`,
    },

    // Admin
    ADMIN: {
        STATS: '/admin/stats',
        USERS: '/admin/users',
        MODELS: '/admin/models',
        APPROVE_MODEL: (id: string) => `/admin/models/${id}/approve`,
        REJECT_MODEL: (id: string) => `/admin/models/${id}/reject`,
    },

    // Notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
    },
} as const;
