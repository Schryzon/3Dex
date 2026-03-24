import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';

interface CreatePaymentResponse {
    token: string;
    redirectUrl: string;
}

interface PaymentStatus {
    orderId: string;
    status: 'pending' | 'success' | 'failed' | 'expired';
    transactionId?: string;
    paymentType?: string;
    grossAmount?: number;
}

export const paymentService = {
    async createPayment(orderId: string): Promise<CreatePaymentResponse> {
        return apiClient.post<CreatePaymentResponse>(API_ENDPOINTS.PAYMENTS.CREATE, { orderId });
    },

    async checkPaymentStatus(orderId: string): Promise<PaymentStatus> {
        return apiClient.get<PaymentStatus>(API_ENDPOINTS.PAYMENTS.STATUS(orderId));
    },

    async handleCallback(data: any): Promise<void> {
        return apiClient.post(API_ENDPOINTS.PAYMENTS.CALLBACK, data);
    },
};
