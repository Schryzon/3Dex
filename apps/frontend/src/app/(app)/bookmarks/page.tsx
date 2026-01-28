'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Bookmark, Heart, Search, X } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
    const { user } = useAuth();

    // Mock data - replace with actual bookmarks data
    const bookmarks: any[] = [];
    const hasBookmarks = bookmarks.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-24 pb-16">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        My <span className="text-yellow-400">Bookmarks</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Your saved 3D assets and favorites
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Bookmark className="w-6 h-6 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">{bookmarks.length}</span>
                        </div>
                        <p className="text-gray-400 text-sm">Total Bookmarks</p>
                    </div>
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Heart className="w-6 h-6 text-red-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-400 text-sm">This Week</p>
                    </div>
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Bookmark className="w-6 h-6 text-purple-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-400 text-sm">Categories</p>
                    </div>
                </div>

                {/* Search & Filter */}
                {hasBookmarks && (
                    <div className="mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search your bookmarks..."
                                className="w-full bg-gray-800 text-white px-4 py-3 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 border border-gray-700 placeholder-gray-400"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <select className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 outline-none focus:border-yellow-400 cursor-pointer">
                            <option>All Categories</option>
                            <option>3D Models</option>
                            <option>Textures</option>
                            <option>CG Models</option>
                        </select>
                        <select className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 outline-none focus:border-yellow-400 cursor-pointer">
                            <option>Sort by: Recent</option>
                            <option>Sort by: Name</option>
                            <option>Sort by: Price</option>
                        </select>
                    </div>
                )}

                {/* Bookmarks Grid or Empty State */}
                {hasBookmarks ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {bookmarks.map((item, index) => (
                            <div
                                key={index}
                                className="group bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-yellow-400/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-400/10"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-square bg-gray-700 flex items-center justify-center">
                                    <Heart className="w-16 h-16 text-gray-500" />
                                    {/* Remove Bookmark Button */}
                                    <button
                                        className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors"
                                        onClick={() => {
                                            // Handle remove bookmark
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-white font-semibold mb-2 group-hover:text-yellow-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-3">{item.category}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-yellow-400 font-bold">{item.price}</span>
                                        <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-colors text-sm">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-12 md:p-16 border border-gray-700 text-center">
                        <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bookmark className="w-12 h-12 text-gray-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No Bookmarks Yet</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Start bookmarking your favorite 3D models and textures to save them for later. Click the bookmark icon on any asset to add it here.
                        </p>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors"
                        >
                            Discover Models
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
