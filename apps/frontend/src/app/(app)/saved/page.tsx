'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Heart, Search, X, Package } from 'lucide-react';
import Link from 'next/link';

export default function SavedPage() {
    const { user } = useAuth();

    // Mock data - replace with actual saved data
    const savedItems: any[] = [];
    const hasSaved = savedItems.length > 0;

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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Heart className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">{savedItems.length}</span>
                        </div>
                        <p className="text-gray-500 text-sm">Total Saved</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Heart className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-500 text-sm">Newly Added</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-500 text-sm">Categories</p>
                    </div>
                </div>

                {/* Search & Filter */}
                {hasSaved && (
                    <div className="mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search saved items..."
                                className="w-full bg-[#141414] text-white px-4 py-3 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500/50 border border-gray-800 placeholder-gray-500"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                        <select className="bg-[#141414] text-white px-4 py-3 rounded-lg border border-gray-800 outline-none focus:ring-2 focus:ring-yellow-500/50 cursor-pointer">
                            <option>All Categories</option>
                            <option>3D Models</option>
                            <option>Textures</option>
                        </select>
                    </div>
                )}

                {/* Grid or Empty State */}
                {hasSaved ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Saved items mapping would go here */}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-[#141414] rounded-2xl p-12 md:p-16 border border-gray-800 text-center">
                        <div className="w-24 h-24 bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-12 h-12 text-gray-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No saved assets yet</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Start saving assets you like by clicking the heart icon on any product card.
                        </p>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors"
                        >
                            Explore Catalog
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
