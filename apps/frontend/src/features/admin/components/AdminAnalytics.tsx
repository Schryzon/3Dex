'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { 
    BarChart3, Users, Package, AlertCircle, 
    TrendingUp, Award, RefreshCw, ChevronRight,
    ArrowUpRight, ShoppingCart, Clock
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminAnalytics() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data: summary, isLoading, refetch } = useQuery({
        queryKey: ['admin-summary'],
        queryFn: () => adminService.getDashboardSummary()
    });

    const handleRefreshStats = async () => {
        setIsRefreshing(true);
        try {
            await adminService.triggerStatsAggregation();
            await refetch();
            toast.success('Platform statistics updated successfully');
        } catch (error) {
            toast.error('Failed to update statistics');
        } finally {
            setIsRefreshing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/10" />
                    ))}
                </div>
                <div className="h-96 bg-white/5 rounded-2xl border border-white/10" />
            </div>
        );
    }

    const { counts, recent, stats } = summary || { counts: { models: 0, users: 0, reports: 0 }, recent: { models: [], users: [], reports: [] }, stats: null };

    return (
        <div className="space-y-8 pb-20 text-white">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
                    <p className="text-gray-400 text-sm mt-1">Macro-level performance and growth metrics.</p>
                </div>
                <button
                    onClick={handleRefreshStats}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-800 text-black font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:cursor-not-allowed group"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    {isRefreshing ? 'Updating...' : 'Refresh Platform Stats'}
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Package size={80} />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <Package className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Models</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <h2 className="text-4xl font-black">{counts.models}</h2>
                        <Link href="/admin/models" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                            Review <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={80} />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center border border-yellow-400/20">
                            <Users className="w-6 h-6 text-yellow-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Applicants</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <h2 className="text-4xl font-black">{counts.users}</h2>
                        <Link href="/admin/users" className="text-xs text-yellow-400 hover:underline flex items-center gap-1">
                            Review <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertCircle size={80} />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Reports</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <h2 className="text-4xl font-black">{counts.reports}</h2>
                        <Link href="/admin/reports" className="text-xs text-red-400 hover:underline flex items-center gap-1">
                            Review <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Performance Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Models */}
                <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-400" /> Top Selling Models
                        </h3>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-white/5">
                            Last 7 Days
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#151515] text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Model</th>
                                    <th className="px-6 py-4 text-center">Sales</th>
                                    <th className="px-6 py-4 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats?.top_models?.length > 0 ? stats.top_models.map((model: any, index: number) => (
                                    <tr key={model.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-900 border border-white/10 overflow-hidden flex-shrink-0">
                                                    <img src={model.preview_url || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate group-hover:text-yellow-400 transition-colors">{model.title}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">@{model.artist?.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-mono">{model.sales}</td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-bold text-emerald-400 font-mono">Rp {(model.price * model.sales).toLocaleString('id-ID')}</p>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-600 italic">No sales data available for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Artists */}
                <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-400" /> Top Performing Artists
                        </h3>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-white/5">
                            By Volume
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#151515] text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Artist</th>
                                    <th className="px-6 py-4 text-center">Sales</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats?.top_artists?.length > 0 ? stats.top_artists.map((artist: any) => (
                                    <tr key={artist.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-900 border border-white/10 overflow-hidden flex-shrink-0">
                                                    <img src={artist.avatar_url || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate group-hover:text-blue-400 transition-colors">@{artist.username}</p>
                                                    <p className="text-[10px] text-gray-500 transition-colors">{artist.display_name || 'Creator'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-mono">{artist.sales}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/u/${artist.username}`} className="p-2 inline-block hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-600 italic">No creator activity detected recently.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Platform Overview */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-yellow-400" /> Platform Transaction Overview
                        </h3>
                        <p className="text-gray-400 text-sm max-w-lg">
                            Combined digital asset purchases and professional print service orders tracked across the 3Dēx network.
                        </p>
                    </div>
                    <div className="flex items-center gap-10">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Total Period Transactions</p>
                            <p className="text-3xl font-black text-white">{stats?.total_transactions || 0}</p>
                        </div>
                        <div className="w-px h-12 bg-white/10 hidden sm:block" />
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Status</p>
                            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Live
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/5">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <ShoppingCart className="w-4 h-4 text-gray-500 mb-2" />
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Sales Frequency</p>
                        <p className="text-lg font-bold">{(stats?.total_transactions / 7).toFixed(1)} <span className="text-xs text-gray-600 font-normal">/day</span></p>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <Clock className="w-4 h-4 text-gray-500 mb-2" />
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Avg Tick Rate</p>
                        <p className="text-lg font-bold">Stable</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
