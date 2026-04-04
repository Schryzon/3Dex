'use client';

import { useAuth } from '@/features/auth';
import { api } from '@/lib/api';
import { productKeys } from '@/lib/api/services/product.service';
import { getStorageUrl } from '@/lib/utils/storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    FileText, CheckCircle, XCircle, User, Calendar, Package, Eye, X,
    Tag, Layers, DollarSign, Download, ExternalLink, Clock, Info, Loader2,
    ChevronDown, Image as ImageIcon, Box
} from 'lucide-react';

interface PendingModel {
    id: string;
    title: string;
    description: string;
    price: number;
    file_url: string;
    preview_url: string;
    file_key: string;
    created_at: string;
    artist: { id: string; username: string; avatar_url?: string; display_name?: string };
    category?: { id: string; name: string; slug: string };
    tags?: { id: string; name: string }[];
}

/* ──────────────────────────────────────────────────────────────────────
   DETAIL MODAL — Full model details with approve / reject inside
   ────────────────────────────────────────────────────────────────────── */
function ModelDetailModal({
    model,
    onClose,
    onApprove,
    onReject,
    isActing,
}: {
    model: PendingModel;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
    isActing: boolean;
}) {
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-[#111] sm:border border-gray-800 sm:rounded-2xl w-full sm:max-w-2xl max-h-screen sm:max-h-[92vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Bar */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#111]/95 backdrop-blur-md">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center shrink-0">
                            <Box className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-white font-bold text-base leading-tight truncate">{model.title}</h3>
                            <span className="text-xs text-gray-500">Review submission</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Preview Image */}
                <div className="relative aspect-video w-full bg-gray-900 overflow-hidden border-b border-gray-800">
                    {model.preview_url && !imgError ? (
                        <img
                            src={getStorageUrl(model.preview_url)}
                            alt={model.title}
                            className="w-full h-full object-contain bg-black"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-sm">No preview available</span>
                        </div>
                    )}
                    {/* Price badge */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-lg">
                        <span className="text-yellow-400 font-bold text-sm">
                            {model.price === 0 ? 'FREE' : `Rp ${model.price?.toLocaleString('id-ID')}`}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">

                    {/* Artist Info Card */}
                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                        <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                            {model.artist.avatar_url ? (
                                <img src={getStorageUrl(model.artist.avatar_url)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-gray-500" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">
                                {model.artist.display_name || model.artist.username}
                            </p>
                            <p className="text-gray-500 text-xs">@{model.artist.username}</p>
                        </div>
                        <a
                            href={`/u/${model.artist.username}`}
                            target="_blank"
                            className="ml-auto text-gray-500 hover:text-yellow-400 transition-colors shrink-0"
                            title="View artist profile"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-800">
                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
                                <DollarSign className="w-3 h-3" /> Price
                            </div>
                            <p className="text-yellow-400 font-bold text-sm">
                                {model.price === 0 ? 'FREE' : `Rp ${model.price?.toLocaleString('id-ID')}`}
                            </p>
                        </div>
                        <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-800">
                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
                                <Calendar className="w-3 h-3" /> Submitted
                            </div>
                            <p className="text-white font-medium text-sm">
                                {new Date(model.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-800 col-span-2 sm:col-span-1">
                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
                                <Layers className="w-3 h-3" /> Category
                            </div>
                            <p className="text-white font-medium text-sm">
                                {model.category?.name || 'Uncategorized'}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    {model.description && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5" /> Description
                            </h4>
                            <p className="text-gray-300 text-sm leading-relaxed bg-gray-900/30 p-4 rounded-xl border border-gray-800 whitespace-pre-wrap">
                                {model.description}
                            </p>
                        </div>
                    )}

                    {/* Tags */}
                    {model.tags && model.tags.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" /> Tags
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {model.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium border border-gray-700"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* File Info */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> File
                        </h4>
                        <div className="bg-gray-900/30 rounded-xl p-3 border border-gray-800 flex items-center justify-between gap-3">
                            <p className="text-gray-400 text-xs font-mono break-all flex-1">
                                {model.file_key || model.file_url?.split('/').pop() || 'Unknown file'}
                            </p>
                            {model.file_url && (
                                <a
                                    href={model.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Reject Reason Input */}
                    {showRejectInput && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-xs font-bold text-red-400 uppercase tracking-wider">Rejection Reason</label>
                            <textarea
                                rows={2}
                                placeholder="Briefly explain why..."
                                className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 outline-none focus:border-red-400 transition-colors resize-none"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 flex items-center gap-3 px-5 py-4 border-t border-gray-800 bg-[#111]/95 backdrop-blur-md">
                    {!showRejectInput ? (
                        <>
                            <button
                                onClick={() => setShowRejectInput(true)}
                                disabled={isActing}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <XCircle className="w-4 h-4" /> Reject
                            </button>
                            <button
                                onClick={onApprove}
                                disabled={isActing}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                            >
                                {isActing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><CheckCircle className="w-4 h-4" /> Approve</>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onReject}
                                disabled={isActing}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {isActing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting...</>
                                ) : (
                                    <><XCircle className="w-4 h-4" /> Confirm Reject</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}


/* ──────────────────────────────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────────────────────────────── */
export default function AdminModelsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [selectedModel, setSelectedModel] = useState<PendingModel | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && user?.role !== 'ADMIN') {
            router.replace('/forbidden');
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
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            setActionId(null);
            setSelectedModel(null);
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
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            setActionId(null);
            setSelectedModel(null);
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
            {selectedModel && (
                <ModelDetailModal
                    model={selectedModel}
                    onClose={() => setSelectedModel(null)}
                    onApprove={() => approveMutation.mutate(selectedModel.id)}
                    onReject={() => rejectMutation.mutate(selectedModel.id)}
                    isActing={actionId === selectedModel.id}
                />
            )}

            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <FileText className="w-6 h-6 text-yellow-400" />
                            <h1 className="text-2xl font-bold text-white">Model Approvals</h1>
                        </div>
                        <p className="text-gray-400 text-sm">Review and approve or reject submitted 3D models.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 rounded-full border border-yellow-400/20 self-start">
                        <span className="text-yellow-400 font-bold">{pendingModels?.length ?? 0}</span>
                        <span className="text-gray-400 text-sm">pending</span>
                    </div>
                </div>

                {/* Content */}
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
                        <>
                            {/* ──── DESKTOP TABLE ──── */}
                            <div className="hidden md:block divide-y divide-gray-800">
                                {/* Table Header */}
                                <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-black/20">
                                    <span>Model</span>
                                    <span>Artist</span>
                                    <span>Price</span>
                                    <span>Submitted</span>
                                    <span>Actions</span>
                                </div>

                                {pendingModels.map((model) => {
                                    const isActing = actionId === model.id;
                                    return (
                                        <div
                                            key={model.id}
                                            className="grid grid-cols-[2.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                            onClick={() => setSelectedModel(model)}
                                        >
                                            {/* Model Info */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                {model.preview_url ? (
                                                    <img
                                                        src={getStorageUrl(model.preview_url)}
                                                        alt={model.title}
                                                        className="w-12 h-12 rounded-lg object-cover border border-gray-700 shrink-0 group-hover:border-gray-600 transition-colors"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                                                        <FileText className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate group-hover:text-yellow-400 transition-colors">
                                                        {model.title}
                                                    </p>
                                                    <p className="text-gray-500 text-xs truncate max-w-[300px]">
                                                        {model.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Artist */}
                                            <div className="flex items-center gap-1.5 text-sm text-gray-300">
                                                <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                                <span className="truncate">{model.artist.username}</span>
                                            </div>

                                            {/* Price */}
                                            <span className="text-yellow-400 font-semibold text-sm">
                                                {model.price === 0 ? 'FREE' : `Rp ${model.price?.toLocaleString('id-ID')}`}
                                            </span>

                                            {/* Date */}
                                            <span className="text-gray-500 text-sm">
                                                {new Date(model.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setSelectedModel(model)}
                                                    title="View Details"
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

                            {/* ──── MOBILE CARDS ──── */}
                            <div className="md:hidden divide-y divide-gray-800">
                                {pendingModels.map((model) => {
                                    const isActing = actionId === model.id;
                                    return (
                                        <div
                                            key={model.id}
                                            className="p-4 space-y-3 active:bg-white/[0.02] transition-colors"
                                            onClick={() => setSelectedModel(model)}
                                        >
                                            <div className="flex gap-3">
                                                {/* Thumbnail */}
                                                {model.preview_url ? (
                                                    <img
                                                        src={getStorageUrl(model.preview_url)}
                                                        alt={model.title}
                                                        className="w-16 h-16 rounded-xl object-cover border border-gray-700 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                                                        <FileText className="w-6 h-6 text-gray-600" />
                                                    </div>
                                                )}

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">{model.title}</p>
                                                    <p className="text-gray-500 text-xs truncate mt-0.5">
                                                        {model.description || 'No description'}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs">
                                                        <span className="flex items-center gap-1 text-gray-400">
                                                            <User className="w-3 h-3" /> {model.artist.username}
                                                        </span>
                                                        <span className="text-yellow-400 font-semibold">
                                                            {model.price === 0 ? 'FREE' : `Rp ${model.price?.toLocaleString('id-ID')}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Row */}
                                            <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                                                <span className="text-gray-600 text-xs flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(model.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedModel(model)}
                                                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Eye className="w-3 h-3" /> View
                                                    </button>
                                                    <button
                                                        onClick={() => approveMutation.mutate(model.id)}
                                                        disabled={isActing}
                                                        className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        <CheckCircle className="w-3 h-3" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => rejectMutation.mutate(model.id)}
                                                        disabled={isActing}
                                                        className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        <XCircle className="w-3 h-3" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
