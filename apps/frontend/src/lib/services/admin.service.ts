import { api } from '../api';
import { User, Model } from '../types';

export const adminService = {
    // Models
    getPendingModels: async () => {
        const response = await api.get<Model[]>('/admin/pending');
        return response.data;
    },

    approveModel: async (id: string) => {
        const response = await api.post<Model>(`/admin/${id}/approve`);
        return response.data;
    },

    rejectModel: async (id: string) => {
        const response = await api.post<Model>(`/admin/${id}/reject`);
        return response.data;
    },

    // Users
    getUsersByStatus: async (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
        const response = await api.get<User[]>(`/admin/users/status?status=${status}`);
        return response.data;
    },

    approveUser: async (id: string) => {
        const response = await api.post<{ message: string; user: User }>(`/admin/users/${id}/approve`);
        return response.data;
    },

    rejectUser: async (id: string, reason: string) => {
        const response = await api.post<{ message: string; user: User }>(`/admin/users/${id}/reject`, { reason });
        return response.data;
    },

    // Stats
    triggerStatsAggregation: async () => {
        const response = await api.post('/admin/stats/trigger');
        return response.data;
    }
};
