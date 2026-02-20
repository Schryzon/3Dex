import { apiClient } from '../client';

export interface PrintJob {
    id: string;
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
        };
        price: number;
        print_config: any;
        print_status: string;
    }>;
    created_at: string;
    shipping_address?: any;
    courier_name?: string;
    tracking_number?: string;
}

export const printService = {
    async getProviderJobs(): Promise<PrintJob[]> {
        return apiClient.get<PrintJob[]>('/print/jobs');
    },

    async manageOrder(orderId: string, action: 'ACCEPT' | 'REJECT' | 'SHIP' | 'COMPLETE', trackingNumber?: string): Promise<{ message: string }> {
        return apiClient.patch(`/print/jobs/${orderId}`, { action, tracking_number: trackingNumber });
    },
};
