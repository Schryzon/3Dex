'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
    ArrowLeft, Heart, User, Box, MoreHorizontal,
    Pencil, Trash2, Share2, Loader2, Check, X,
    Globe, Lock, Package
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { collectionKeys, collectionService } from '@/lib/api/services/collection.service';
import { getStorageUrl } from '@/lib/utils/storage';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/features/auth';

interface CollectionDetails {
    id: string;
    name: string;
    description?: string;
    is_public: boolean;
    user_id: string;
    created_at: string;
    user: {
        username: string;
        display_name?: string;
        avatar_url?: string;
    };
    items: {
        model: {
            id: string;
            title: string;
            price: number;
            preview_url?: string;
            artist: {
                username: string;
                display_name?: string;
            };
        }
    }[];
}

export default function CollectionDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState<'idle' | 'rename' | 'confirm-delete'>('idle');
    const [renameValue, setRenameValue] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    const { data: collection, isLoading, error } = useQuery({
        queryKey: ['collection', id],
        queryFn: async () => {
            const res = await api.get<CollectionDetails>(`/collections/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    const isOwner = user?.id === collection?.user_id;

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
                setEditMode('idle');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const renameMutation = useMutation({
        mutationFn: (name: string) => collectionService.renameCollection(id as string, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collection', id] });
            queryClient.invalidateQueries({ queryKey: collectionKeys.all });
            toast.success('Collection renamed');
            setMenuOpen(false);
            setEditMode('idle');
        },
        onError: () => toast.error('Failed to rename collection')
    });

    const deleteMutation = useMutation({
        mutationFn: () => collectionService.deleteCollection(id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: collectionKeys.all });
            toast.success('Collection deleted');
            router.push('/saved');
        },
        onError: () => toast.error('Failed to delete collection')
    });

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: collection?.name, url });
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied!');
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-t-2 border-yellow-400 rounded-full" />
            </div>
        );
    }

    if (error || !collection) {
        return (
            <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-white mb-2">Collection Not Found</h2>
                <p className="text-gray-400 mb-6">This collection may be private or deleted.</p>
                <Link href="/saved" className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Library
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#0a0a0a] pb-12">

            {/* ── Compact Header ── */}
            <div className="border-b border-gray-800/60 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 flex items-center gap-3">
                    {/* Back */}
                    <Link
                        href="/saved"
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors shrink-0 text-sm font-medium group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="hidden sm:inline">Library</span>
                    </Link>

                    <span className="text-gray-700">/</span>

                    {/* Collection name in breadcrumb */}
                    <span className="text-white font-semibold text-sm truncate flex-1">{collection.name}</span>

                    {/* Actions: share + owner menu */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Visibility badge — subtle pill */}
                        <span className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            collection.is_public
                                ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
                                : 'text-gray-400 border-gray-700 bg-gray-800/40'
                        }`}>
                            {collection.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {collection.is_public ? 'Public' : 'Private'}
                        </span>

                        {/* Share — icon only */}
                        <button
                            onClick={handleShare}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>

                        {/* Owner-only manage menu */}
                        {isOwner && (
                            <div ref={menuRef} className="relative">
                                <button
                                    onClick={() => { setMenuOpen(!menuOpen); setEditMode('idle'); }}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                    title="Manage collection"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        {editMode === 'idle' && (
                                            <>
                                                <button
                                                    onClick={() => { setEditMode('rename'); setRenameValue(collection.name); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                                                >
                                                    <Pencil className="w-4 h-4 text-yellow-400" />
                                                    Rename collection
                                                </button>
                                                <div className="h-px bg-gray-800" />
                                                <button
                                                    onClick={() => setEditMode('confirm-delete')}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete collection
                                                </button>
                                            </>
                                        )}

                                        {editMode === 'rename' && (
                                            <div className="p-3 space-y-2.5">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rename Collection</p>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={renameValue}
                                                    onChange={(e) => setRenameValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && renameValue.trim()) renameMutation.mutate(renameValue.trim());
                                                        if (e.key === 'Escape') { setEditMode('idle'); setMenuOpen(false); }
                                                    }}
                                                    className="w-full bg-black/60 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg focus:border-yellow-400 focus:outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditMode('idle')} className="flex-1 text-xs py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => renameValue.trim() && renameMutation.mutate(renameValue.trim())}
                                                        disabled={renameMutation.isPending || !renameValue.trim()}
                                                        className="flex-1 text-xs py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                                    >
                                                        {renameMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {editMode === 'confirm-delete' && (
                                            <div className="p-3 space-y-2.5">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Delete collection?</p>
                                                <p className="text-xs text-gray-500">All items will be removed. This cannot be undone.</p>
                                                <div className="flex gap-2 pt-0.5">
                                                    <button onClick={() => setEditMode('idle')} className="flex-1 text-xs py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMutation.mutate()}
                                                        disabled={deleteMutation.isPending}
                                                        className="flex-1 text-xs py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                                    >
                                                        {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Collection Meta ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <Link href={`/u/${collection.user.username}`} className="flex items-center gap-2 group">
                        <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden border border-gray-700 group-hover:border-yellow-400 transition-colors shrink-0">
                            {collection.user.avatar_url ? (
                                <img src={getStorageUrl(collection.user.avatar_url)} alt={collection.user.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-3 h-3 text-gray-500" />
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                            by <span className="text-gray-300">{collection.user.display_name || collection.user.username}</span>
                        </span>
                    </Link>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {collection.items.length} items
                    </span>
                    {/* Mobile visibility badge */}
                    <span className={`sm:hidden flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        collection.is_public
                            ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
                            : 'text-gray-400 border-gray-700 bg-gray-800/40'
                    }`}>
                        {collection.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                        {collection.is_public ? 'Public' : 'Private'}
                    </span>
                </div>

                {collection.description && (
                    <p className="text-sm text-gray-400 mt-3 max-w-2xl leading-relaxed">{collection.description}</p>
                )}
            </div>

            {/* ── Pinterest-style Masonry Grid ── */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 py-4">
                {collection.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/10">
                        <Box className="w-12 h-12 text-gray-700 mb-4" />
                        <h3 className="text-lg font-bold text-gray-400">Empty Collection</h3>
                        <p className="text-sm text-gray-600 mt-1">No models in this collection yet.</p>
                        <Link href="/catalog" className="mt-6 px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl text-sm transition-colors">
                            Browse Catalog
                        </Link>
                    </div>
                ) : (
                    /* Pinterest-style masonry: CSS columns */
                    <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4">
                        {collection.items.map(({ model }, index) => (
                            <Link
                                href={`/catalog/${model.id}`}
                                key={model.id}
                                className="group block mb-3 sm:mb-4 break-inside-avoid rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                            >
                                {/* Image — variable height for masonry feel */}
                                <div className={`relative overflow-hidden bg-gray-800 ${
                                    index % 5 === 0 ? 'aspect-[3/4]' :
                                    index % 5 === 1 ? 'aspect-[4/3]' :
                                    index % 5 === 2 ? 'aspect-square' :
                                    index % 5 === 3 ? 'aspect-[3/4]' :
                                    'aspect-[4/3]'
                                }`}>
                                    {model.preview_url ? (
                                        <img
                                            src={getStorageUrl(model.preview_url)}
                                            alt={model.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                                            <Box className="w-8 h-8 mb-1" />
                                            <span className="text-xs">No Preview</span>
                                        </div>
                                    )}

                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Price badge — bottom left */}
                                    <div className="absolute bottom-2 left-2 bg-yellow-400 text-black px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold">
                                        {model.price === 0 ? 'FREE' : `IDR ${model.price.toLocaleString('id-ID')}`}
                                    </div>

                                    {/* Heart — top right on hover */}
                                    <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Heart className="w-3.5 h-3.5 hover:text-pink-400 hover:fill-pink-400 transition-colors" />
                                    </div>
                                </div>

                                {/* Info — compact */}
                                <div className="px-3 py-2.5">
                                    <h3 className="text-white text-xs sm:text-sm font-semibold truncate group-hover:text-yellow-400 transition-colors leading-tight">
                                        {model.title}
                                    </h3>
                                    <span className="text-[10px] sm:text-xs text-gray-500 block mt-0.5 truncate">
                                        {model.artist.display_name || model.artist.username}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
