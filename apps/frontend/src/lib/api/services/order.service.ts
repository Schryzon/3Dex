import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import { USE_MOCK_DATA } from './product.service';
import { cartService } from './cart.service';
import type { Order, OrderItem } from '@/types';
import type { Model } from '@/types/catalog';

export const orderKeys = {
    all: ['orders'] as const,
    detail: (id: string) => [...orderKeys.all, id] as const,
} as const;

interface CreateOrderRequest {
    items: Array<{
        modelId: string;
        quantity: number;
    }>;
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}

export type CheckoutLine = { model_id: string; quantity: number };

export type CheckoutResult = {
    orderId: string;
    token: string;
    redirect_url: string;
};

function mapModelFromOrderApi(raw: any): Model {
    const preview = raw?.preview_url;
    return {
        id: raw?.id || '',
        title: raw?.title || '',
        description: '',
        price: raw?.price ?? 0,
        thumbnails: preview ? [preview] : [],
        images: preview ? [preview] : [],
        modelFileUrl: '',
        fileFormat: 'GLB',
        category: 'General',
        license: 'PERSONAL_USE',
        tags: [],
        isPrintable: false,
        status: 'APPROVED',
        artistId: '',
        artist: {
            id: '',
            username: raw?.artist?.username || 'Unknown',
        },
        createdAt: '',
        updatedAt: '',
        rating: 0,
        reviewCount: 0,
    };
}

function mapOrderItemFromApi(raw: any): OrderItem {
    return {
        id: raw.id,
        model_id: raw.model_id,
        quantity: raw.quantity ?? 1,
        price: raw.price ?? 0,
        model: raw.model ? mapModelFromOrderApi(raw.model) : undefined,
    };
}

function mapOrderFromApi(raw: any): Order {
    const mapped = {
        id: raw.id,
        user_id: raw.user_id,
        items: Array.isArray(raw.items) ? raw.items.map(mapOrderItemFromApi) : [],
        total_amount: raw.total_amount ?? 0,
        status: raw.status,
        type: raw.type === 'PRINT_JOB' ? 'PRINT_JOB' : 'PURCHASE',
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    };
    return mapped as Order;
}

function normalizeCheckoutResponse(raw: any): CheckoutResult {
    return {
        orderId: String(raw.order_id ?? raw.orderId ?? ''),
        token: String(raw.token ?? ''),
        redirect_url: String(raw.redirect_url ?? raw.redirectUrl ?? ''),
    };
}

export const orderService = {
    async createOrder(data: CreateOrderRequest): Promise<Order> {
        return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, data);
    },

    /**
     * Starts checkout. Sends `items` with quantities so totals match the cart and backend validation.
     */
    async checkout(lines: CheckoutLine[]): Promise<CheckoutResult> {
        if (USE_MOCK_DATA) {
            await cartService.clearCart();
            return {
                orderId: `mock-order-${Date.now()}`,
                token: 'mock-snap-token',
                redirect_url: '/checkout/success',
            };
        }
        const raw = await apiClient.post<any>('/orders/checkout', { items: lines });
        return normalizeCheckoutResponse(raw);
    },

    async getOrders(): Promise<Order[]> {
        const raw = await apiClient.get<any[]>(API_ENDPOINTS.ORDERS.LIST);
        return Array.isArray(raw) ? raw.map(mapOrderFromApi) : [];
    },

    async getOrderById(id: string): Promise<Order> {
        const raw = await apiClient.get<any>(API_ENDPOINTS.ORDERS.DETAIL(id));
        return mapOrderFromApi(raw);
    },

    async getOrderTracking(id: string): Promise<any> {
        return apiClient.get(API_ENDPOINTS.ORDERS.TRACKING(id));
    },
};
