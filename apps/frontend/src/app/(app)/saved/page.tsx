'use client';

import { useWishlist } from '@/features/catalog/hooks/useWishlist';
import { useCollections } from '@/features/collection/hooks/useCollections';
import { useAuth } from '@/features/auth';
import { Heart, Search, Package, Loader2, X, FolderOpen, Plus, MoreVertical, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';

type LibraryTab = 'wishlist' | 'collections';

export default function SavedPage() {
    const { user } = useAuth();
    const { wishlistItems, isLoading: isLoadingWishlist, removeFromWishlist } = useWishlist();
    const { collections, isLoading: isLoadingCollections, createCollection } = useCollections();
    
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
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            My <span className="text-yellow-400">Library</span>
                        </h1>
                        <p className="text-gray-400">
                            Organize your favorite assets and custom collections
                        </p>
                    </div>

                    {activeTab === 'collections' && (
                        <button 
                            onClick={() => setIsCreatingOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/10"
                        >
                            <Plus className="w-5 h-5" />
                            New Collection
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#141414] rounded-2xl w-fit mb-8 border border-gray-800">
                    <button
                        onClick={() => setActiveTab('wishlist')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'wishlist' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Heart className={`w-4 h-4 ${activeTab === 'wishlist' ? 'fill-current' : ''}`} />
                        Wishlist ({wishlistItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('collections')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'collections' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <FolderOpen className="w-4 h-4" />
                        Collections ({collections.length})
                    </button>
                </div>

                {/* Search */}
                <div className="mb-8 relative max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab === 'wishlist' ? 'saved items' : 'collections'}...`}
                        className="w-full bg-[#141414] text-white px-4 py-3 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/50 border border-gray-800 placeholder-gray-500 transition-all"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>

                {/* Content View */}
                {activeTab === 'wishlist' ? (
                    /* WISHLIST VIEW */
                    wishlistItems.length === 0 ? (
                        <div className="bg-[#141414] rounded-2xl p-12 md:p-16 border border-gray-800 text-center">
                            <div className="w-24 h-24 bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-12 h-12 text-gray-700" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">No saved assets yet</h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Start saving assets you like by clicking the heart icon on any product page.
                            </p>
                            <Link href="/catalog" className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors">
                                Explore Catalog
                            </Link>
                        </div>
                    ) : filteredWishlist.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            No items match "<span className="text-white">{searchQuery}</span>"
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredWishlist.map((item: any) => {
                                const model = item.model || {};
                                const modelId = item.model_id || item.modelId;
                                const thumb = model.preview_url || (model.thumbnails?.[0] || '/placeholder.jpg');
                                const price = model.price || 0;
                                return (
                                    <div key={item.id || modelId} className="group relative bg-[#141414] rounded-xl border border-gray-800 hover:border-yellow-400/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/5">
                                        <button onClick={() => handleRemove(modelId)} disabled={removingId === modelId} className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50">
                                            {removingId === modelId ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                        </button>
                                        <Link href={`/catalog/${modelId}`}>
                                            <div className="aspect-[4/3] overflow-hidden bg-gray-900">
                                                <img src={thumb} alt={model.title || 'Model'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        </Link>
                                        <div className="p-4">
                                            <Link href={`/catalog/${modelId}`}>
                                                <h3 className="font-semibold text-white text-sm truncate hover:text-yellow-400 transition-colors mb-1">
                                                    {model.title || 'Untitled'}
                                                </h3>
                                            </Link>
                                            <p className="text-xs text-gray-500 mb-3">by {model.artist?.username || 'Unknown'}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-yellow-400 text-sm">{price === 0 ? 'Free' : formatPrice(price).idr}</span>
                                                <Link href={`/catalog/${modelId}`} className="text-xs px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-colors">
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
                        <div className="bg-[#141414] rounded-2xl p-12 md:p-16 border border-gray-800 text-center">
                            <div className="w-24 h-24 bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FolderOpen className="w-12 h-12 text-gray-700" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">No collections yet</h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">Create collections to group your favorite 3D models and textures.</p>
                            <button onClick={() => setIsCreatingOpen(true)} className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-colors">
                                <Plus className="w-5 h-5" />
                                Create First Collection
                            </button>
                        </div>
                    ) : filteredCollections.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            No collections match "<span className="text-white">{searchQuery}</span>"
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCollections.map((collection: any) => (
                                <Link 
                                    key={collection.id} 
                                    href={`/profile?tab=collections&id=${collection.id}`} 
                                    className="group bg-[#141414] rounded-2xl border border-gray-800 hover:border-yellow-400/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/5 relative"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 bg-gray-800/50 rounded-xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all">
                                            <FolderOpen className="w-7 h-7" />
                                        </div>
                                        <button onClick={(e) => { e.preventDefault(); /* Action menu */ }} className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">{collection.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Package className="w-4 h-4" />
                                            {collection._count?.items || 0} items
                                        </span>
                                        <span className="px-2 py-0.5 bg-gray-800 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            {collection.is_public ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-medium text-yellow-400/70 italic">View contents</span>
                                        <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Create Collection Modal Overlay */}
            {isCreatingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreatingOpen(false)} />
                    <div className="relative w-full max-w-md bg-[#141414] border border-gray-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Create Collection</h2>
                            <button onClick={() => setIsCreatingOpen(false)} className="text-gray-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Collection Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="e.g., Sci-Fi Models"
                                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-400 transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                                />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button onClick={() => setIsCreatingOpen(false)} className="flex-1 px-4 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleCreateCollection} disabled={!newCollectionName.trim()} className="flex-1 px-4 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-50">
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
