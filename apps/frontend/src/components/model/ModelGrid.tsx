'use client';

import { useProducts } from '@/lib/hooks/useProducts';
import Link from 'next/link';
import { Box, Upload } from 'lucide-react';

interface ModelGridProps {
    artistId?: string;
    showUpload?: boolean;
}

export default function ModelGrid({ artistId, showUpload = false }: ModelGridProps) {
    const { data, isLoading } = useProducts({ artistId });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden aspect-square" />
                ))}
            </div>
        );
    }

    if (data?.data.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-gray-800 border-dashed">
                <Box className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No models found</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    {showUpload ? "Upload your first 3D model to start selling." : "This user hasn't uploaded any models yet."}
                </p>
                {showUpload && (
                    <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
                        Upload Asset
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((model) => (
                <Link href={`/catalog/${model.id}`} key={model.id} className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden group hover:border-yellow-400/50 transition-all">
                    <div className="aspect-square bg-gray-800 relative">
                        {model.thumbnails[0] ? (
                            <img src={model.thumbnails[0]} alt={model.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                <Box className="w-12 h-12" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white">
                            {model.price === 0 ? 'Free' : `$${model.price}`}
                        </div>
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${model.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                            model.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                                'bg-red-500/20 text-red-400 border border-red-500/20'
                            }`}>
                            {model.status}
                        </div>
                    </div>
                    <div className="p-4">
                        <h4 className="font-bold text-white mb-1 truncate">{model.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{model.category}</span>
                            <span>{new Date(model.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
