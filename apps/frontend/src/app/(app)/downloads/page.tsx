'use client';

import { useQuery } from '@tanstack/react-query';
import { purchaseService } from '@/lib/api/services';
import { Download, Search, Package, FileArchive, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { formatFileSize, formatDate } from '@/lib/utils';
import { useState } from 'react';

export default function DownloadsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: purchases, isLoading, error } = useQuery({
        queryKey: ['purchases'],
        queryFn: () => purchaseService.getPurchases(),
        enabled: !!user,
    });

    if (authLoading) return null;
    if (!user) {
        router.push('/');
        return null;
    }

    const handleDownload = async (modelId: string, title: string) => {
        try {
            const { download_url } = await purchaseService.getDownloadUrl(modelId);
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = download_url;
            link.setAttribute('download', `${title}.glb`); // Default to glb for now
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to get download link. Please try again.');
        }
    };

    const filteredDownloads = purchases?.filter(p =>
        p.model.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const totalModels = purchases?.length || 0;

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto">
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
                            <span className="text-2xl font-bold text-white">{totalModels}</span>
                        </div>
                        <p className="text-gray-500 text-sm">Total Assets</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <FileArchive className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">{totalModels}</span>
                        </div>
                        <p className="text-gray-500 text-sm">3D Models</p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-8 max-w-md relative">
                    <input
                        type="text"
                        placeholder="Search your library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#141414] text-white px-4 py-3 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500/50 border border-gray-800 placeholder-gray-500"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredDownloads.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDownloads.map((purchase) => (
                            <div key={purchase.id} className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden group hover:border-yellow-500/30 transition-all duration-300 shadow-lg">
                                <div className="aspect-square relative overflow-hidden bg-gray-900 border-b border-gray-800">
                                    <img
                                        src={purchase.model.preview_url}
                                        alt={purchase.model.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Link
                                            href={`/catalog/${purchase.model_id}`}
                                            className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                                            title="View Details"
                                        >
                                            <ExternalLink className="w-5 h-5 text-white" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-white truncate mb-1" title={purchase.model.title}>
                                        {purchase.model.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <span>{formatFileSize(purchase.model.file_size || 0)}</span>
                                        <span>•</span>
                                        <span>{purchase.model.file_format?.[0] || 'GLB'}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(purchase.model_id, purchase.model.title)}
                                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download File
                                    </button>
                                    <p className="text-[10px] text-gray-600 text-center mt-3 flex items-center justify-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Purchased on {formatDate(purchase.purchase_date)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#141414] rounded-2xl p-12 md:p-16 border border-gray-800 text-center">
                        <div className="w-24 h-24 bg-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Download className="w-12 h-12 text-gray-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {searchQuery ? 'No results found' : 'No downloads yet'}
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            {searchQuery
                                ? `We couldn't find any assets matching "${searchQuery}".`
                                : "Purchase 3D models, textures, or other assets and they will appear here for easy re-downloading."
                            }
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
