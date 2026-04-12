import { api } from '@/lib/api';
import { User, Model } from '@/types';

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
    },

    // Reports
    getAggregatedReports: async () => {
        const response = await api.get<{ data: any[] }>('/admin/reports');
        return response.data.data;
    },

    dismissReports: async (targetId: string) => {
        const response = await api.post(`/admin/reports/${targetId}/dismiss`);
        return response.data;
    },

    deleteReportedContent: async (targetType: string, targetId: string) => {
        const response = await api.delete(`/admin/reports/${targetType}/${targetId}/delete`);
        return response.data;
    },
    // Dashboard Summary
    getDashboardSummary: async () => {
        const response = await api.get<{
            counts: { models: number; users: number; reports: number };
            recent: { models: any[]; users: any[]; reports: any[] };
            stats: any;
        }>('/admin/summary');
        return response.data;
    },

    // Audit Logs
    getAuditLogs: async (params?: {
        action?: string;
        admin_id?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }) => {
        const query = new URLSearchParams();
        if (params?.action)    query.set('action', params.action);
        if (params?.admin_id)  query.set('admin_id', params.admin_id);
        if (params?.from)      query.set('from', params.from);
        if (params?.to)        query.set('to', params.to);
        if (params?.page)      query.set('page', String(params.page));
        if (params?.limit)     query.set('limit', String(params.limit));
        const qs = query.toString();
        const response = await api.get<{
            data: {
                id: string;
                action: string;
                target_id: string;
                target_type: string;
                reason: string;
                metadata: any;
                created_at: string;
                admin: { id: string; username: string; display_name: string | null; avatar_url: string | null };
            }[];
            meta: { total: number; page: number; limit: number; pages: number };
        }>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
        return response.data;
    }
};
