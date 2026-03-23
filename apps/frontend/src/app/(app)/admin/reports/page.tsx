'use client';

import { useAuth } from '@/features/auth';
import { adminService } from '@/lib/api/services/admin.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Trash2, Eye, FileText, X, Loader2, Flag } from 'lucide-react';
import Link from 'next/link';

interface AggregatedReport {
    target_id: string;
    target_type: 'MODEL' | 'POST' | 'COMMENT';
    count: number;
    reports: {
        id: string;
        reason: string;
        created_at: string;
        reporter: { username: string };
    }[];
}

/* ──────────────────────────────────────────────────────────────────────
   DETAIL MODAL — View all reasons and act
   ────────────────────────────────────────────────────────────────────── */
function ReportDetailModal({
    report,
    onClose,
    onDismiss,
    onDelete,
    isActing,
}: {
    report: AggregatedReport;
    onClose: () => void;
    onDismiss: () => void;
    onDelete: () => void;
    isActing: boolean;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-[#111] sm:border border-gray-800 sm:rounded-2xl w-full sm:max-w-xl max-h-screen sm:max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Bar */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#111]/95 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center shrink-0">
                            <Flag className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base leading-tight">Content Reports</h3>
                            <span className="text-xs text-gray-500">{report.target_type} • ID: {report.target_id.slice(0, 8)}...</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Reasons List */}
                <div className="p-5 flex-1 min-h-0 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-bold text-gray-300">Report History ({report.count})</h4>
                        <Link
                            href={report.target_type === 'MODEL' ? `/catalog/${report.target_id}` : '/community'}
                            target="_blank"
                            className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                        >
                            <Eye className="w-3 h-3" /> Inspect Content
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {report.reports.map((r) => (
                            <div key={r.id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-400">@{r.reporter.username}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-200">{r.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 flex items-center gap-3 px-5 py-4 border-t border-gray-800 bg-[#111]/95 backdrop-blur-md shrink-0">
                    <button
                        onClick={onDismiss}
                        disabled={isActing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Dismiss Reports
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isActing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                    >
                        {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete {report.target_type}
                    </button>
                </div>
            </div>
        </div>
    );
}


/* ──────────────────────────────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────────────────────────────── */
export default function AdminReportsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [selectedReport, setSelectedReport] = useState<AggregatedReport | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && user?.role !== 'ADMIN') {
            router.replace('/forbidden');
        }
    }, [user, isLoading, router]);

    const { data: aggregatedReports, isLoading: isLoadingReports } = useQuery<AggregatedReport[]>({
        queryKey: ['admin-reports'],
        queryFn: adminService.getAggregatedReports,
        enabled: user?.role === 'ADMIN',
    });

    const dismissMutation = useMutation({
        mutationFn: async (targetId: string) => {
            setActionId(targetId);
            await adminService.dismissReports(targetId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
            setActionId(null);
            setSelectedReport(null);
        },
        onError: () => setActionId(null),
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ targetType, targetId }: { targetType: string; targetId: string }) => {
            setActionId(targetId);
            await adminService.deleteReportedContent(targetType, targetId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
            setActionId(null);
            setSelectedReport(null);
        },
        onError: () => setActionId(null),
    });

    if (isLoading || user?.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            {selectedReport && (
                <ReportDetailModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onDismiss={() => dismissMutation.mutate(selectedReport.target_id)}
                    onDelete={() => deleteMutation.mutate({ targetType: selectedReport.target_type, targetId: selectedReport.target_id })}
                    isActing={actionId === selectedReport.target_id}
                />
            )}

            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <h1 className="text-2xl font-bold text-white">Content Reports</h1>
                        </div>
                        <p className="text-gray-400 text-sm">Review user reports and moderate flagged content across the platform.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 self-start">
                        <span className="text-red-500 font-bold">{aggregatedReports?.length ?? 0}</span>
                        <span className="text-gray-400 text-sm">flagged items</span>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
                    {isLoadingReports ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : !aggregatedReports || aggregatedReports.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                <CheckCircle className="w-8 h-8 text-green-500 opacity-80" />
                            </div>
                            <p className="text-gray-400 font-medium">No pending reports</p>
                            <p className="text-gray-500 text-sm mt-1">Community queue is clean!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {/* Table Header */}
                            <div className="hidden md:grid grid-cols-[1fr_2.5fr_1fr_auto] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-black/20">
                                <span>Content Type</span>
                                <span>Latest Report</span>
                                <span>Flag Count</span>
                                <span>Actions</span>
                            </div>

                            {aggregatedReports.map((report) => {
                                const isActing = actionId === report.target_id;
                                const latestReport = report.reports[0];
                                return (
                                    <div
                                        key={report.target_id}
                                        className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1fr_auto] gap-4 px-6 py-4 items-center group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        onClick={() => setSelectedReport(report)}
                                    >
                                        {/* Type & ID */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center shrink-0 text-red-400 text-[10px] font-bold">
                                                <Flag className="w-4 h-4 mb-0.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-semibold text-sm truncate uppercase">
                                                    {report.target_type}
                                                </p>
                                                <p className="text-gray-500 text-xs truncate">
                                                    ID: {report.target_id.slice(0, 8)}...
                                                </p>
                                            </div>
                                        </div>

                                        {/* Latest Status */}
                                        <div className="min-w-0 md:pl-2">
                                            <p className="text-gray-300 text-sm truncate">
                                                &quot;{latestReport?.reason}&quot;
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                Reported by @{latestReport?.reporter.username} • {new Date(latestReport?.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Count */}
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-sm border border-red-500/30">
                                                {report.count} {report.count === 1 ? 'Flag' : 'Flags'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => dismissMutation.mutate(report.target_id)}
                                                disabled={isActing}
                                                title="Dismiss Reports"
                                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hidden md:block"
                                            >
                                                Dismiss
                                            </button>
                                            <button
                                                onClick={() => deleteMutation.mutate({ targetType: report.target_type, targetId: report.target_id })}
                                                disabled={isActing}
                                                title="Delete Content"
                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hidden md:block"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                className="p-2 bg-gray-800 rounded-lg text-white md:hidden"
                                                onClick={() => setSelectedReport(report)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
