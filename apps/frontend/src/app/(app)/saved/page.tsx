'use client';

import { useWishlist } from '@/features/catalog/hooks/useWishlist';
import { useAuth } from '@/features/auth';
import { Heart, Search, Package, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';

export default function SavedPage() {
    const { user } = useAuth();
    const { wishlistItems, isLoading, removeFromWishlist, isToggling } = useWishlist();
    const [searchQuery, setSearchQuery] = useState('');
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (modelId: string) => {
        setRemovingId(modelId);
        try {
            await removeFromWishlist(modelId);
        } finally {
            setRemovingId(null);
        }
    };

    // Filter by search query
    const filtered = wishlistItems.filter((item: any) => {
        const model = item.model || {};
        const title = (model.title || '').toLowerCase();
        return title.includes(searchQuery.toLowerCase());
    });

    if (isLoading) {
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
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        My <span className="text-yellow-400">Saved</span> Assets
                    </h1>
                    <p className="text-gray-400">
                        Items you've liked and saved for later
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Heart className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">{wishlistItems.length}</span>
                        </div>
                        <p className="text-gray-500 text-sm">Total Saved</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">
                                {new Set(wishlistItems.map((i: any) => i.model?.category)).size}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">Categories</p>
                    </div>
                </div>

                {/* Search */}
                {wishlistItems.length > 0 && (
                    <div className="mb-8 relative max-w-md">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search saved items..."
                            className="w-full bg-[#141414] text-white px-4 py-3 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500/50 border border-gray-800 placeholder-gray-500"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    </div>
                )}

                {/* Grid or Empty State */}
                {wishlistItems.length === 0 ? (
                    <div className="bg-[#141414] rounded-2xl p-12 md:p-16 border border-gray-800 text-center">
                        <div className="w-24 h-24 bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-12 h-12 text-gray-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No saved assets yet</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Start saving assets you like by clicking the heart icon on any product page.
                        </p>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors"
                        >
                            Explore Catalog
                        </Link>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No items match "<span className="text-white">{searchQuery}</span>"
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((item: any) => {
                            const model = item.model || {};
                            const modelId = item.model_id || item.modelId;
                            const thumb = model.preview_url
                                ? model.preview_url
                                : (model.thumbnails?.[0] || '/placeholder.jpg');
                            const price = model.price || 0;

                            return (
                                <div
                                    key={item.id || modelId}
                                    className="group relative bg-[#141414] rounded-xl border border-gray-800 hover:border-yellow-400/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/5"
                                >
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemove(modelId)}
                                        disabled={removingId === modelId}
                                        className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
                                        aria-label="Remove from saved"
                                    >
                                        {removingId === modelId ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <X className="w-4 h-4" />
                                        )}
                                    </button>

                                    {/* Thumbnail */}
                                    <Link href={`/catalog/${modelId}`}>
                                        <div className="aspect-[4/3] overflow-hidden bg-gray-900">
                                            <img
                                                src={thumb}
                                                alt={model.title || 'Model'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="p-4">
                                        <Link href={`/catalog/${modelId}`}>
                                            <h3 className="font-semibold text-white text-sm truncate hover:text-yellow-400 transition-colors mb-1">
                                                {model.title || 'Untitled'}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-gray-500 mb-3">
                                            by {model.artist?.username || 'Unknown'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-yellow-400 text-sm">
                                                {price === 0 ? 'Free' : formatPrice(price).idr}
                                            </span>
                                            <Link
                                                href={`/catalog/${modelId}`}
                                                className="text-xs px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-colors"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
