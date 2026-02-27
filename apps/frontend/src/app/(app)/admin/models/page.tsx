'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, User, Calendar, Package, Eye, X } from 'lucide-react';

interface PendingModel {
    id: string;
    title: string;
    description: string;
    price: number;
    file_url: string;
    preview_url: string;
    file_key: string;
    created_at: string;
    artist: { id: string; username: string };
}

function ModelPreviewModal({ model, onClose }: { model: PendingModel; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#141414] border border-gray-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    <h3 className="text-white font-bold text-lg line-clamp-1">{model.title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {model.preview_url && (
                    <div className="aspect-video w-full overflow-hidden border-b border-gray-800">
                        <img src={model.preview_url} alt={model.title} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{model.artist.username}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(model.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    {model.description && <p className="text-gray-300 text-sm leading-relaxed">{model.description}</p>}
                    <div className="bg-black/30 rounded-xl p-4 border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">File Key</p>
                        <p className="text-gray-300 text-xs font-mono break-all">{model.file_key || model.file_url}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-400/5 rounded-xl border border-yellow-400/20">
                        <span className="text-gray-400 text-sm">Price</span>
                        <span className="text-yellow-400 font-bold text-lg">Rp {model.price?.toLocaleString('id-ID') ?? '0'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminModelsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [previewModel, setPreviewModel] = useState<PendingModel | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && user?.role !== 'ADMIN') {
            router.replace('/dashboard');
        }
    }, [user, isLoading, router]);

    const { data: pendingModels, isLoading: isLoadingModels } = useQuery<PendingModel[]>({
        queryKey: ['admin-pending-models'],
        queryFn: async () => {
            const res = await api.get('/admin/pending');
            return res.data;
        },
        enabled: user?.role === 'ADMIN',
    });

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            setActionId(id);
            await api.post(`/admin/${id}/approve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-models'] });
            setActionId(null);
        },
        onError: () => setActionId(null),
    });

    const rejectMutation = useMutation({
        mutationFn: async (id: string) => {
            setActionId(id);
            await api.post(`/admin/${id}/reject`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-models'] });
            setActionId(null);
        },
        onError: () => setActionId(null),
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
            {previewModel && <ModelPreviewModal model={previewModel} onClose={() => setPreviewModel(null)} />}

            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <FileText className="w-6 h-6 text-yellow-400" />
                            <h1 className="text-2xl font-bold text-white">Model Approvals</h1>
                        </div>
                        <p className="text-gray-400 text-sm">Review and approve or reject submitted 3D models.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                        <span className="text-yellow-400 font-bold">{pendingModels?.length ?? 0}</span>
                        <span className="text-gray-400 text-sm">pending</span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
                    {isLoadingModels ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : !pendingModels || pendingModels.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                <Package className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400 font-medium">No pending models</p>
                            <p className="text-gray-500 text-sm mt-1">All models have been reviewed.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {/* Table Header */}
                            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-black/20">
                                <span>Model</span>
                                <span>Artist</span>
                                <span>Price</span>
                                <span>Submitted</span>
                                <span>Actions</span>
                            </div>

                            {pendingModels.map((model) => {
                                const isActing = actionId === model.id;
                                return (
                                    <div key={model.id} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-start md:items-center group hover:bg-white/2 transition-colors">
                                        {/* Model Info */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            {model.preview_url ? (
                                                <img src={model.preview_url} alt={model.title} className="w-12 h-12 rounded-lg object-cover border border-gray-700 shrink-0" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-gray-600" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-white font-semibold text-sm truncate">{model.title}</p>
                                                <p className="text-gray-500 text-xs truncate">{model.description || 'No description'}</p>
                                            </div>
                                        </div>

                                        {/* Artist */}
                                        <div className="flex items-center gap-1.5 text-sm text-gray-300">
                                            <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                            <span className="truncate">{model.artist.username}</span>
                                        </div>

                                        {/* Price */}
                                        <span className="text-yellow-400 font-semibold text-sm">
                                            Rp {model.price?.toLocaleString('id-ID') ?? '0'}
                                        </span>

                                        {/* Date */}
                                        <span className="text-gray-500 text-sm">
                                            {new Date(model.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPreviewModel(model)}
                                                title="Preview"
                                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => approveMutation.mutate(model.id)}
                                                disabled={isActing}
                                                title="Approve"
                                                className="p-2 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-400/10 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => rejectMutation.mutate(model.id)}
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
