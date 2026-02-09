'use client';

import { Download, Search, Package, FileArchive, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DownloadsPage() {
    // Mock data - replace with actual downloads data from API
    const downloads: any[] = [];
    const hasDownloads = downloads.length > 0;

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        My <span className="text-yellow-400">Downloads</span>
                    </h1>
                    <p className="text-gray-400">
                        Access your purchased and downloaded 3D assets
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Download className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">{downloads.length}</span>
                        </div>
                        <p className="text-gray-500 text-sm">Total Downloads</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <FileArchive className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-500 text-sm">3D Models</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-500 text-sm">Textures</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-500 text-sm">This Month</p>
                    </div>
                </div>

                {/* Search & Filter */}
                {hasDownloads && (
                    <div className="mb-8 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search downloads..."
                                className="w-full bg-[#141414] text-white px-4 py-3 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500/50 border border-gray-800 placeholder-gray-500"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                        <select className="bg-[#141414] text-white px-4 py-3 rounded-lg border border-gray-800 outline-none focus:ring-2 focus:ring-yellow-500/50 cursor-pointer">
                            <option>All Types</option>
                            <option>3D Models</option>
                            <option>Textures</option>
                            <option>Materials</option>
                        </select>
                    </div>
                )}

                {/* Downloads Grid or Empty State */}
                {hasDownloads ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Download items would be mapped here */}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-[#141414] rounded-2xl p-12 md:p-16 border border-gray-800 text-center">
                        <div className="w-24 h-24 bg-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Download className="w-12 h-12 text-gray-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No downloads yet</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Purchase 3D models, textures, or other assets and they will appear here for easy re-downloading.
                        </p>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
