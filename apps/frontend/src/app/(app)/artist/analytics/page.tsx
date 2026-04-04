'use client';

import { BarChart3, ChevronLeft, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { analyticsKeys, analyticsService } from '@/lib/api/services/analytics.service';
import { formatPrice } from '@/lib/utils';

export default function ArtistAnalyticsPage() {
    const router = useRouter();
    const { data, isLoading, isError } = useQuery({
        queryKey: analyticsKeys.artistStats,
        queryFn: analyticsService.getArtistStats,
    });

    const monthlySales = Object.entries(data?.sales_by_month ?? {}).sort(([a], [b]) => a.localeCompare(b));
    const maxMonthly = Math.max(...monthlySales.map(([, value]) => value), 1);

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
                    <BarChart3 className="w-7 h-7 text-yellow-500" /> Artist Analytics
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
                    <p className="text-gray-400">You may not have access as an artist, or the server is unavailable.</p>
                </div>
            )}

            {!isLoading && !isError && data && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Total Sales</p>
                            <p className="text-2xl font-bold text-white">{data.total_sales}</p>
                        </div>
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Earnings</p>
                            <p className="text-2xl font-bold text-white">{formatPrice(data.total_earnings).idr}</p>
                        </div>
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Top Models</p>
                            <p className="text-2xl font-bold text-white">{data.top_models.length}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-4">Monthly Earnings</h2>
                            {monthlySales.length === 0 ? (
                                <p className="text-gray-500 text-sm">No sales in the last 12 months.</p>
                            ) : (
                                <div className="space-y-3">
                                    {monthlySales.map(([month, value]) => (
                                        <div key={month}>
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>{month}</span>
                                                <span>{formatPrice(value).idr}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-400" style={{ width: `${(value / maxMonthly) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                            <h2 className="text-lg font-semibold text-white mb-4">Top Models</h2>
                            {data.top_models.length === 0 ? (
                                <p className="text-gray-500 text-sm">No model sales yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.top_models.map((model) => (
                                        <div key={model.id} className="flex justify-between items-center text-sm">
                                            <span className="text-white truncate pr-2">{model.title}</span>
                                            <span className="text-yellow-400 font-semibold">{model.sales} sales</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                        <h2 className="text-lg font-semibold text-white mb-4">Recent Sales</h2>
                        {data.recent_sales.length === 0 ? (
                            <p className="text-gray-500 text-sm">No recent sales yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {data.recent_sales.map((sale) => (
                                    <div key={sale.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-b-0">
                                        <div>
                                            <p className="text-white text-sm font-medium">{sale.model.title}</p>
                                            <p className="text-gray-500 text-xs">by @{sale.user.username}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-yellow-400 text-sm font-semibold">{formatPrice(sale.price_paid).idr}</p>
                                            <p className="text-gray-500 text-xs">{new Date(sale.created_at).toLocaleDateString('id-ID')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
