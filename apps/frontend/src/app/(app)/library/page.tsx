'use client';

import { useWishlist } from '@/features/catalog/hooks/useWishlist';
import { useCollections } from '@/features/collection/hooks/useCollections';
import { useAuth } from '@/features/auth';
import {
    Heart, Search, Package, Loader2, X, FolderOpen,
    Plus, MoreVertical, Pencil, Trash2, Check, Globe, Lock,
    Download, LayoutDashboard, Clock, ExternalLink, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { getStorageUrl } from '@/lib/utils/storage';
import { productService } from '@/lib/api/services/product.service';
import { purchaseService } from '@/lib/api/services/purchase.service';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type LibraryTab = 'purchases' | 'uploads' | 'wishlist' | 'collections';

export default function LibraryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-8 h-8 text-yellow-400 animate-spin" /></div>}>
            <LibraryContent />
        </Suspense>
    );
}

function LibraryContent() {
    const { user } = useAuth();
    const role = user?.role;
    const isArtist = role === 'ARTIST' || role === 'ADMIN';
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState<LibraryTab>((searchParams.get('tab') as LibraryTab) || 'purchases');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Core Library Data (Purchases + Uploads)
    const [libraryModels, setLibraryModels] = useState<any[]>([]);
    const [isLibraryLoading, setIsLibraryLoading] = useState(true);

    // Wishlist & Collections Hooks
    const { wishlistItems, isLoading: isLoadingWishlist, removeFromWishlist } = useWishlist();
    const {
        collections,
        isLoading: isLoadingCollections,
        createCollection,
        renameCollection,
        deleteCollection,
        updateCollection
    } = useCollections();

    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isCreatingOpen, setIsCreatingOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    // Fetch Library (Purchases/Uploads)
    useEffect(() => {
        const fetchLib = async () => {
            setIsLibraryLoading(true);
            try {
                const data = await productService.getUserLibrary();
                setLibraryModels(data);
            } catch (err) {
                console.error("Failed to load library items", err);
            } finally {
                setIsLibraryLoading(false);
            }
        };
        fetchLib();
    }, []);

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get('tab') as LibraryTab;
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab: LibraryTab) => {
        setActiveTab(tab);
        router.push(`/library?tab=${tab}`, { scroll: false });
    };

    const handleDownload = async (modelId: string, title: string) => {
        try {
            const { download_url } = await purchaseService.getDownloadUrl(modelId);
            const link = document.createElement('a');
            link.href = download_url;
            link.setAttribute('download', `${title}.glb`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            alert('Download failed. Please try again.');
        }
    };

    // Filter Logic
    const purchases = libraryModels.filter(m => m.source === 'purchased');
    const uploads = libraryModels.filter(m => m.source === 'uploaded');

    const filteredData = () => {
        const q = searchQuery.toLowerCase();
        switch (activeTab) {
            case 'purchases': return purchases.filter(m => m.title.toLowerCase().includes(q));
            case 'uploads': return uploads.filter(m => m.title.toLowerCase().includes(q));
            case 'wishlist': return wishlistItems.filter((item: any) => (item.model?.title || '').toLowerCase().includes(q));
            case 'collections': return collections.filter((c: any) => c.name.toLowerCase().includes(q));
            default: return [];
        }
    };

    const displayData = filteredData();
    const isLoading = isLibraryLoading || (activeTab === 'wishlist' && isLoadingWishlist) || (activeTab === 'collections' && isLoadingCollections);

    return (
        <div className="min-h-screen bg-[#070707] py-12 px-4 md:px-8">
            <div className="max-w-[1600px] mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-400/20">
                                <FolderOpen className="text-black w-6 h-6" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white">
                                My <span className="text-yellow-400">Library</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 max-w-xl font-medium leading-relaxed">
                            Your centralized 3D asset hub. Manage your purchases, uploads, and curated collections in one premium space.
                        </p>
                    </div>

                    {activeTab === 'collections' && (
                        <button
                            onClick={() => setIsCreatingOpen(true)}
                            className="bg-white hover:bg-yellow-400 text-black px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-xl active:scale-95 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> New Collection
                        </button>
                    )}
                </div>

                {/* Navigation & Search Bar */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center">
                    <div className="flex p-2 bg-[#121212] rounded-3xl border border-white/5 w-full lg:w-fit overflow-x-auto no-scrollbar">
                        {[
                            { id: 'purchases', label: 'Purchases', icon: Package, count: purchases.length },
                            ...(isArtist ? [{ id: 'uploads', label: 'My Uploads', icon: LayoutDashboard, count: uploads.length }] : []),
                            { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlistItems.length },
                            { id: 'collections', label: 'Collections', icon: FolderOpen, count: collections.length },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as LibraryTab)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10' 
                                    : 'text-gray-600 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id && tab.id === 'wishlist' ? 'fill-current' : ''}`} />
                                {tab.label}
                                <span className={`ml-1 opacity-40 text-[10px] ${activeTab === tab.id ? 'text-black' : 'text-gray-500'}`}>
                                    ({tab.count})
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-hover:text-yellow-400/50 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search your ${activeTab}...`}
                            className="w-full bg-[#121212] border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-white text-sm font-bold placeholder-gray-700 focus:border-yellow-400/50 focus:bg-[#181818] outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-24 gap-4"
                            >
                                <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Synching Assets...</span>
                            </motion.div>
                        ) : displayData.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="bg-[#121212]/50 border-2 border-dashed border-white/5 rounded-[3rem] p-24 text-center"
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <Package className="w-10 h-10 text-gray-800" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Empty Workspace</h3>
                                <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium">
                                    No items found in your {activeTab}. Start browsing the catalog to build your professional library.
                                </p>
                                <Link href="/catalog" className="mt-8 inline-block px-10 py-4 bg-white hover:bg-yellow-400 text-black font-bold uppercase tracking-wider text-[10px] rounded-2xl transition-all active:scale-95">
                                    Browse Marketplace
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
                            >
                                {displayData.map((item, idx) => (
                                    <AssetCard 
                                        key={item.id ?? idx} 
                                        item={item} 
                                        type={activeTab} 
                                        onDownload={handleDownload}
                                        onRemoveFromWishlist={removeFromWishlist}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modals for Collections */}
            {isCreatingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsCreatingOpen(false)} />
                    <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50" />
                        <h2 className="text-2xl font-bold text-white mb-8">Create <span className="text-yellow-400">Folder</span></h2>
                        <input
                            autoFocus
                            type="text"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="e.g., Cyberpunk Character Pack"
                            className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-yellow-400/50 transition-all mb-8"
                        />
                        <div className="flex gap-4">
                            <button onClick={() => setIsCreatingOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-2xl font-semibold uppercase tracking-wider text-[10px] transition-all">Cancel</button>
                            <button 
                                onClick={async () => {
                                    if(newCollectionName.trim()){
                                        await createCollection(newCollectionName.trim());
                                        setNewCollectionName('');
                                        setIsCreatingOpen(false);
                                    }
                                }}
                                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-2xl font-bold uppercase tracking-wider text-[10px] transition-all shadow-xl shadow-yellow-400/10"
                            >
                                Initialize
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AssetCard({ item, type, onDownload, onRemoveFromWishlist }: any) {
    const isWishlist = type === 'wishlist';
    const isCollection = type === 'collections';
    const model = isWishlist ? item.model : (isCollection ? null : item);
    
    if (isCollection) {
        return (
            <Link href={`/collections/${item.id}`} className="group block">
                <div className="aspect-[4/3] rounded-[2rem] bg-[#121212] border border-white/5 group-hover:border-yellow-400/40 overflow-hidden relative transition-all duration-500 shadow-2xl">
                    <div className="w-full h-full flex gap-1.5 p-1.5">
                        <div className="flex-[2] rounded-2xl overflow-hidden bg-white/5">
                            {item.items?.[0] && <img src={getStorageUrl(item.items[0].model.preview_url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                            <div className="flex-1 rounded-xl overflow-hidden bg-white/5">
                                {item.items?.[1] && <img src={getStorageUrl(item.items[1].model.preview_url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                            </div>
                            <div className="flex-1 rounded-xl bg-white/5 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-gray-500">+{Math.max(0, (item._count?.items ?? 0) - 2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 px-2">
                    <h4 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{item.name}</h4>
                    <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">{item._count?.items ?? 0} Assets</span>
                </div>
            </Link>
        );
    }

    const thumb = getStorageUrl(model?.preview_url || model?.thumbnails?.[0]) || '/placeholder.jpg';

    return (
        <div className="group relative bg-[#0c0c0c] rounded-[2rem] border border-white/5 hover:border-yellow-400/40 transition-all duration-500 overflow-hidden shadow-2xl">
            {/* Visual Container */}
            <div className="aspect-[4/3] relative overflow-hidden bg-[#111]">
                <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Link href={`/catalog/${model.id}`} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all">
                        <ExternalLink className="w-5 h-5" />
                    </Link>
                    {type === 'purchases' && (
                        <button onClick={() => onDownload(model.id, model.title)} className="w-10 h-10 bg-yellow-400 text-black rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-yellow-400/20">
                            <Download className="w-5 h-5" />
                        </button>
                    )}
                </div>
                {isWishlist && (
                    <button 
                        onClick={() => onRemoveFromWishlist(model.id)}
                        className="absolute top-4 right-4 w-8 h-8 bg-black/80 backdrop-blur-md rounded-lg flex items-center justify-center text-red-500 border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Info Stack */}
            <div className="p-5">
                <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate" title={model.title}>{model.title}</h4>
                        <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mt-1">
                            {model.artist?.username ? `@${model.artist.username}` : '3DEX PRIME'}
                        </p>
                    </div>
                </div>

                {type === 'purchases' && (
                   <div className="flex items-center gap-2 text-[9px] font-medium text-zinc-600 uppercase">
                       <Clock className="w-3 h-3" />
                       Owned since {formatDate(item.purchased_at)}
                   </div>
                )}
                
                {type === 'uploads' && (
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[9px] font-medium text-blue-400/80 uppercase tracking-wider">
                           <LayoutDashboard className="w-3 h-3" />
                           Creator Asset
                       </div>
                       <Link href={`/catalog/${model.id}/edit`} className="text-[9px] font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-wider">Edit Mesh</Link>
                   </div>
                )}
            </div>
        </div>
    );
}
