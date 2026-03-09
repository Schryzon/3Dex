'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, Calendar, Briefcase, User } from 'lucide-react';

interface PendingUser {
    id: string;
    username: string;
    email: string;
    role: string;
    portfolio: string | null;
    created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
    ARTIST: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    PROVIDER: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    CUSTOMER: 'text-green-400 bg-green-400/10 border-green-400/20',
};

export default function AdminUsersPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && user?.role !== 'ADMIN') {
            router.replace('/forbidden');
        }
    }, [user, isLoading, router]);

    const { data: pendingUsers, isLoading: isLoadingUsers } = useQuery<PendingUser[]>({
        queryKey: ['admin-pending-users'],
        queryFn: async () => {
            const res = await api.get('/admin/users/status?status=PENDING');
            return res.data;
        },
        enabled: user?.role === 'ADMIN',
    });

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            setActionId(id);
            await api.post(`/admin/users/${id}/approve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-users'] });
            setActionId(null);
        },
        onError: () => setActionId(null),
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            await api.post(`/admin/users/${id}/reject`, { reason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-users'] });
            setRejectId(null);
            setRejectReason('');
        },
    });

    if (isLoading || user?.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Reject Reason Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141414] border border-gray-700 rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-white font-bold text-lg mb-2">Reject User Application</h3>
                        <p className="text-gray-400 text-sm mb-4">Please provide a reason for rejecting this application.</p>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="Enter rejection reason..."
                            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:outline-none resize-none text-sm mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setRejectId(null); setRejectReason(''); }}
                                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                                disabled={!rejectReason.trim() || rejectMutation.isPending}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-semibold transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
                            >
                                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Users className="w-6 h-6 text-blue-400" />
                            <h1 className="text-2xl font-bold text-white">User Approvals</h1>
                        </div>
                        <p className="text-gray-400 text-sm">Review Artist and Provider applications.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-400/10 rounded-full border border-blue-400/20">
                        <span className="text-blue-400 font-bold">{pendingUsers?.length ?? 0}</span>
                        <span className="text-gray-400 text-sm">pending</span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
                    {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : !pendingUsers || pendingUsers.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                <Users className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400 font-medium">No pending applications</p>
                            <p className="text-gray-500 text-sm mt-1">All user applications have been processed.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {/* Table Header */}
                            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-black/20">
                                <span>User</span>
                                <span>Role</span>
                                <span>Portfolio</span>
                                <span>Joined</span>
                                <span>Actions</span>
                            </div>

                            {pendingUsers.map((u) => {
                                const isActing = actionId === u.id;
                                const roleColor = ROLE_COLORS[u.role] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
                                return (
                                    <div key={u.id} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-start md:items-center hover:bg-white/2 transition-colors">
                                        {/* User Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-700 shrink-0">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">{u.username}</p>
                                                <p className="text-gray-500 text-xs">{u.email}</p>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColor}`}>
                                            {u.role}
                                        </span>

                                        {/* Portfolio */}
                                        <div className="flex items-center gap-1.5 text-sm">
                                            {u.portfolio ? (
                                                <a href={u.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    <span className="underline text-xs truncate max-w-[120px]">View</span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-600 text-xs">—</span>
                                            )}
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => approveMutation.mutate(u.id)}
                                                disabled={isActing}
                                                title="Approve"
                                                className="p-2 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-400/10 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setRejectId(u.id)}
                                                disabled={isActing}
                                                title="Reject"
                                                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <XCircle className="w-5 h-5" />
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
