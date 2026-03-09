import { apiClient } from '../client';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    read: boolean;
    created_at: string;
    link?: string;
}

export interface NotificationResponse {
    data: Notification[];
    unread_count: number;
}

export const notificationService = {
    async getNotifications() {
        const response = await apiClient.get<NotificationResponse>('/notifications');
        return response as any; // apiClient returns data directly in some setups, but here we expect the full object
    },

    async markAsRead(id: string) {
        return apiClient.put(`/notifications/${id}/read`);
    },

    async markAllAsRead() {
        return apiClient.put('/notifications/read-all');
    }
};
