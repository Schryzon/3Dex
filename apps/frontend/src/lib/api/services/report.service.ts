import { api } from '@/lib/api';

export type ReportTargetType = 'MODEL' | 'POST' | 'COMMENT';

export interface CreateReportPayload {
    target_type: ReportTargetType;
    model_id?: string;
    post_id?: string;
    comment_id?: string;
    reason: string;
}

export const reportService = {
    createReport: async (payload: CreateReportPayload) => {
        const response = await api.post<{ message: string; data: any }>('/reports', payload);
        return response.data;
    },
};
