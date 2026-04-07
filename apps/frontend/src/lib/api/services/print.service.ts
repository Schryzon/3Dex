import { apiClient } from '../client';
import type { ProviderFilters } from '@/types';


export interface PrintJob {
    id: string;
    // user_id is used in the JobsTab template for order attribution
    user_id: string;
    user: {
        username: string;
        avatar_url?: string;
    };
    total_amount: number;
    status: string;
    items: Array<{
        id: string;
        model: {
            title: string;
            preview_url?: string;
            // thumbnails is used in the JobsTab template
            thumbnails?: string[];
        };
        price: number;
        print_config: any;
        print_status: string;
        // quantity is used in the JobsTab template
        quantity?: number;
    }>;
    created_at: string;
    shipping_address?: any;
    courier_name?: string;
    tracking_number?: string;
    proof_urls?: string[];
}

export const printService = {
    // For providers: fetch their incoming print jobs
    async getProviderJobs(): Promise<PrintJob[]> {
        return apiClient.get<PrintJob[]>('/print/jobs');
    },

    // Alias used by JobsTab.tsx (formerly from lib/services/print.service)
    async getIncomingJobs(): Promise<PrintJob[]> {
        return this.getProviderJobs();
    },

    // For the print-services listing page: search/filter providers
    async getProviders(filters?: ProviderFilters): Promise<any[]> {
        return apiClient.get<any[]>('/print/providers', { params: filters });
    },

    async getPrintStats(): Promise<{ provider_count: string; orders_count: string; avg_rating: string; avg_response: string }> {
        return apiClient.get('/print/stats');
    },

    async manageOrder(orderId: string, action: 'ACCEPT' | 'REJECT' | 'SHIP' | 'COMPLETE', trackingNumber?: string, proofUrls?: string[]): Promise<{ message: string }> {
        return apiClient.patch(`/print/jobs/${orderId}`, { action, tracking_number: trackingNumber, proof_urls: proofUrls });
    },

    // Alias used by JobsTab.tsx (formerly from lib/services/print.service)
    async manageJob(orderId: string, action: 'ACCEPT' | 'REJECT' | 'SHIP' | 'COMPLETE', trackingNumber?: string, proofUrls?: string[]): Promise<{ message: string }> {
        return this.manageOrder(orderId, action, trackingNumber, proofUrls);
    },

    // For the order placement page: submit a new print order to a provider
    async createOrder(data: { provider_id: string; items: any[]; shipping_address: any }): Promise<{ id: string }> {
        return apiClient.post<{ id: string }>('/print/orders', data);
    },
};

