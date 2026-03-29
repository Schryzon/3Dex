'use client';

import { useWishlist } from '@/features/catalog/hooks/useWishlist';
import { useCollections } from '@/features/collection/hooks/useCollections';
import { useAuth } from '@/features/auth';
import {
    Heart, Search, Package, Loader2, X, FolderOpen,
    Plus, MoreVertical, Pencil, Trash2, Check, Globe, Lock
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { getStorageUrl } from '@/lib/utils/storage';

type LibraryTab = 'wishlist' | 'collections';

interface DropdownMenuProps {
    collectionId: string;
    collectionName: string;
    isPublic: boolean;
    onRename: (id: string, name: string) => Promise<any>;
    onDelete: (id: string) => Promise<any>;
    onTogglePublic: (id: string, isPublic: boolean) => Promise<any>;
}

function CollectionDropdown({ collectionId, collectionName, isPublic, onRename, onDelete, onTogglePublic }: DropdownMenuProps) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'idle' | 'rename' | 'confirm-delete'>('idle');
    const [renameValue, setRenameValue] = useState(collectionName);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setMode('idle');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleRename = async () => {
        if (!renameValue.trim() || renameValue === collectionName) {
            setMode('idle');
            setOpen(false);
            return;
        }
        setIsLoading(true);
        try {
            await onRename(collectionId, renameValue.trim());
        } finally {
            setIsLoading(false);
            setOpen(false);
            setMode('idle');
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await onDelete(collectionId);
        } finally {
            setIsLoading(false);
            setOpen(false);
            setMode('idle');
        }
    };

    const handleTogglePublic = async () => {
        setIsLoading(true);
        try {
            await onTogglePublic(collectionId, !isPublic);
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    };

    const MenuContent = () => (
        <div className="overflow-hidden">
            {mode === 'idle' && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); setMode('rename'); setRenameValue(collectionName); }}
                        className="w-full flex items-center gap-4 px-5 py-4 sm:py-3 text-base sm:text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left font-medium"
                    >
                        <Pencil className="w-5 h-5 sm:w-4 sm:h-4 text-blue-400" />
                        Rename
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePublic(); }}
                        disabled={isLoading}
                        className="w-full flex items-center gap-4 px-5 py-4 sm:py-3 text-base sm:text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left font-medium disabled:opacity-50"
                    >
                        {isPublic ? <Lock className="w-5 h-5 sm:w-4 sm:h-4 text-orange-400" /> : <Globe className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-400" />}
                        Make {isPublic ? 'Private' : 'Public'}
                    </button>
                    <div className="h-px bg-gray-800/50 mx-2" />
                    <button
                        onClick={(e) => { e.stopPropagation(); setMode('confirm-delete'); }}
                        className="w-full flex items-center gap-4 px-5 py-4 sm:py-3 text-base sm:text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left font-bold"
                    >
                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                        Delete Collection
                    </button>
                </>
            )}

            {mode === 'rename' && (
                <div className="p-5 sm:p-4 space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Rename Collection</p>
                    <input
                        autoFocus
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') { setMode('idle'); setOpen(false); }
                        }}
                        className="w-full bg-black/50 border border-gray-700 text-white text-base sm:text-sm px-4 py-3 rounded-2xl focus:border-yellow-400 focus:outline-none transition-all"
                    />
                    <div className="flex gap-3">
                        <button onClick={(e) => { e.stopPropagation(); setMode('idle'); }} className="flex-1 text-sm py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors font-bold">Cancel</button>
                        <button onClick={(e) => { e.stopPropagation(); handleRename(); }} disabled={isLoading || !renameValue.trim()}
                            className="flex-1 text-sm py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                        </button>
                    </div>
                </div>
            )}

            {mode === 'confirm-delete' && (
                <div className="p-5 sm:p-4 space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1 text-red-400">Delete Collection?</p>
                    <p className="text-sm text-gray-400 px-1 leading-relaxed">This action is permanent and cannot be undone.</p>
                    <div className="flex gap-3 pt-1">
                        <button onClick={(e) => { e.stopPropagation(); setMode('idle'); }} className="flex-1 text-sm py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors font-bold">Cancel</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={isLoading}
                            className="flex-1 text-sm py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div ref={ref} className="relative z-30">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(!open);
                    setMode('idle');
                }}
                className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all active:scale-90"
            >
                <MoreVertical className="w-6 h-6 sm:w-5 sm:h-5" />
            </button>

            {/* Desktop Dropdown */}
            {open && (
                <div className="hidden sm:block absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                    <MenuContent />
                </div>
            )}

            {/* Mobile Actions Modal */}
            {open && (
                <div className="sm:hidden fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="relative w-full max-w-xs bg-[#111111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <span className="text-sm font-bold text-white px-1">Manage Collection</span>
                            <button onClick={() => setOpen(false)} className="p-2 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <MenuContent />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SavedPage() {
    const { user } = useAuth();
    const { wishlistItems, isLoading: isLoadingWishlist, removeFromWishlist } = useWishlist();
    const {
        collections,
        isLoading: isLoadingCollections,
        createCollection,
        renameCollection,
        deleteCollection,
        updateCollection
    } = useCollections();

    const [activeTab, setActiveTab] = useState<LibraryTab>('wishlist');
    const [searchQuery, setSearchQuery] = useState('');
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isCreatingOpen, setIsCreatingOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    const handleRemove = async (modelId: string) => {
        setRemovingId(modelId);
        try {
            await removeFromWishlist(modelId);
        } finally {
            setRemovingId(null);
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;
        try {
            await createCollection(newCollectionName.trim());
            setNewCollectionName('');
            setIsCreatingOpen(false);
        } catch (error) {
            // Error managed by hook toast
        }
    };

    // Filter by search query
    const filteredWishlist = wishlistItems.filter((item: any) => {
        const model = item.model || {};
        const title = (model.title || '').toLowerCase();
        return title.includes(searchQuery.toLowerCase());
    });

    const filteredCollections = collections.filter((c: any) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isLoading = activeTab === 'wishlist' ? isLoadingWishlist : isLoadingCollections;

    if (isLoading && (activeTab === 'wishlist' ? wishlistItems.length === 0 : collections.length === 0)) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                            My <span className="text-yellow-400">Library</span>
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl">
                            Organize your favorite 3D assets and custom collections into curated galleries.
                        </p>
                    </div>

                    {activeTab === 'collections' && (
                        <button
                            onClick={() => setIsCreatingOpen(true)}
                            className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-2xl transition-all shadow-xl shadow-yellow-400/10 text-sm active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Collection</span>
                        </button>
                    )}
                </div>

                {/* Main Nav & Search Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Tabs */}
                    <div className="flex p-1.5 bg-[#111111] rounded-2xl border border-gray-800/60 w-full md:w-fit">
                        <button
                            onClick={() => setActiveTab('wishlist')}
                            className={`flex-1 md:flex-none cursor-pointer px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'wishlist' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <Heart className={`w-4 h-4 ${activeTab === 'wishlist' ? 'fill-current' : ''}`} />
                            Wishlist <span className="opacity-50 text-xs translate-y-[0.5px]">({wishlistItems.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('collections')}
                            className={`flex-1 md:flex-none cursor-pointer px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'collections' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <FolderOpen className="w-4 h-4" />
                            Collections <span className="opacity-50 text-xs translate-y-[0.5px]">({collections.length})</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search your ${activeTab === 'wishlist' ? 'saved assets' : 'collections'}...`}
                            className="w-full bg-[#111111] text-white text-sm px-5 py-3.5 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400/20 border border-gray-800/60 group-hover:border-gray-700 placeholder-gray-600 transition-all font-medium"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-yellow-400/50 transition-colors pointer-events-none" />
                    </div>
                </div>

                {/* Content View */}
                {activeTab === 'wishlist' ? (
                    /* WISHLIST VIEW */
                    wishlistItems.length === 0 ? (
                        <div className="bg-[#111111]/40 rounded-3xl p-12 sm:p-20 border border-gray-800/40 border-dashed text-center">
                            <div className="w-20 h-20 bg-gray-800/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-10 h-10 text-gray-700" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h2>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                                Save assets you love to keep track of them and get notified about updates or price drops.
                            </p>
                            <Link href="/catalog" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm active:scale-95 shadow-xl">
                                Explore Feed
                            </Link>
                        </div>
                    ) : filteredWishlist.length === 0 ? (
                        <div className="text-center py-20 bg-[#111111]/20 rounded-3xl border border-gray-800/40">
                            <p className="text-gray-500">No assets match "<span className="text-white font-bold">{searchQuery}</span>"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                            {filteredWishlist.map((item: any) => {
                                const model = item.model || {};
                                const modelId = item.model_id || item.modelId;
                                const thumb = model.preview_url || (model.thumbnails?.[0] || '/placeholder.jpg');
                                const price = model.price || 0;
                                return (
                                    <div key={item.id || modelId} className="group relative bg-[#111111] rounded-2xl border border-gray-800/60 hover:border-yellow-400/40 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-400/5">
                                        <button
                                            onClick={() => handleRemove(modelId)}
                                            disabled={removingId === modelId}
                                            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-black/80 backdrop-blur-md hover:bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 shadow-lg"
                                        >
                                            {removingId === modelId ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                        </button>
                                        <Link href={`/catalog/${modelId}`}>
                                            <div className="aspect-[4/3] overflow-hidden bg-gray-900 relative">
                                                <img src={thumb} alt={model.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                            </div>
                                        </Link>
                                        <div className="p-3 sm:p-4">
                                            <Link href={`/catalog/${modelId}`}>
                                                <h3 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-yellow-400 transition-colors mb-0.5 sm:mb-1">
                                                    {model.title || 'Untitled Asset'}
                                                </h3>
                                            </Link>
                                            <p className="text-[10px] sm:text-xs text-gray-500 mb-3 truncate font-medium">by @{model.artist?.username || 'anonymous'}</p>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-black text-yellow-400 text-xs sm:text-sm">
                                                    {price === 0 ? 'FREE' : formatPrice(price).idr}
                                                </span>
                                                <Link href={`/catalog/${modelId}`} className="text-[10px] sm:text-xs px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-lg transition-all active:scale-90">
                                                    View
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    /* COLLECTIONS VIEW */
                    collections.length === 0 ? (
                        <div className="bg-[#111111]/40 rounded-[2.5rem] p-12 sm:p-24 border border-gray-800/40 border-dashed text-center">
                            <div className="w-20 h-20 bg-gray-800/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <FolderOpen className="w-10 h-10 text-gray-700" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">No collections yet</h2>
                            <p className="text-gray-500 mb-9 max-w-sm mx-auto text-sm leading-relaxed">
                                Create folders to organize your assets by project, style, or category.
                            </p>
                            <button
                                onClick={() => setIsCreatingOpen(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-2xl transition-all text-sm active:scale-95 shadow-xl shadow-yellow-400/10 cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                Create First Collection
                            </button>
                        </div>
                    ) : filteredCollections.length === 0 ? (
                        <div className="text-center py-24 bg-[#111111]/20 rounded-[2.5rem] border border-gray-800/40">
                            <p className="text-gray-500">No collections match "<span className="text-white font-bold">{searchQuery}</span>"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                            {filteredCollections.map((collection: any) => {
                                const items = collection.items || [];
                                const hasItems = items.length > 0;

                                return (
                                    <div key={collection.id} className="group relative">
                                        {/* Actions Area - NO OVERFLOW-HIDDEN HERE */}
                                        <div className="absolute top-3 right-3 z-30">
                                            <CollectionDropdown
                                                collectionId={collection.id}
                                                collectionName={collection.name}
                                                isPublic={collection.is_public}
                                                onRename={(id, name) => renameCollection({ id, name })}
                                                onDelete={(id) => deleteCollection(id)}
                                                onTogglePublic={(id, isPublic) => updateCollection({ id, data: { isPublic } })}
                                            />
                                        </div>

                                        <Link href={`/collections/${collection.id}`} className="block">
                                            {/* Visual Container */}
                                            <div className="aspect-[4/3] w-full rounded-[2rem] bg-gray-800/20 relative overflow-hidden ring-1 ring-white/5 group-hover:ring-yellow-400/30 transition-all duration-500">
                                                <div className="w-full h-full flex gap-1 p-1">
                                                    {hasItems ? (
                                                        <>
                                                            {/* Main Image */}
                                                            <div className="flex-[2] h-full rounded-2xl overflow-hidden bg-gray-800/20">
                                                                <img
                                                                    src={getStorageUrl(items[0]?.model?.preview_url)}
                                                                    alt=""
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                />
                                                            </div>
                                                            {/* Side Previews */}
                                                            <div className="flex-1 flex flex-col gap-1">
                                                                <div className="flex-1 rounded-xl overflow-hidden bg-gray-800/20">
                                                                    {items[1] && (
                                                                        <img
                                                                            src={getStorageUrl(items[1]?.model?.preview_url)}
                                                                            alt=""
                                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 rounded-xl overflow-hidden bg-gray-800/20 flex items-center justify-center">
                                                                    {items[2] ? (
                                                                        <img
                                                                            src={getStorageUrl(items[2]?.model?.preview_url)}
                                                                            alt=""
                                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                                                                            <FolderOpen className="w-5 h-5 text-white/10" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        /* Empty State Visual */
                                                        <div className="w-full h-full flex flex-col items-center justify-center relative">
                                                            <FolderOpen className="absolute -right-6 -bottom-6 w-32 h-32 text-white/[0.03] -rotate-12" />
                                                            <div className="w-14 h-14 bg-gray-800/40 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all duration-500 shadow-inner group-hover:rotate-6">
                                                                <FolderOpen className="w-6 h-6" />
                                                            </div>
                                                            <div className="mt-4 flex -space-x-2">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-800 border-2 border-[#0a0a0a]" />
                                                                <div className="w-8 h-8 rounded-lg bg-gray-700 border-2 border-[#0a0a0a]" />
                                                                <div className="w-8 h-8 rounded-lg bg-gray-600 border-2 border-[#0a0a0a]" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Details Info */}
                                            <div className="mt-4 px-2">
                                                <div className="flex items-center justify-between gap-3 mb-1.5">
                                                    <h3 className="font-bold text-white text-sm md:text-base truncate group-hover:text-yellow-400 transition-colors">
                                                        {collection.name}
                                                    </h3>
                                                    <span className={`shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                                                        collection.is_public
                                                            ? 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                            : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                    }`}>
                                                        {collection.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                                                        {collection.is_public ? 'Public' : 'Private'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest opacity-60">
                                                    <Package className="w-3.5 h-3.5" />
                                                    {collection._count?.items ?? 0}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>

            {/* Create Collection Modal */}
            {isCreatingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCreatingOpen(false)} />
                    <div className="relative w-full max-w-md bg-[#111111] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-white tracking-tight">New <span className="text-yellow-400">Folder</span></h2>
                            <button onClick={() => setIsCreatingOpen(false)} className="text-gray-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-500 mb-3 px-1">Collection Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="e.g., Streetwear Concept"
                                    className="w-full bg-black/40 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none transition-all text-base font-medium"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button onClick={() => setIsCreatingOpen(false)} className="flex-1 px-6 py-4 bg-gray-900 text-gray-400 font-bold rounded-2xl hover:bg-gray-800 hover:text-white transition-all text-sm">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateCollection}
                                    disabled={!newCollectionName.trim()}
                                    className="flex-1 px-6 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:bg-yellow-300 transition-all disabled:opacity-50 text-sm shadow-xl shadow-yellow-400/10 active:scale-95"
                                >
                                    Create Folder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
