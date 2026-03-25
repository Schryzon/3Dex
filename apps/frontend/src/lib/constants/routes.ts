export const ROUTES = {
    PUBLIC: {
        HOME: '/',
        CATALOG: '/catalog',
        TEXTURES: '/catalog?category=Textures',
        PRINT_SERVICES: '/print-services',
        COMMUNITY: '/community',
        USER_PROFILE: (username: string) => `/u/${username}`,
        BECOME_ARTIST: '/become-artist',
        BECOME_PROVIDER: '/become-provider',
    },
    USER: {
        DASHBOARD: '/dashboard',
        PROFILE: '/profile',
        NOTIFICATIONS: '/notifications',
        DOWNLOADS: '/downloads',
        ORDERS: '/orders',
        SAVED: '/saved',
        CART: '/cart',
        PROFILE_UPLOADS: '/profile?tab=uploads',
        PROFILE_COLLECTIONS: '/profile?tab=collections',
        PROFILE_SERVICE: '/profile?tab=service',
        PROFILE_JOBS: '/profile?tab=jobs',
        PROFILE_WORKSHOP: '/profile?tab=workshop',
        PROFILE_SETTINGS: '/profile?tab=settings',
    },
    ARTIST: {
        UPLOAD: '/upload',
        ANALYTICS: '/artist/analytics',
    },
    PROVIDER: {
        DASHBOARD: '/provider/dashboard',
        JOBS: '/provider/jobs',
        ANALYTICS: '/provider/analytics',
    },
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        USERS: '/admin/users',
        MODELS: '/admin/models',
        REPORTS: '/admin/reports',
        ANALYTICS: '/admin/analytics',
    }
} as const;
