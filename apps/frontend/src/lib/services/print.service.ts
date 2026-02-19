import { api } from '../api';
import { User, Order, ProviderFilters, ApiResponse, PrintConfig } from '../types';

export const printService = {
    // Search Providers
    getProviders: async (filters: ProviderFilters) => {
        const queryParams = new URLSearchParams();
        if (filters.city) queryParams.append('city', filters.city);
        if (filters.country) queryParams.append('country', filters.country);
        if (filters.material) queryParams.append('material', filters.material);
        if (filters.sort) queryParams.append('sort', filters.sort);

        const response = await api.get<User[]>(`/print/providers?${queryParams.toString()}`);
        return response.data;
    },

    // Create Order
    createOrder: async (data: {
        provider_id: string;
        items: { model_id: string; print_config: PrintConfig }[];
        shipping_address: any; // Address snapshot
        courier_name?: string;
    }) => {
        const response = await api.post<Order>('/print/orders', data);
        return response.data;
    },

    // Get Provider Jobs (Incoming)
    getIncomingJobs: async () => {
        const response = await api.get<Order[]>('/print/jobs');
        return response.data;
    },

    // Manage Job (Provider)
    manageJob: async (orderId: string, action: 'ACCEPT' | 'REJECT' | 'SHIP' | 'COMPLETE', trackingNumber?: string) => {
        const response = await api.patch<{ message: string }>(`/print/jobs/${orderId}`, {
            action,
            tracking_number: trackingNumber
        });
        return response.data;
    }
};
