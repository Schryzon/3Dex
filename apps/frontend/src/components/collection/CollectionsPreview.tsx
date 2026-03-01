'use client';

import { FolderOpen, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CollectionsPreviewProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CollectionsPreview({ isOpen, onClose }: CollectionsPreviewProps) {
    // Mock data - replace with actual user collections data
    const hasCollections = false; // Set to true when user has collections
    const collectionsCount = 0;
    const recentDownloads: any[] = []; // Replace with actual data

    if (!isOpen) return null;

    return (
        <div
            className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-lg shadow-2xl py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseLeave={onClose}
        >
            {/* Header */}
            <div className="px-4 pb-3 border-b border-gray-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-yellow-400" />
                    My Collections
                </h3>
            </div>

            {/* Content */}
            {hasCollections ? (
                <div className="p-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 hover:bg-gray-800/60 transition-colors">
                            <p className="text-2xl font-bold text-yellow-400">{collectionsCount}</p>
                            <p className="text-xs text-gray-400">Total Models</p>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 hover:bg-gray-800/60 transition-colors">
                            <p className="text-2xl font-bold text-yellow-400">{recentDownloads.length}</p>
                            <p className="text-xs text-gray-400">Recent</p>
                        </div>
                    </div>

                    {/* Recent Downloads */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Recent Downloads</p>
                        <div className="space-y-2">
                            {recentDownloads.slice(0, 3).map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-2 bg-gray-800/40 backdrop-blur-sm rounded-lg hover:bg-gray-800/60 transition-all duration-200 cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-gray-700/50 rounded flex items-center justify-center">
                                        <FolderOpen className="w-6 h-6 text-gray-500 group-hover:text-yellow-400 transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate group-hover:text-yellow-400 transition-colors">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-400">{item.date}</p>
                                    </div>
                                    <Download className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* View All Button */}
                    <Link
                        href="/collections"
                        onClick={onClose}
                        className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2.5 rounded-lg transition-colors"
                    >
                        View All Collections
                    </Link>
                </div>
            ) : (
                /* Empty State */
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 mb-1 font-medium">No collections yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Purchase models to start your collection
                    </p>
                    <Link
                        href="/catalog"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors"
                    >
                        Browse Models
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
