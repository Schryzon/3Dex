'use client';

import { useAuth } from '@/features/auth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Package, Download, Heart, ArrowRight, LayoutDashboard, Clock, Star, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuth();
    const isCreator = user?.role === 'ARTIST' || user?.role === 'PROVIDER';

    const { data: engagementStats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/posts/stats');
            return res.data;
        },
        enabled: isCreator
    });

    const stats = [
        { label: 'Total Downloads', value: '0', icon: Download, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Active Orders', value: '0', icon: Package, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Saved Models', value: '0', icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
    ];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-yellow-400/10 to-transparent p-8 rounded-2xl border border-yellow-400/20">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.username}! 👋</h1>
                    <p className="text-gray-400">Manage your 3D assets, downloads, and orders from your dashboard.</p>
                </div>
                <Link
                    href="/catalog"
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/10"
                >
                    Explore Catalog <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Creator Engagement Stats */}
            {isCreator && engagementStats && (
                <div className="bg-[#141414] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none" />

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Users className="w-5 h-5 text-purple-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Community Engagement</h2>
                        </div>
                        <Link href="/community" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                            Go to Feed <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Month Stats */}
                        <div className="bg-black/20 rounded-xl p-4 border border-gray-800/50">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Past 30 Days</p>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-red-400" />
                                    <span className="text-xl font-bold text-white">{engagementStats.month.likes}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                    <span className="text-xl font-bold text-white">{engagementStats.month.comments}</span>
                                </div>
                            </div>
                        </div>

                        {/* Year Stats */}
                        <div className="bg-black/20 rounded-xl p-4 border border-gray-800/50">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Past Year</p>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-gray-400" />
                                    <span className="text-xl font-bold text-white">{engagementStats.year.likes}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    <span className="text-xl font-bold text-white">{engagementStats.year.comments}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-[#141414] border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-gray-500 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <h3 className="font-bold text-white">Recent Activity</h3>
                        </div>
                        <button className="text-sm text-gray-500 hover:text-white transition-colors">View All</button>
                    </div>
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                            <LayoutDashboard className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-400 mb-2 font-medium">No recent activity</p>
                        <p className="text-gray-500 text-sm">Start exploring the catalog to find amazing 3D models.</p>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <h3 className="font-bold text-white">Recommended for You</h3>
                        </div>
                    </div>
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                            <Sparkles className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-400 mb-2 font-medium">Personalizing recommendations...</p>
                        <p className="text-gray-500 text-sm">We'll show you models you'll love based on your interests.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
