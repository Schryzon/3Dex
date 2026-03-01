'use client';

import { Package, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface MyAssetsPreviewProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MyAssetsPreview({ isOpen, onClose }: MyAssetsPreviewProps) {
    // Mock data - replace with actual user assets data
    const hasAssets = false; // Set to true when user has assets
    const assetsCount = 0;
    const collectionsCount = 0;
    const recentPurchases: any[] = []; // Replace with actual data

    if (!isOpen) return null;

    return (
        <div
            className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseLeave={onClose}
        >
            {/* Header */}
            <div className="px-4 pb-3 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold">My Assets</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            {hasAssets ? (
                <div className="p-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-800 rounded-lg p-3">
                            <p className="text-2xl font-bold text-yellow-400">{assetsCount}</p>
                            <p className="text-xs text-gray-400">Total Assets</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                            <p className="text-2xl font-bold text-yellow-400">{collectionsCount}</p>
                            <p className="text-xs text-gray-400">Collections</p>
                        </div>
                    </div>

                    {/* Recent Purchases */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Recent Purchases</p>
                        <div className="space-y-2">
                            {recentPurchases.slice(0, 3).map((asset, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{asset.name}</p>
                                        <p className="text-xs text-gray-400">{asset.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* View All Button */}
                    <Link
                        href="/my-assets"
                        className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        View All Assets
                    </Link>
                </div>
            ) : (
                /* Empty State */
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 mb-1">No assets yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Start building your collection
                    </p>
                    <Link
                        href="/catalog"
                        className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        Browse Models
                    </Link>
                </div>
            )}
        </div>
    );
}
