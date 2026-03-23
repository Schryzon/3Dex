import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import { USE_MOCK_DATA } from './product.service';
import { cartService } from './cart.service';
import type { Order } from '@/lib/types';

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

export const orderService = {
    async createOrder(data: CreateOrderRequest): Promise<Order> {
        return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, data);
    },

    async checkout(modelIds: string[]): Promise<{ orderId: string; token: string; redirect_url: string }> {
        if (USE_MOCK_DATA) {
            // Clear mock cart on successful "checkout"
            await cartService.clearCart();

            return {
                orderId: `mock-order-${Date.now()}`,
                token: 'mock-snap-token',
                redirect_url: '/checkout/success' // This will be handled by our frontend logic
            };
        }
        return apiClient.post('/orders/checkout', { model_ids: modelIds });
    },

    async getOrders(): Promise<Order[]> {
        return apiClient.get<Order[]>(API_ENDPOINTS.ORDERS.LIST);
    },

    async getOrderById(id: string): Promise<Order> {
        return apiClient.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(id));
    },

    async getOrderTracking(id: string): Promise<any> {
        return apiClient.get(API_ENDPOINTS.ORDERS.TRACKING(id));
    },
};
