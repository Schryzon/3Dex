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
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        My <span className="text-red-500">Saved</span> Assets
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Items you've liked and saved for later
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className="bg-[#141414] rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Heart className="w-6 h-6 text-red-500 fill-current" />
                            <span className="text-2xl font-bold text-white">{savedItems.length}</span>
                        </div>
                        <p className="text-gray-400 text-sm">Total Saved</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Heart className="w-6 h-6 text-pink-500" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-400 text-sm">Newly Added</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-6 h-6 text-blue-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-400 text-sm">Categories</p>
                    </div>
                </div>

                {/* Search & Filter */}
                {hasSaved && (
                    <div className="mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search saved items..."
                                className="w-full bg-[#141414] text-white px-4 py-3 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-red-500 border border-gray-800 placeholder-gray-400"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <select className="bg-[#141414] text-white px-4 py-3 rounded-lg border border-gray-800 outline-none focus:border-red-500 cursor-pointer">
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
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-lg transition-colors"
                        >
                            Explore Catalog
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
