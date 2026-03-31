'use client';

import {
    BarChart3, ChevronLeft, DollarSign, Package, TrendingUp,
    CheckCircle, Clock, XCircle, Star, Printer
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { analyticsKeys, analyticsService } from '@/lib/api/services/analytics.service';
import { formatPrice } from '@/lib/utils';

export default function ProviderAnalyticsPage() {
    const router = useRouter();
    const { data, isLoading, isError } = useQuery({
        queryKey: analyticsKeys.providerStats,
        queryFn: analyticsService.getProviderStats,
    });

    const monthlyEarnings = Object.entries(data?.earnings_by_month ?? {}).sort(([a], [b]) => a.localeCompare(b));
    const maxMonthly = Math.max(...monthlyEarnings.map(([, value]) => value), 1);

    const statusColor: Record<string, string> = {
        PENDING: 'text-yellow-400 bg-yellow-400/10',
        ACCEPTED: 'text-blue-400 bg-blue-400/10',
        PROCESSING: 'text-purple-400 bg-purple-400/10',
        SHIPPED: 'text-cyan-400 bg-cyan-400/10',
        DELIVERED: 'text-emerald-400 bg-emerald-400/10',
        CANCELLED: 'text-red-400 bg-red-400/10',
        PAID: 'text-emerald-400 bg-emerald-400/10',
        FAILED: 'text-red-400 bg-red-400/10',
    };

    return (
        <div className="p-6 md:p-10 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-gray-400 hover:text-yellow-400 transition-all group"
                    title="Back"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Printer className="w-7 h-7 text-yellow-500" /> Provider Analytics
                </h1>
            </div>

            {isLoading && (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center min-h-[240px] flex items-center justify-center">
                    <p className="text-gray-400">Loading analytics...</p>
                </div>
            )}

            {!isLoading && isError && (
                <div className="bg-[#111] border border-red-500/30 rounded-2xl p-8 text-center min-h-[240px] flex flex-col items-center justify-center gap-2">
                    <h2 className="text-xl font-bold text-white">Unable to load analytics</h2>
                    <p className="text-gray-400">You may not have access as a provider, or the server is unavailable.</p>
                </div>
            )}

            {!isLoading && !isError && data && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><Package className="w-4 h-4" /> Total Jobs</p>
                            <p className="text-2xl font-bold text-white">{data.total_jobs}</p>
                        </div>
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Earnings</p>
                            <p className="text-2xl font-bold text-white">{formatPrice(data.total_earnings).idr}</p>
                        </div>
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Completion Rate</p>
                            <p className="text-2xl font-bold text-white">{data.completion_rate}%</p>
                        </div>
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><Star className="w-4 h-4" /> Rating</p>
                            <p className="text-2xl font-bold text-white">
                                {data.rating > 0 ? `${data.rating.toFixed(1)} ★` : '—'}
                                {data.review_count > 0 && (
                                    <span className="text-sm text-gray-500 font-normal ml-2">({data.review_count} reviews)</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Job Status Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Completed</p>
                                <p className="text-xl font-bold text-white">{data.completed_jobs}</p>
                            </div>
                        </div>
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pending</p>
                                <p className="text-xl font-bold text-white">{data.pending_jobs}</p>
                            </div>
                        </div>
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Failed</p>
                                <p className="text-xl font-bold text-white">{data.failed_jobs}</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Monthly Earnings */}
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-yellow-400" /> Monthly Earnings
                            </h2>
                            {monthlyEarnings.length === 0 ? (
                                <p className="text-gray-500 text-sm">No earnings in the last 12 months.</p>
                            ) : (
                                <div className="space-y-3">
                                    {monthlyEarnings.map(([month, value]) => (
                                        <div key={month}>
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>{month}</span>
                                                <span>{formatPrice(value).idr}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${(value / maxMonthly) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
                            {data.recent_orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Package className="w-10 h-10 text-gray-700 mb-3" />
                                    <p className="text-gray-500 text-sm">No print orders yet.</p>
                                    <p className="text-gray-600 text-xs mt-1">Orders from customers will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.recent_orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-b-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {order.items?.[0]?.model?.title || 'Print Job'}
                                                    {order.items.length > 1 && (
                                                        <span className="text-gray-500 text-xs ml-1">+{order.items.length - 1} more</span>
                                                    )}
                                                </p>
                                                <p className="text-gray-500 text-xs">by @{order.user.username}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-3">
                                                <p className="text-yellow-400 text-sm font-semibold">{formatPrice(order.total_amount).idr}</p>
                                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColor[order.status] || 'text-gray-400 bg-gray-400/10'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
