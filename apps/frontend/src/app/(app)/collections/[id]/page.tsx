'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Lock, Unlock, ArrowLeft, Heart, User, Calendar, Share2, Box } from 'lucide-react';

interface CollectionDetails {
    id: string;
    name: string;
    description?: string;
    is_public: boolean;
    user_id: string;
    created_at: string;
    user: {
        username: string;
        display_name?: string;
        avatar_url?: string;
    };
    items: {
        model: {
            id: string;
            title: string;
            price: number;
            preview_url?: string;
            artist: {
                username: string;
                display_name?: string;
            };
        }
    }[];
}

export default function CollectionDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data: collection, isLoading, error } = useQuery({
        queryKey: ['collection', id],
        queryFn: async () => {
            const res = await api.get<CollectionDetails>(`/collections/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-t-2 border-yellow-400 rounded-full" />
            </div>
        );
    }

    if (error || !collection) {
        return (
            <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-white mb-2">Collection Not Found</h2>
                <p className="text-gray-400 mb-6">This collection may be private or deleted.</p>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#0a0a0a] pb-12">
            {/* Header Section */}
            <div className="bg-gray-900/40 border-b border-gray-800 pt-20 pb-12 px-6 lg:px-12">
                <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
                    <div>
                        <Link href={`/u/${collection.user.username}`} className="flex items-center gap-2 group mb-4">
                            <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden border border-gray-700 group-hover:border-yellow-400 transition-colors">
                                {collection.user.avatar_url ? (
                                    <img src={collection.user.avatar_url} alt={collection.user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                                Curated by <span className="text-yellow-400">{collection.user.display_name || collection.user.username}</span>
                            </span>
                        </Link>

                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{collection.name}</h1>
                            <div className="p-1.5 bg-gray-800/80 rounded border border-gray-700" title={collection.is_public ? "Public Collection" : "Private Collection"}>
                                {collection.is_public ? <Unlock className="w-4 h-4 text-gray-400" /> : <Lock className="w-4 h-4 text-red-400" />}
                            </div>
                        </div>

                        {collection.description && (
                            <p className="text-lg text-gray-400 max-w-2xl mt-4 leading-relaxed">{collection.description}</p>
                        )}

                        <div className="flex items-center gap-6 mt-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Box className="w-4 h-4" />
                                <span>{collection.items.length} items</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>Updated {new Date(collection.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-700 transition-colors shadow-sm">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                    </div>
                </div>
            </div>

            {/* Models Grid */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
                {collection.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/10">
                        <Box className="w-12 h-12 text-gray-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-400">Empty Collection</h3>
                        <p className="text-sm text-gray-500 mt-1">There are no models in this collection yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {collection.items.map(({ model }) => (
                            <Link href={`/catalog/${model.id}`} key={model.id} className="group relative block rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-gray-600 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                <div className="aspect-[4/3] bg-black relative overflow-hidden">
                                    {model.preview_url ? (
                                        <img src={model.preview_url} alt={model.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 group-hover:text-gray-500 transition-colors">
                                            <Box className="w-10 h-10 mb-2" />
                                            <span className="text-xs">No Preview</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                                    <div className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur border border-white/10 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Heart className="w-4 h-4 hover:text-pink-500 hover:fill-pink-500 transition-colors" />
                                    </div>
                                    <div className="absolute bottom-3 right-3 bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-bold">
                                        {model.price === 0 ? 'FREE' : `IDR ${model.price.toLocaleString()}`}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-medium truncate group-hover:text-yellow-400 transition-colors">{model.title}</h3>
                                    <span className="text-xs text-gray-500 mt-1 block truncate">by {model.artist.display_name || model.artist.username}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
