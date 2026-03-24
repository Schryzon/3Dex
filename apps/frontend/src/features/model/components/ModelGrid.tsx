'use client';
import { useProducts, useDeleteProduct } from '@/features/catalog/hooks/useProducts';
import Link from 'next/link';
import { Box, Upload, EllipsisVertical, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/features/auth';
import EditModelModal from './EditModelModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import type { Model } from '@/types';

interface ModelGridProps {
    artistId?: string;
    showUpload?: boolean;
}

export default function ModelGrid({ artistId, showUpload = false }: ModelGridProps) {
    const { data, isLoading } = useProducts({ artistId });
    const { user: currentUser } = useAuth();
    const deleteMutation = useDeleteProduct();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [editingModel, setEditingModel] = useState<Model | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

    const isAdmin = currentUser?.role === 'ADMIN';
    const isOwner = currentUser?.id === artistId;
    const canManage = isAdmin || (showUpload && isOwner);

    const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpenId(null);
        setDeleteTarget({ id, title });
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeletingId(deleteTarget.id);
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
        } catch (error) {
            console.error('Failed to delete model:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEditClick = (e: React.MouseEvent, model: Model) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpenId(null);
        setEditingModel(model);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
                        <div className="aspect-[4/3] bg-gray-800" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-gray-800 rounded w-3/4" />
                            <div className="h-3 bg-gray-800 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data?.data || data.data.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-gray-800 border-dashed">
                <Box className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No models found</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    {showUpload ? 'Upload your first 3D model to start selling.' : "This user hasn't uploaded any models yet."}
                </p>
                {showUpload && (
                    <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
                        <Upload className="w-4 h-4" />
                        Upload Asset
                    </Link>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.data.map((model) => (
                    <div
                        key={model.id}
                        className="group relative bg-[#111] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-300 flex flex-col"
                    >
                        {/* ── Thumbnail ── */}
                        <Link href={`/catalog/${model.id}`} className="block relative overflow-hidden aspect-[4/3] bg-gray-900 flex-shrink-0">
                            {model.thumbnails[0] ? (
                                <>
                                    <img
                                        src={model.thumbnails[0]}
                                        alt={model.title}
                                        className={`w-full h-full object-cover transition-transform duration-500 ${model.is_nsfw && !currentUser?.show_nsfw
                                            ? 'blur-2xl scale-125'
                                            : 'group-hover:scale-105'
                                            }`}
                                    />
                                    {model.is_nsfw && !currentUser?.show_nsfw && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white z-10 pointer-events-none">
                                            <AlertTriangle className="w-10 h-10 text-red-500 mb-2 opacity-80 drop-shadow-lg" />
                                            <p className="font-bold text-sm tracking-wide drop-shadow-md">NSFW</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                    <Box className="w-12 h-12" />
                                </div>
                            )}

                            {/* Gradient overlay at bottom of image */}
                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                        </Link>

                        {/* ── Badges Row (outside image, above info) ── */}
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-10">
                            {/* Status badge — left */}
                            <span className={`pointer-events-auto inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${model.status === 'APPROVED'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : model.status === 'PENDING'
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}>
                                {model.status}
                            </span>

                            {/* Right side: action menu + price */}
                            <div className="pointer-events-auto flex items-center gap-2">
                                {/* ⋮ action menu — only for owner/admin */}
                                {canManage && (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setMenuOpenId(menuOpenId === model.id ? null : model.id);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center bg-black/70 backdrop-blur-md rounded-lg text-white hover:bg-yellow-400 hover:text-black transition-all border border-white/10"
                                        >
                                            <EllipsisVertical className="w-4 h-4" />
                                        </button>

                                        {menuOpenId === model.id && (
                                            <>
                                                {/* Close backdrop */}
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpenId(null); }}
                                                />
                                                <div className="absolute top-full right-0 mt-2 w-44 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="p-1.5 space-y-0.5">
                                                        {/* Edit */}
                                                        <button
                                                            onClick={(e) => handleEditClick(e, model)}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-white hover:bg-gray-800 rounded-xl transition-all group/item"
                                                        >
                                                            <Pencil className="w-4 h-4 text-yellow-400 transition-transform group-hover/item:scale-110" />
                                                            <span className="text-sm font-semibold">Edit Details</span>
                                                        </button>

                                                        {/* Divider */}
                                                        <div className="h-px bg-gray-800 mx-2" />

                                                        {/* Delete */}
                                                        <button
                                                            onClick={(e) => handleDelete(e, model.id, model.title)}
                                                            disabled={deletingId === model.id}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50 group/item"
                                                        >
                                                            <Trash2 className="w-4 h-4 transition-transform group-hover/item:scale-110" />
                                                            <span className="text-sm font-semibold">
                                                                {deletingId === model.id ? 'Deleting…' : 'Delete Asset'}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Price badge */}
                                <span className="inline-flex items-center px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10">
                                    {model.price === 0 ? 'Free' : `$${model.price}`}
                                </span>
                            </div>
                        </div>

                        {/* ── Info Section ── */}
                        <Link href={`/catalog/${model.id}`} className="p-4 flex flex-col gap-1 flex-1 hover:bg-white/[0.02] transition-colors">
                            <h4 className="font-bold text-white text-sm leading-snug truncate group-hover:text-yellow-400 transition-colors">
                                {model.title}
                            </h4>
                            <div className="flex items-center justify-between text-[11px] text-gray-500 mt-0.5">
                                <span className="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 inline-block" />
                                    {model.category}
                                </span>
                                <span>
                                    {new Date(model.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingModel && (
                <EditModelModal
                    model={editingModel}
                    onClose={() => setEditingModel(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Asset?"
                message={
                    <>
                        Are you sure you want to delete{' '}
                        <strong className="text-white">&ldquo;{deleteTarget?.title}&rdquo;</strong>?{' '}
                        This action is <strong className="text-red-400">permanent</strong> and cannot be undone.
                    </>
                }
                confirmLabel={deletingId ? 'Deleting...' : 'Delete Asset'}
                cancelLabel="Keep Asset"
                variant="danger"
                isLoading={!!deletingId}
            />
        </>
    );
}
