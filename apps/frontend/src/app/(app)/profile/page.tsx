'use client';

import { useAuth } from '@/features/auth';
import {
    FolderOpen,
    Bookmark,
    Sparkles,
    CheckCircle,
    XCircle,
    Upload,
    BarChart3,
    Settings,
    Camera,
    X,
    ChevronRight,
    Bell,
    CreditCard,
    CheckCircle2,
    Printer,
    Box,
    Settings2,
    Globe,
    Trash2,
    Twitter,
    Instagram,
    ExternalLink,
    ArrowUpRight,
    Loader2,
    AlertTriangle,
    Heart,
    Package,
    Pencil,
    Check,
    MoreVertical,
    Plus,
    Lock
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UserAvatar from '@/components/common/UserAvatar';
import ProfileSidebar from '@/features/profile/components/ProfileSidebar';
import ServiceTab from '@/features/profile/components/ServiceTab';
import JobsTab from '@/features/profile/components/JobsTab';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants/api';
import { getStorageUrl } from '@/lib/utils/storage';
import ConfirmModal from '@/components/common/ConfirmModal';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ImageCropModal from '@/components/common/ImageCropModal';
import ModelGrid from '@/features/model/components/ModelGrid';
import { useCollections } from '@/features/collection/hooks/useCollections';
import { useWishlist } from '@/features/catalog/hooks/useWishlist';
import { formatPrice } from '@/lib/utils';


function UploadsTab({ userId }: { userId?: string }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">My Assets</h3>
                <Link href="/upload" className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-all">
                    <Upload className="w-4 h-4" />
                    Upload New
                </Link>
            </div>
            <ModelGrid artistId={userId} showUpload={true} />
        </div>
    );
}

function ProfileCollectionDropdown({ collectionId, collectionName, isPublic, onRename, onDelete, onTogglePublic }: {
    collectionId: string;
    collectionName: string;
    isPublic: boolean;
    onRename: (id: string, name: string) => Promise<any>;
    onDelete: (id: string) => Promise<any>;
    onTogglePublic: (id: string, isPublic: boolean) => Promise<any>;
}) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'idle' | 'rename' | 'confirm-delete'>('idle');
    const [renameValue, setRenameValue] = useState(collectionName);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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
        if (!renameValue.trim() || renameValue === collectionName) { setMode('idle'); setOpen(false); return; }
        setIsLoading(true);
        try { await onRename(collectionId, renameValue.trim()); }
        finally { setIsLoading(false); setOpen(false); setMode('idle'); }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try { await onDelete(collectionId); }
        finally { setIsLoading(false); setOpen(false); setMode('idle'); }
    };

    const handleTogglePublic = async () => {
        setIsLoading(true);
        try { await onTogglePublic(collectionId, !isPublic); }
        finally { setIsLoading(false); setOpen(false); }
    };

    const MenuContent = () => (
        <div className="overflow-hidden">
            {mode === 'idle' && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); setMode('rename'); setRenameValue(collectionName); }}
                        className="w-full flex items-center gap-4 px-5 py-4 sm:py-3 text-base sm:text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left font-medium">
                        <Pencil className="w-5 h-5 sm:w-4 sm:h-4 text-blue-400" /> Rename
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleTogglePublic(); }} disabled={isLoading}
                        className="w-full flex items-center gap-4 px-5 py-4 sm:py-3 text-base sm:text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left font-medium disabled:opacity-50">
                        {isPublic ? <Lock className="w-5 h-5 sm:w-4 sm:h-4 text-orange-400" /> : <Globe className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-400" />}
                        Make {isPublic ? 'Private' : 'Public'}
                    </button>
                    <div className="h-px bg-gray-800/50 mx-2" />
                    <button onClick={(e) => { e.stopPropagation(); setMode('confirm-delete'); }}
                        className="w-full flex items-center gap-4 px-5 py-4 sm:py-3 text-base sm:text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left font-bold">
                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" /> Delete Collection
                    </button>
                </>
            )}
            {mode === 'rename' && (
                <div className="p-5 sm:p-4 space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Rename Collection</p>
                    <input autoFocus type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setMode('idle'); setOpen(false); } }}
                        className="w-full bg-black/50 border border-gray-700 text-white text-base sm:text-sm px-4 py-3 rounded-2xl focus:border-yellow-400 focus:outline-none transition-all" />
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
        <div ref={ref} className="relative z-30" onClick={(e) => e.preventDefault()}>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); setMode('idle'); }}
                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all active:scale-90">
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
                            <span className="text-sm font-black text-white px-1">Manage Collection</span>
                            <button onClick={() => setOpen(false)} className="p-2 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <MenuContent />
                    </div>
                </div>
            )}
        </div>
    );
}

function CollectionsTabContent() {
    const { collections, isLoading, createCollection, renameCollection, deleteCollection, updateCollection } = useCollections();
    const [isCreatingOpen, setIsCreatingOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    const handleCreate = async () => {
        if (!newCollectionName.trim()) return;
        try {
            await createCollection(newCollectionName.trim());
            setNewCollectionName('');
            setIsCreatingOpen(false);
        } catch { /* handled by hook */ }
    };

    if (isLoading) return (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-yellow-400 animate-spin" /></div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">My Collections</h3>
                    <p className="text-sm text-gray-500 font-medium">{collections.length} folder{collections.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setIsCreatingOpen(true)}
                    className="flex shrink-0 items-center justify-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-2xl transition-all shadow-xl shadow-yellow-400/10 text-xs sm:text-sm active:scale-95 cursor-pointer">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>New Collection</span>
                </button>
            </div>

            {collections.length === 0 ? (
                <div className="text-center py-20 bg-[#111111]/40 rounded-3xl border border-gray-800/40 border-dashed">
                    <div className="w-16 h-16 bg-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FolderOpen className="w-8 h-8 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No collections yet</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed text-xs">Organize your 3D assets into custom folders for better management.</p>
                    <button onClick={() => setIsCreatingOpen(true)} className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-2xl transition-all text-sm cursor-pointer shadow-xl shadow-yellow-400/10 active:scale-95">
                        <Plus className="w-4 h-4" /> Create Collection
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                    {collections.map((collection: any) => {
                        const items = collection.items || [];
                        const hasItems = items.length > 0;

                        return (
                            <div key={collection.id} className="group relative">
                                {/* Action Buttons Container - NO OVERFLOW-HIDDEN HERE */}
                                <div className="absolute top-2 right-2 z-30">
                                    <ProfileCollectionDropdown
                                        collectionId={collection.id}
                                        collectionName={collection.name}
                                        isPublic={collection.is_public}
                                        onRename={(id, name) => renameCollection({ id, name })}
                                        onDelete={(id) => deleteCollection(id)}
                                        onTogglePublic={(id, isPublic) => updateCollection({ id, data: { isPublic } })}
                                    />
                                </div>

                                <Link href={`/collections/${collection.id}`} className="block">
                                    {/* Visual Container - HAS OVERFLOW-HIDDEN */}
                                    <div className="aspect-[4/3] w-full bg-gray-800/40 relative overflow-hidden rounded-[1.8rem] ring-1 ring-white/5 group-hover:ring-yellow-400/30 transition-all duration-500">
                                        <div className="w-full h-full flex gap-1 p-1">
                                            {hasItems ? (
                                                <>
                                                    {/* Pinterest Main Image */}
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
                                                                <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center">
                                                                    <FolderOpen className="w-4 h-4 text-white/10" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Empty State Placeholder */
                                                <div className="w-full h-full flex flex-col items-center justify-center relative">
                                                    <FolderOpen className="absolute -right-4 -bottom-4 w-32 h-32 text-white/[0.02] -rotate-12" />
                                                    <div className="w-10 h-10 bg-gray-800/40 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all duration-500 shadow-inner group-hover:rotate-6">
                                                        <FolderOpen className="w-5 h-5" />
                                                    </div>
                                                    <div className="mt-3 flex -space-x-1.5">
                                                        <div className="w-6 h-6 rounded-md bg-gray-800 border-2 border-[#0a0a0a]" />
                                                        <div className="w-6 h-6 rounded-md bg-gray-700 border-2 border-[#0a0a0a]" />
                                                        <div className="w-6 h-6 rounded-md bg-gray-600 border-2 border-[#0a0a0a]" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Text Details */}
                                    <div className="p-3">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="font-bold text-white text-sm md:text-base group-hover:text-yellow-400 transition-colors truncate">{collection.name}</h4>
                                            <span className={`shrink-0 flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${collection.is_public
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                                }`}>
                                                {collection.is_public ? <Globe className="w-2 h-2" /> : <Lock className="w-2 h-2" />}
                                                {collection.is_public ? 'Pub' : 'Priv'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest opacity-60">
                                            <Package className="w-3 h-3" />
                                            {collection._count?.items ?? 0}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {isCreatingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCreatingOpen(false)} />
                    <div className="relative w-full max-w-md bg-[#111111] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-white tracking-tight">New <span className="text-yellow-400">Collection</span></h2>
                            <button onClick={() => setIsCreatingOpen(false)} className="text-gray-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="space-y-6">
                            <input autoFocus type="text" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)}
                                placeholder="e.g., Summer Series 2024"
                                className="w-full bg-black/40 border border-gray-800 rounded-2xl px-5 py-4 text-white text-base font-medium outline-none focus:border-yellow-400 transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
                            <div className="flex gap-4">
                                <button onClick={() => setIsCreatingOpen(false)} className="flex-1 px-6 py-4 bg-gray-900 text-gray-400 font-bold rounded-2xl hover:bg-gray-800 hover:text-white transition-all text-sm font-bold">Cancel</button>
                                <button onClick={handleCreate} disabled={!newCollectionName.trim()} className="flex-1 px-6 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:bg-yellow-300 transition-all disabled:opacity-50 text-sm shadow-xl shadow-yellow-400/10 active:scale-95">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BookmarksTabContent() {
    const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (modelId: string) => {
        setRemovingId(modelId);
        try { await removeFromWishlist(modelId); }
        finally { setRemovingId(null); }
    };

    if (isLoading) return (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-yellow-400 animate-spin" /></div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Saved Assets</h3>
                <p className="text-sm text-gray-400">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist</p>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-16 bg-gray-900/20 rounded-2xl border border-gray-800 border-dashed">
                    <Heart className="w-14 h-14 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-400 mb-6 max-w-xs mx-auto text-sm">Items you save in the catalog will appear here for easy access.</p>
                    <Link href="/catalog" className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all text-sm">
                        Discover Models
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {wishlistItems.map((item: any) => {
                        const model = item.model || {};
                        const modelId = item.model_id || item.modelId;
                        const thumb = model.preview_url || (model.thumbnails?.[0] || '/placeholder.jpg');
                        const price = model.price || 0;
                        return (
                            <div key={item.id || modelId} className="group relative bg-gray-900/50 rounded-xl border border-gray-800 hover:border-yellow-400/40 overflow-hidden transition-all duration-300">
                                <button onClick={() => handleRemove(modelId)} disabled={removingId === modelId}
                                    className="absolute top-2 right-2 z-10 w-6 h-6 sm:w-7 sm:h-7 bg-black/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50">
                                    {removingId === modelId ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                </button>
                                <Link href={`/catalog/${modelId}`}>
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-900">
                                        <img src={thumb} alt={model.title || 'Model'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                </Link>
                                <div className="p-2.5 sm:p-3">
                                    <Link href={`/catalog/${modelId}`}>
                                        <h4 className="font-semibold text-white text-xs sm:text-sm truncate hover:text-yellow-400 transition-colors mb-0.5">{model.title || 'Untitled'}</h4>
                                    </Link>
                                    <p className="text-[10px] sm:text-xs text-gray-500 mb-2 truncate">by {model.artist?.username || 'Unknown'}</p>
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="font-bold text-yellow-400 text-xs">{price === 0 ? 'Free' : formatPrice(price).idr}</span>
                                        <Link href={`/catalog/${modelId}`} className="text-[10px] sm:text-xs px-2 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-colors">View</Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}




type TabType = 'profile' | 'settings' | 'collections' | 'bookmarks' | 'notifications' | 'uploads' | 'analytics' | 'billing' | 'shipping' | 'service' | 'jobs' | 'workshop';

function ProfileContent() {
    const { user, setUser, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [upgrading, setUpgrading] = useState(false);
    const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [saveBanner, setSaveBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // Image Cropping
    const [cropModal, setCropModal] = useState<{
        isOpen: boolean;
        image: string;
        aspect: number;
        type: 'avatar' | 'banner';
    }>({ isOpen: false, image: '', aspect: 1, type: 'avatar' });

    // Delete account modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Provider apply modal
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [isApplyingProvider, setIsApplyingProvider] = useState(false);

    // Revert role modals
    const [showRevertModal, setShowRevertModal] = useState(false);
    const [showRevertConfirmModal, setShowRevertConfirmModal] = useState(false);
    const [revertConfirmInput, setRevertConfirmInput] = useState('');
    const [isReverting, setIsReverting] = useState(false);

    // Dummy System Preferences State
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [marketNotifs, setMarketNotifs] = useState(false);
    const [autoAccept, setAutoAccept] = useState(false);
    const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);

    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        displayName: user?.display_name || '',
        bio: user?.bio || '',
        location: user?.location || '',
        receiverName: '',
        phoneNumber: '',
        postcode: '',
        detailedAddress: '',
        courierPreference: 'JNE',
        ecoPackaging: true,
        website: user?.website || '',
        skills: [] as string[],
        showNsfw: user?.show_nsfw || false,
        socialLinks: {
            twitter: user?.social_twitter || '',
            instagram: user?.social_instagram || '',
            artstation: user?.social_artstation || '',
            behance: user?.social_behance || ''
        },
    });
    const [isSaving, setIsSaving] = useState(false);

    const showBannerNotif = (type: 'success' | 'error', msg: string) => {
        setSaveBanner({ type, msg });
        setTimeout(() => setSaveBanner(null), 4000);
    };

    const executeSave = async () => {
        setIsSaving(true);
        setSaveBanner(null);
        try {
            const payload = {
                username: formData.username,
                display_name: formData.displayName,
                bio: formData.bio,
                location: formData.location,
                website: formData.website,
                show_nsfw: formData.showNsfw,
                social_twitter: formData.socialLinks.twitter,
                social_instagram: formData.socialLinks.instagram,
                social_artstation: formData.socialLinks.artstation,
                social_behance: formData.socialLinks.behance,
            };
            let res;
            try {
                res = await api.patch(API_ENDPOINTS.USERS.UPDATE, payload);
            } catch (patchError: any) {
                const status = patchError?.response?.status;
                const shouldFallback = !status || status === 403 || status === 405 || status === 501;
                if (!shouldFallback) throw patchError;
                res = await api.post('/users/profile/update', payload);
            }
            setUser(res.data);
            showBannerNotif('success', 'Profile saved successfully!');
            setShowUsernameConfirm(false);
        } catch (error: any) {
            console.error('Failed to save settings:', error);
            showBannerNotif('error', error.response?.data?.message || 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        if (formData.username !== user?.username) {
            setShowUsernameConfirm(true);
        } else {
            await executeSave();
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setCropModal({
                isOpen: true,
                image: reader.result as string,
                aspect: type === 'avatar' ? 1 : 16 / 5,
                type
            });
        };
        reader.readAsDataURL(file);

        // Reset input value to allow selecting same file again
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const type = cropModal.type;
        setCropModal(prev => ({ ...prev, isOpen: false }));

        // Set the correct uploading state based on type
        if (type === 'avatar') setIsUploadingAvatar(true);
        else setIsUploadingBanner(true);

        try {
            const fileName = `${type}_${user?.id}_${Date.now()}.jpg`;
            const { data: { url, key } } = await api.post('/storage/upload-url', {
                filename: fileName,
                content_type: 'image/jpeg',
            });

            await fetch(url, {
                method: 'PUT',
                body: croppedBlob,
                headers: { 'Content-Type': 'image/jpeg' },
            });

            const payload = type === 'avatar' ? { avatar_url: key } : { banner_url: key };
            let res;
            try {
                res = await api.patch(API_ENDPOINTS.USERS.UPDATE, payload);
            } catch (patchError: any) {
                const status = patchError?.response?.status;
                const shouldFallback = !status || status === 403 || status === 405 || status === 501;
                if (!shouldFallback) throw patchError;
                res = await api.post('/users/profile/update', payload);
            }
            setUser(res.data);
            showBannerNotif('success', `${type.charAt(0).toUpperCase() + type.slice(1)} updated!`);
        } catch (error: any) {
            showBannerNotif('error', `Failed to upload ${type}.`);
        } finally {
            if (type === 'avatar') setIsUploadingAvatar(false);
            else setIsUploadingBanner(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmInput !== user?.username) return;
        setIsDeleting(true);
        try {
            await api.delete(API_ENDPOINTS.USERS.DELETE_ME);
            await logout();
            router.push('/');
        } catch (error: any) {
            const rawMsg = error.response?.data?.message || '';
            let errorMsg = 'Failed to delete account. Please try again later.';

            if (rawMsg.includes('foreign key constraint') || rawMsg.includes('Order_user_id_fkey')) {
                errorMsg = 'Delete unsuccessful: Account has active or past orders.';
            } else if (rawMsg.toLowerCase().includes('violates') || rawMsg.toLowerCase().includes('prisma')) {
                errorMsg = 'Delete unsuccessful: Account is linked to system records.';
            } else if (rawMsg) {
                errorMsg = rawMsg;
            }

            showBannerNotif('error', errorMsg);
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        const tabParam = searchParams.get('tab') as TabType | null;
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const handleUpgradeToArtist = async () => {
        setUpgrading(true);
        setUpgradeStatus('idle');
        try {
            await api.post('/users/apply-role', { role: 'ARTIST' });
            setUpgradeStatus('success');
            showBannerNotif('success', 'Artist application submitted!');
        } catch (error) {
            setUpgradeStatus('error');
            showBannerNotif('error', 'Application failed. Please try again.');
        } finally {
            setUpgrading(false);
        }
    };

    const handleUpgradeToProvider = () => {
        setShowProviderModal(true);
    };

    const handleConfirmProvider = async () => {
        setIsApplyingProvider(true);
        setUpgrading(true);
        try {
            await api.post('/users/apply-role', { role: 'PROVIDER' });
            showBannerNotif('success', 'Provider application submitted!');
            setShowProviderModal(false);
        } catch (error) {
            showBannerNotif('error', 'Application failed. Please try again.');
        } finally {
            setIsApplyingProvider(false);
            setUpgrading(false);
        }
    };

    const handleConfirmRevert = async () => {
        if (revertConfirmInput !== 'REVERT') return;
        setIsReverting(true);
        try {
            const res = await api.post('/users/revert-role');
            setUser(res.data.user);
            showBannerNotif('success', 'You have reverted to a regular user.');
            setShowRevertConfirmModal(false);
            setRevertConfirmInput('');
            setActiveTab('profile'); // Switch to profile tab to see changes
        } catch (error: any) {
            showBannerNotif('error', error.response?.data?.message || 'Failed to revert role.');
        } finally {
            setIsReverting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'avatar')}
            />
            <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'banner')}
            />


            {cropModal.isOpen && (
                <ImageCropModal
                    image={cropModal.image}
                    aspect={cropModal.aspect}
                    title={`Crop ${cropModal.type === 'avatar' ? 'Avatar' : 'Banner'}`}
                    onClose={() => setCropModal(prev => ({ ...prev, isOpen: false }))}
                    onCropComplete={handleCropComplete}
                />
            )}

            {/* Provider Apply Confirmation Modal */}
            <ConfirmModal
                isOpen={showProviderModal}
                onClose={() => setShowProviderModal(false)}
                onConfirm={handleConfirmProvider}
                title="Become a Provider?"
                message={
                    <>
                        You are about to apply to become a <strong className="text-white">Printing Provider</strong>. Your application will be reviewed by our team.
                        <br /><br />
                        Once approved, you&apos;ll be able to accept 3D printing jobs from customers on the platform.
                    </>
                }
                confirmLabel="Apply Now"
                cancelLabel="Not Yet"
                variant="default"
                isLoading={isApplyingProvider}
            />

            {/* Username Change Confirmation Modal */}
            <ConfirmModal
                isOpen={showUsernameConfirm}
                onClose={() => setShowUsernameConfirm(false)}
                onConfirm={executeSave}
                title="Change Username?"
                message={
                    <div className="space-y-4">
                        <p>
                            You are changing your username to <strong className="text-white">@{formData.username}</strong>.
                        </p>
                        <p className="text-xs text-orange-400 font-medium bg-orange-400/10 p-3 rounded-lg border border-orange-400/20">
                            <AlertTriangle className="w-4 h-4 inline mr-2 text-orange-400" />
                            Warning: This will change your profile URL. Existing links to your old profile will no longer work.
                        </p>
                    </div>
                }
                confirmLabel="Confirm Change"
                variant="default"
                isLoading={isSaving}
            />

            {/* Revert Role First Confirmation */}
            <ConfirmModal
                isOpen={showRevertModal}
                onClose={() => setShowRevertModal(false)}
                onConfirm={() => {
                    setShowRevertModal(false);
                    setShowRevertConfirmModal(true);
                }}
                title="Revert to Regular User?"
                message={
                    <div className="space-y-4">
                        <p>
                            You are about to revert your account to a <strong className="text-white">Regular Customer</strong>.
                        </p>
                        <ul className="list-disc list-inside text-xs space-y-1 text-gray-400">
                            <li>Your Artist/Provider profile will be hidden.</li>
                            <li>All your active models/services will be unlisted from the catalog.</li>
                            <li>You will need to re-apply and get approval to become an Artist/Provider again.</li>
                        </ul>
                    </div>
                }
                confirmLabel="Next Step"
                variant="default"
            />

            {/* Revert Role Final Confirmation (Double Check) */}
            {showRevertConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isReverting && setShowRevertConfirmModal(false)} />
                    <div className="relative bg-[#141414] rounded-2xl shadow-2xl w-full max-w-md border border-orange-500/30 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="h-1 w-full bg-orange-500" />
                        <div className="p-8">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-orange-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Final Confirmation</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                Please type <strong className="text-white">REVERT</strong> below to confirm. This action will immediately unlist your assets.
                            </p>
                            <input
                                type="text"
                                value={revertConfirmInput}
                                onChange={(e) => setRevertConfirmInput(e.target.value)}
                                className="w-full bg-gray-800/80 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-orange-500 focus:outline-none mb-4 transition-colors placeholder:text-gray-600"
                                placeholder="REVERT"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowRevertConfirmModal(false); setRevertConfirmInput(''); }}
                                    disabled={isReverting}
                                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRevert}
                                    disabled={revertConfirmInput !== 'REVERT' || isReverting}
                                    className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isReverting ? <><Loader2 className="w-4 h-4 animate-spin" />Reverting...</> : 'Confirm Revert'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => {
                            if (!isDeleting) {
                                setShowDeleteModal(false);
                                setDeleteConfirmInput('');
                            }
                        }}
                    />
                    <div className="relative bg-[#141414] rounded-2xl shadow-2xl w-full max-w-md border border-red-500/30 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="h-1 w-full bg-red-500" />
                        <div className="p-8">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Delete account?</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                This action is <strong className="text-red-400">permanent and irreversible</strong>. All your models, purchases, and data will be deleted.
                            </p>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Type <span className="text-white font-bold">{user?.username}</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmInput}
                                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                className="w-full bg-gray-800/80 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-red-500 focus:outline-none mb-4 transition-colors placeholder:text-gray-600"
                                placeholder={user?.username}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setDeleteConfirmInput(''); }}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmInput !== user?.username || isDeleting}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isDeleting
                                        ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</>
                                        : 'Delete Account'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-10">
                <Breadcrumbs
                    items={[
                        { label: 'Profile', href: '/profile' },
                        { label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1), active: true }
                    ]}
                    className="mb-8"
                />

                {/* Global inline banner */}
                {saveBanner && (
                    <div className={`mb-6 flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium animate-in fade-in duration-300 ${saveBanner.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                        {saveBanner.type === 'success'
                            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                            : <XCircle className="w-4 h-4 shrink-0" />}
                        {saveBanner.msg}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Sidebar Left */}
                    <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Content Right */}
                    <div className="flex-1 min-w-0">
                        {/* Tab Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-white capitalize">{activeTab}</h2>
                            {activeTab === 'profile' && user?.role === 'CUSTOMER' && (
                                <div className="flex gap-2">
                                    <Link
                                        href="/become-artist"
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-all"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Artist
                                    </Link>
                                    <Link
                                        href="/become-provider"
                                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-all"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Provider
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* ── TAB: PROFILE ── */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Avatar Card */}
                                <div className="bg-gray-900/40 rounded-2xl p-8 border border-gray-800 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group/banner">
                                    {/* Banner Background */}
                                    <div className="absolute inset-0 z-0">
                                        {user?.banner_url ? (
                                            <img
                                                src={getStorageUrl(user.banner_url)}
                                                alt="Banner"
                                                className="w-full h-full object-cover opacity-50"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800 opacity-80" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40" />
                                    </div>


                                    <div className="relative z-10 group/avatar">
                                        <UserAvatar user={user} size="xl" className="border-4 cursor-pointer border-gray-800 shadow-2xl transition-transform group-hover/avatar:scale-105" />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingAvatar}
                                            aria-label="Change avatar"
                                            className="absolute bottom-1 right-1 cursor-pointer w-7 h-7 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 text-black rounded-full flex items-center justify-center shadow-md transition-all active:scale-95"
                                        >
                                            {isUploadingAvatar
                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                : <Camera className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <div className="relative z-10 flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-bold text-white mb-1">{user?.display_name || user?.username}</h3>
                                        <p className="text-gray-300 mb-4">@{user?.username} · {user?.email}</p>
                                        <Link
                                            href={`/u/${user?.username}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium rounded-lg border border-gray-700 transition-all"
                                        >
                                            <ArrowUpRight className="w-4 h-4" />
                                            View public profile
                                        </Link>
                                    </div>
                                </div>

                                {/* General Settings Card */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                            <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20">
                                                <h3 className="text-lg font-bold text-white">General Information</h3>
                                                <p className="text-sm text-gray-400">Update your basic account information and public profile.</p>
                                            </div>
                                            <div className="p-8 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-2 font-medium">Username</label>
                                                        <input
                                                            type="text"
                                                            value={formData.username}
                                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                            className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-2 font-medium">Display Name</label>
                                                        <input
                                                            type="text"
                                                            value={formData.displayName}
                                                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                            placeholder="John Doe"
                                                            className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Location</label>
                                                    <div className="relative">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                                        <input
                                                            type="text"
                                                            value={formData.location}
                                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                            placeholder="Jakarta, Indonesia"
                                                            className="w-full bg-black/50 text-white pl-12 pr-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Bio</label>
                                                    <textarea
                                                        value={formData.bio}
                                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                        className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 transition-all resize-none h-32"
                                                        placeholder="Write a short bit about yourself..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="px-8 py-4 bg-gray-800/10 border-t border-gray-800 flex justify-end">
                                                <button
                                                    onClick={handleSaveSettings}
                                                    disabled={isSaving}
                                                    className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/20">
                                                <h3 className="font-bold text-white">Social Presence</h3>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div className="relative">
                                                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Twitter URL"
                                                        value={formData.socialLinks.twitter}
                                                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                                                        className="w-full bg-black/30 text-white pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-800 focus:border-blue-400 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                                                    <input
                                                        type="text"
                                                        placeholder="Instagram URL"
                                                        value={formData.socialLinks.instagram}
                                                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                                                        className="w-full bg-black/30 text-white pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-800 focus:border-pink-500 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="GitHub URL"
                                                        className="w-full bg-black/30 text-white pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-800 focus:border-gray-400 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Portfolio Website"
                                                        value={formData.website}
                                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                        className="w-full bg-black/30 text-white pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: UPLOADS ── */}
                        {activeTab === 'uploads' && (
                            <UploadsTab userId={user?.id} />
                        )}

                        {/* ── TAB: ANALYTICS ── */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
                                        <p className="text-sm text-gray-400 mb-1">Total Downloads</p>
                                        <p className="text-3xl font-bold text-white">1,284</p>
                                        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> +12% this month
                                        </p>
                                    </div>
                                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
                                        <p className="text-sm text-gray-400 mb-1">Total Earnings</p>
                                        <p className="text-3xl font-bold text-white">{formatPrice(4820).idr}</p>
                                        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> +8% this month
                                        </p>
                                    </div>
                                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
                                        <p className="text-sm text-gray-400 mb-1">Active Models</p>
                                        <p className="text-3xl font-bold text-white">42</p>
                                        <p className="text-xs text-gray-500 mt-2">All assets online</p>
                                    </div>
                                </div>
                                <div className="bg-gray-900/40 p-8 rounded-2xl border border-gray-800 flex flex-col gap-6">
                                    <div className="flex items-end gap-2 h-32">
                                        {[40, 70, 45, 90, 65, 80, 100, 55, 75, 60, 85, 95].map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500/60 rounded-t-lg transition-all hover:to-emerald-400"
                                                style={{ height: `${h}%` }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2">
                                        <span>Jan</span>
                                        <span>Mar</span>
                                        <span>May</span>
                                        <span>Jul</span>
                                        <span>Sep</span>
                                        <span>Nov</span>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* ── TAB: SHIPPING ── */}
                        {activeTab === 'shipping' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20">
                                        <h3 className="text-lg font-bold text-white">Default Shipping Address</h3>
                                        <p className="text-sm text-gray-400">Where should we send your physical 3D prints or packages?</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Receiver Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.receiverName}
                                                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                                                    placeholder="e.g., John Doe"
                                                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    placeholder="e.g., +62 812-3456-7890"
                                                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2 font-medium">Detailed Address</label>
                                            <textarea
                                                value={formData.detailedAddress}
                                                onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                                                placeholder="Street name, building number, locality..."
                                                className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all h-32 resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Postcode / ZIP</label>
                                                <input
                                                    type="text"
                                                    value={formData.postcode}
                                                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                                    placeholder="54321"
                                                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Preferred Shipping Service</label>
                                                <select
                                                    value={formData.courierPreference}
                                                    onChange={(e) => setFormData({ ...formData, courierPreference: e.target.value })}
                                                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                >
                                                    <option value="JNE">JNE</option>
                                                    <option value="J&T">J&T Express</option>
                                                    <option value="SiCepat">SiCepat</option>
                                                    <option value="Pos Indonesia">Pos Indonesia</option>
                                                    <option value="DHL">DHL (International)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-800">
                                            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-green-400/10 rounded-lg flex items-center justify-center">
                                                        <Sparkles className="w-5 h-5 text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">Eco-friendly Packaging</p>
                                                        <p className="text-sm text-gray-500">Use recycled materials for your shipments when possible.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setFormData({ ...formData, ecoPackaging: !formData.ecoPackaging })}
                                                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${formData.ecoPackaging ? 'bg-green-500' : 'bg-gray-700'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${formData.ecoPackaging ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-8 py-4 bg-gray-800/10 border-t border-gray-800 flex justify-end">
                                        <button
                                            onClick={handleSaveSettings}
                                            disabled={isSaving}
                                            className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Shipping Details'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: SERVICE ── */}
                        {activeTab === 'service' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <ServiceTab />
                            </div>
                        )}

                        {/* ── TAB: JOBS ── */}
                        {activeTab === 'jobs' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <JobsTab />
                            </div>
                        )}

                        {/* ── TAB: WORKSHOP ── */}
                        {activeTab === 'workshop' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20">
                                        <h3 className="text-lg font-bold text-white">Workshop Setup</h3>
                                        <p className="text-sm text-gray-400">Manage your printers and technical capabilities.</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                                    <Settings2 className="w-5 h-5 text-gray-300" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Auto-Accept Orders</p>
                                                    <p className="text-sm text-gray-500">Automatically accept print jobs that match your capabilities.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAutoAccept(!autoAccept)}
                                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 shrink-0 ${autoAccept ? 'bg-yellow-400' : 'bg-gray-700'}`}
                                            >
                                                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${autoAccept ? 'bg-black translate-x-[24px]' : 'bg-gray-400 translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: COLLECTIONS ── */}
                        {activeTab === 'collections' && (
                            <CollectionsTabContent />
                        )}

                        {/* ── TAB: BOOKMARKS ── */}
                        {activeTab === 'bookmarks' && (
                            <BookmarksTabContent />
                        )}

                        {/* ── TAB: SETTINGS ── */}
                        {activeTab === 'settings' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Preferences Card */}
                                <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20">
                                        <h3 className="text-lg font-bold text-white">System Preferences</h3>
                                        <p className="text-sm text-gray-400">Manage your language, timezone, and display settings.</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Language</label>
                                                <select className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all">
                                                    <option>English (US)</option>
                                                    <option>Bahasa Indonesia</option>
                                                    <option>Japanese</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Timezone</label>
                                                <select className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all">
                                                    <option>(GMT+07:00) Jakarta</option>
                                                    <option>(GMT+00:00) UTC</option>
                                                    <option>(GMT-08:00) Pacific Time</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="pt-4 space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                                <div>
                                                    <p className="text-white font-medium flex items-center gap-2">
                                                        Show NSFW Content {formData.showNsfw && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Enable viewing mature and explicit content.</p>
                                                </div>
                                                <button
                                                    onClick={() => setFormData({ ...formData, showNsfw: !formData.showNsfw })}
                                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ${formData.showNsfw ? 'bg-red-500' : 'bg-gray-700'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${formData.showNsfw ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                                <div>
                                                    <p className="text-white font-medium">Email Notifications</p>
                                                    <p className="text-sm text-gray-500">Receive weekly digests and important updates.</p>
                                                </div>
                                                <button
                                                    onClick={() => setEmailNotifs(!emailNotifs)}
                                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 shrink-0 ${emailNotifs ? 'bg-yellow-400' : 'bg-gray-700'}`}
                                                >
                                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${emailNotifs ? 'bg-black translate-x-[24px]' : 'bg-gray-400 translate-x-0'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                                <div>
                                                    <p className="text-white font-medium">Marketplace Updates</p>
                                                    <p className="text-sm text-gray-500">Get notified when models you bookmarked go on sale.</p>
                                                </div>
                                                <button
                                                    onClick={() => setMarketNotifs(!marketNotifs)}
                                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 shrink-0 ${marketNotifs ? 'bg-yellow-400' : 'bg-gray-700'}`}
                                                >
                                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${marketNotifs ? 'bg-black translate-x-[24px]' : 'bg-gray-400 translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-8 py-4 bg-gray-800/10 border-t border-gray-800 flex justify-end">
                                        <button
                                            onClick={handleSaveSettings}
                                            disabled={isSaving}
                                            className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold rounded-xl transition-all"
                                        >
                                            {isSaving ? 'Saving...' : 'Update Preferences'}
                                        </button>
                                    </div>
                                </div>

                                {/* Revert Role Section */}
                                {(user?.role === 'ARTIST' || user?.role === 'PROVIDER') && (
                                    <div className="bg-orange-500/5 rounded-2xl border border-orange-500/20 overflow-hidden mb-8">
                                        <div className="px-8 py-6 border-b border-orange-500/20 bg-orange-500/5">
                                            <h3 className="text-lg font-bold text-orange-400">Role Management</h3>
                                            <p className="text-sm text-gray-400">Manage your creator status on the platform.</p>
                                        </div>
                                        <div className="p-8">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-white font-semibold mb-1">Revert to Resident User</p>
                                                    <p className="text-sm text-gray-500">Stop being an {user.role.toLowerCase()} and become a regular customer. Your active listings will be unlisted.</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowRevertModal(true)}
                                                    className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/40 hover:border-orange-600 font-bold rounded-xl transition-all"
                                                >
                                                    <ArrowUpRight className="w-4 h-4 rotate-180" />
                                                    Revert Role
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Danger Zone */}
                                <div className="bg-red-500/5 rounded-2xl border border-red-500/20 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-red-500/20 bg-red-500/5">
                                        <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
                                        <p className="text-sm text-gray-400">Actions here are permanent and cannot be undone.</p>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-white font-semibold mb-1">Delete Account</p>
                                                <p className="text-sm text-gray-500">Permanently delete your account and all associated data. This cannot be reversed.</p>
                                            </div>
                                            <button
                                                onClick={() => setShowDeleteModal(true)}
                                                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 hover:border-red-600 font-bold rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: BILLING ── */}
                        {activeTab === 'billing' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-900/40 p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-yellow-400/20">
                                            <CreditCard className="w-8 h-8 text-yellow-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Wallets & Cards</h3>
                                        <p className="text-gray-400 mb-8 max-w-xs text-sm">Save your payment methods for faster checkout and secure withdrawals.</p>
                                        <button className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-xl transition-all shadow-xl shadow-yellow-400/10">
                                            Add Payment Method
                                        </button>
                                    </div>
                                    <div className="bg-gray-900/40 p-8 rounded-2xl border border-gray-800">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                                            <button className="text-xs text-yellow-400 hover:underline">View All</button>
                                        </div>
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                                                            <Package className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white">Asset Purchase</p>
                                                            <p className="text-[10px] text-gray-500">March {24 + i}, 2024</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs font-black text-emerald-400">-{formatPrice(15 + i).idr}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}