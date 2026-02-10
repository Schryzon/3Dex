'use client';

import { Heart, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface SavedPreviewProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SavedPreview({ isOpen, onClose }: SavedPreviewProps) {
    // Mock data - replace with actual user saved data
    const hasSaved = false;
    const savedCount = 0;
    const recentSaved: any[] = [];

    if (!isOpen) return null;

    return (
        <div
            className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-gray-800 rounded-lg shadow-2xl py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseLeave={onClose}
        >
            {/* Header */}
            <div className="px-4 pb-3 border-b border-gray-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                    My Saved
                </h3>
            </div>

            {/* Content */}
            {hasSaved ? (
                <div className="p-4">
                    {/* Stats */}
                    <div className="bg-[#141414] rounded-lg p-3 mb-4 hover:bg-[#1a1a1a] transition-colors">
                        <p className="text-2xl font-bold text-red-500">{savedCount}</p>
                        <p className="text-xs text-gray-400">Saved Assets</p>
                    </div>

                    {/* View All Button */}
                    <Link
                        href="/saved"
                        onClick={onClose}
                        className="block w-full text-center bg-white hover:bg-gray-200 text-black font-semibold py-2.5 rounded-lg transition-colors"
                    >
                        View All Saved
                    </Link>
                </div>
            ) : (
                /* Empty State */
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 mb-1 font-medium">No saved assets yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Save models you like for later
                    </p>
                    <Link
                        href="/catalog"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors"
                    >
                        Explore
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
