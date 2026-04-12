'use client';

import { useAuth } from '@/features/auth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
    FileText, 
    Users, 
    ArrowRight, 
    ShieldCheck, 
    Clock, 
    AlertCircle, 
    TrendingUp, 
    Package, 
    ShoppingCart,
    ExternalLink,
    CheckCircle2,
    XCircle,
    UserCircle,
    Shield
} from 'lucide-react';
import Link from 'next/link';
import { adminService } from '@/lib/api/services/admin.service';
import { formatPrice } from '@/lib/utils';
import { getStorageUrl } from '@/lib/utils/storage';


interface DashboardSummary {
    counts: { models: number; users: number; reports: number };
    recent: { models: any; users: any; reports: any };
    stats: any;
}

export default function AdminDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user?.role !== 'ADMIN') {
            router.replace('/forbidden');
        }
    }, [user, isLoading, router]);

    const { data: summary, isLoading: isLoadingSummary } = useQuery<DashboardSummary>({
        queryKey: ['admin-dashboard-summary'],
        queryFn: () => adminService.getDashboardSummary() as Promise<DashboardSummary>,
        enabled: user?.role === 'ADMIN',
    });

    if (isLoading || user?.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const stats: any[] = [
        {
            label: 'Pending Models',
            value: summary?.counts?.models != null ? `${summary.counts.models}` : '—',
            icon: FileText,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
            href: '/admin/models',
            description: 'Models waiting for review'
        },
        {
            label: 'Pending Users',
            value: summary?.counts?.users != null ? `${summary.counts.users}` : '—',
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            href: '/admin/users',
            description: 'User applications to review'
        },
        {
            label: 'Content Reports',
            value: summary?.counts?.reports != null ? `${summary.counts.reports}` : '—',
            icon: AlertCircle,
            color: 'text-red-400',
            bg: 'bg-red-400/10',
            href: '/admin/reports',
            description: 'User-flagged content awaiting moderation'
        },
        {
            label: 'Audit Logs',
            value: '↗',
            icon: Shield,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            href: '/admin/audit-logs',
            description: 'View all admin action records'
        },
    ];

    const platformStats: any[] = [
        { label: 'Total Models', value: summary?.stats?.total_models != null ? `${summary.stats.total_models}` : '0', icon: Package, color: 'text-emerald-400' },
        { label: 'Total Users', value: summary?.stats?.total_users != null ? `${summary.stats.total_users}` : '0', icon: Users, color: 'text-indigo-400' },
        { label: 'Total Sales', value: summary?.stats?.total_sales != null ? `${summary.stats.total_sales}` : '0', icon: ShoppingCart, color: 'text-sky-400' },
    ];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-500/10 to-transparent p-8 rounded-2xl border border-red-500/20">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <p className="text-gray-400">Manage content and users for the 3Dex platform.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(stats as any).map((stat: any) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-[#141414] border border-gray-800 p-6 rounded-2xl hover:border-gray-600 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-white font-semibold">{stat.label}</p>
                        <p className="text-gray-500 text-sm mt-1">{stat.description}</p>
                    </Link>
                ))}
            </div>

            {/* Platform Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {(platformStats as any).map((stat: any) => (
                    <div key={stat.label} className="bg-[#141414] border border-gray-800/50 p-6 rounded-2xl flex items-center gap-4">
                        <div className={`p-4 bg-white/2 rounded-2xl ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Recent Management Needs */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Pending Models */}
                    <div className="bg-[#141414] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-yellow-400" />
                                <h3 className="font-black text-white">Recent Models</h3>
                            </div>
                            <Link href="/admin/models" className="text-xs font-bold text-gray-500 hover:text-yellow-400 transition-colors uppercase tracking-widest flex items-center gap-1">
                                View All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {summary?.recent?.models && summary.recent.models.length > 0 ? (
                                summary.recent.models.map((model: any) => (
                                    <div key={model.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
                                        <div className="w-12 h-12 rounded-xl bg-gray-800 overflow-hidden ring-1 ring-white/5">
                                            {model.preview_url ? (
                                                <img src={getStorageUrl(model.preview_url)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600"><FileText className="w-5 h-5" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold text-sm truncate">{model.title}</p>
                                            <p className="text-gray-500 text-xs">by {model.artist?.username}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-yellow-400 font-bold text-sm">{formatPrice(model.price).idr}</p>
                                            <p className="text-gray-600 text-[10px] uppercase font-black">{new Date(model.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500 text-sm font-medium">No pending models</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Reports */}
                    <div className="bg-[#141414] border border-gray-800 rounded-3xl overflow-hidden shadow-xl text-red-400">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <h3 className="font-black text-white">Recent Reports</h3>
                            </div>
                            <Link href="/admin/reports" className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1">
                                View All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {summary?.recent?.reports && summary.recent.reports.length > 0 ? (
                                summary.recent.reports.map((report: any) => (
                                    <div key={report.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded border border-red-500/20">{report.target_type}</span>
                                            <p className="text-gray-400 text-xs font-medium">reported by <span className="text-white font-bold">{report.reporter?.username}</span></p>
                                        </div>
                                        <p className="text-white text-sm font-bold line-clamp-1 italic">&quot;{report.reason}&quot;</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500 text-sm font-medium">No active reports</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: User Applications */}
                <div className="space-y-8">
                    <div className="bg-[#141414] border border-gray-800 rounded-3xl overflow-hidden shadow-xl border-blue-500/10">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-blue-500/5">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-400" />
                                <h3 className="font-black text-white text-sm">Applications</h3>
                            </div>
                            <Link href="/admin/users" className="text-[10px] font-black text-gray-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
                                Manage
                            </Link>
                        </div>
                        <div className="p-4 space-y-4">
                            {summary?.recent?.users && summary.recent.users.length > 0 ? (
                                summary.recent.users.map((u: any) => (
                                    <div key={u.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center"><UserCircle className="w-5 h-5 text-blue-400" /></div>
                                                <div>
                                                    <p className="text-white font-bold text-xs">{u.username}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black">{u.role}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] text-gray-600 font-black">{new Date(u.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {u.portfolio && Array.isArray(u.portfolio) && u.portfolio.length > 0 && (
                                            <div className="flex gap-1">
                                                {u.portfolio.slice(0, 3).map((item: any, idx: number) => (
                                                    <div key={idx} className="w-full aspect-square rounded-lg bg-black/40 overflow-hidden ring-1 ring-white/5">
                                                        {item.media_url ? <img src={getStorageUrl(item.media_url)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><FileText className="w-4 h-4" /></div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <Link href={`/admin/users`} className="w-full block py-2 bg-blue-400 hover:bg-blue-300 text-black text-[10px] font-black rounded-xl text-center transition-all uppercase">Review Application</Link>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-600 text-xs font-bold uppercase tracking-tighter">No Applications</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Summary Widget */}
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#141414] p-6 rounded-3xl shadow-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <TrendingUp className="w-6 h-6 text-yellow-400" />
                            <span className="px-2 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-lg text-[10px] font-bold text-yellow-400 uppercase tracking-widest">7 Day Stats</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <p className="text-gray-400 text-xs font-bold font-mono">GROSS VOLUME</p>
                                <p className="text-white text-xl font-black">Rp 12.4M</p>
                            </div>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-yellow-400 h-full w-[65%]" />
                            </div>
                            <p className="text-gray-600 text-[9px] font-bold line-clamp-1">Simulated data for visual guide. Actual sync pending live sales stream.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
