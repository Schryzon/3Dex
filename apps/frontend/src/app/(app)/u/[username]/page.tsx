'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import UserAvatar from '@/components/common/UserAvatar';
import ModelGrid from '@/components/model/ModelGrid';
import {
    MapPin,
    Calendar,
    Link as LinkIcon,
    Twitter,
    Instagram,
    Github,
    Printer,
    Share2,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function PublicProfilePage() {
    const { username } = useParams();
    const [activeTab, setActiveTab] = useState<'models' | 'posts' | 'about'>('models');

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user', username],
        queryFn: async () => {
            const res = await api.get<User>(`/users/${username}`);
            return res.data;
        },
        enabled: !!username
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-20 flex justify-center">
                <div className="animate-spin w-8 h-8 border-t-2 border-yellow-400 rounded-full" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-20 text-center">
                <h1 className="text-2xl text-white font-bold">User not found</h1>
                <Link href="/" className="text-yellow-400 hover:underline mt-4 block">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Cover Image (Placeholder for now) */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-800 relative">
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Profile Header */}
                <div className="relative -mt-20 mb-8 flex flex-col md:flex-row items-end md:items-end gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0a0a0a] bg-gray-800 overflow-hidden">
                            <UserAvatar user={user} className="w-full h-full text-4xl" />
                        </div>
                        {user.role === 'PROVIDER' && (
                            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-[#0a0a0a]" title="Verified Provider">
                                <Printer className="w-4 h-4" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pb-2">
                        <h1 className="text-3xl font-bold text-white mb-1">{user.display_name || user.username}</h1>
                        <p className="text-gray-400 font-medium">@{user.username}</p>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                            {user.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                            {user.website && (
                                <Link href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-yellow-400 hover:underline">
                                    <LinkIcon className="w-4 h-4" />
                                    <span>Website</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pb-2 w-full md:w-auto">
                        {user.role === 'PROVIDER' && (
                            <Link
                                href={`/print-services/${user.username}/order`}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
                            >
                                <Printer className="w-4 h-4" />
                                Request Print
                            </Link>
                        )}
                        <button className="p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-700 transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Bio & Socials */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2">
                        {user.bio && (
                            <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">{user.bio}</p>
                        )}

                        {/* Tabs */}
                        <div className="border-b border-gray-800 mb-6">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setActiveTab('models')}
                                    className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'models' ? 'border-yellow-400 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                >
                                    Models
                                </button>
                                <button
                                    onClick={() => setActiveTab('about')}
                                    className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'about' ? 'border-yellow-400 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                >
                                    About
                                </button>
                            </div>
                        </div>

                        {activeTab === 'models' && (
                            <ModelGrid artistId={user.id} />
                        )}

                        {activeTab === 'about' && (
                            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">About {user.display_name || user.username}</h3>
                                {user.role === 'PROVIDER' && user.provider_config && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Service Capabilities</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-gray-500 text-sm block mb-1">Materials</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.provider_config.materials.map(m => (
                                                        <span key={m} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">{m}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-sm block mb-1">Printer Types</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.provider_config.printerTypes.map(p => (
                                                        <span key={p} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Socials</h4>
                                <div className="flex gap-4">
                                    {user.social_twitter && (
                                        <Link href={`https://twitter.com/${user.social_twitter}`} target="_blank" className="p-2 bg-gray-800 rounded-lg text-blue-400 hover:bg-gray-700 transition-colors">
                                            <Twitter className="w-5 h-5" />
                                        </Link>
                                    )}
                                    {user.social_instagram && (
                                        <Link href={`https://instagram.com/${user.social_instagram}`} target="_blank" className="p-2 bg-gray-800 rounded-lg text-pink-500 hover:bg-gray-700 transition-colors">
                                            <Instagram className="w-5 h-5" />
                                        </Link>
                                    )}
                                    {user.social_artstation && (
                                        <Link href={`https://artstation.com/${user.social_artstation}`} target="_blank" className="p-2 bg-gray-800 rounded-lg text-blue-300 hover:bg-gray-700 transition-colors">
                                            <LinkIcon className="w-5 h-5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Rght (Stats/Similar) - Optional */}
                    <div className="hidden lg:block space-y-6">
                        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
                            <h3 className="font-bold text-white mb-4">Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Rating</span>
                                    <span className="text-white font-bold flex items-center gap-1">
                                        ⭐ {user.rating.toFixed(1)} <span className="text-gray-500 font-normal">({user.review_count})</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Member since</span>
                                    <span className="text-white">{new Date(user.created_at).getFullYear()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
