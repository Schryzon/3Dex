'use client';

import { 
    BarChart3, ChevronLeft, DollarSign, ShoppingCart, 
    TrendingUp, Users, ArrowUpRight, ArrowDownRight,
    Star, Package, Calendar, MoreHorizontal,
    LayoutDashboard, Info, Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { analyticsKeys, analyticsService } from '@/lib/api/services/analytics.service';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ArtistAnalyticsPage() {
    const router = useRouter();
    const { data, isLoading, isError } = useQuery({
        queryKey: analyticsKeys.artistStats,
        queryFn: analyticsService.getArtistStats,
    });

    const monthlySales = data?.sales_by_month ?? [];
    const maxMonthly = Math.max(...monthlySales.map(m => m.earnings), 1);

    // Simple Sparkline/Area Chart Generator
    const generatePath = (data: { earnings: number }[], width: number, height: number) => {
        if (data.length < 2) return "";
        const points = data.map((d, i) => ({
            x: (i / (data.length - 1)) * width,
            y: height - (d.earnings / maxMonthly) * height || height // Handle 0
        }));

        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x},${points[i].y}`;
        }
        return path;
    };

    const generateAreaPath = (data: { earnings: number }[], width: number, height: number) => {
        const linePath = generatePath(data, width, height);
        if (!linePath) return "";
        return `${linePath} L ${width},${height} L 0,${height} Z`;
    };

    return (
        <div className="min-h-screen bg-[#070707] text-white py-12 px-4 md:px-8">
            <div className="max-w-[1400px] mx-auto space-y-10">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => router.back()}
                            className="w-12 h-12 flex items-center justify-center bg-[#111] hover:bg-yellow-400 hover:text-black rounded-2xl border border-white/5 transition-all group"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                                <BarChart3 className="w-8 h-8 text-yellow-400" /> Professional <span className="text-yellow-400">Analytics</span>
                            </h1>
                            <p className="text-gray-500 text-sm font-medium mt-1">Real-time performance metrics for your creative business.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-1.5 bg-[#111] rounded-2xl border border-white/5">
                        <button className="px-6 py-2.5 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-yellow-400/10">Last 12 Months</button>
                        <button className="px-6 py-2.5 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors">Lifetime</button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-40 bg-[#111] animate-pulse rounded-[2.5rem] border border-white/5" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="bg-[#111] border-2 border-dashed border-red-500/20 rounded-[3rem] p-20 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Platform Connection Error</h2>
                        <p className="text-gray-500 max-w-sm mx-auto text-sm">We couldn't synchronize your business data. Please ensure you have artist permissions active.</p>
                    </div>
                ) : (
                    <>
                        {/* Main Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { 
                                    label: 'Total Revenue', 
                                    value: formatPrice(data.total_earnings).idr, 
                                    icon: DollarSign, 
                                    color: 'text-emerald-400', 
                                    bg: 'bg-emerald-400/5',
                                    growth: data.earnings_growth,
                                    trend: data.earnings_growth >= 0 ? 'up' : 'down'
                                },
                                { 
                                    label: 'Asset Sales', 
                                    value: data.total_sales, 
                                    icon: ShoppingCart, 
                                    color: 'text-yellow-400', 
                                    bg: 'bg-yellow-400/5' 
                                },
                                { 
                                    label: 'Success Rate', 
                                    value: '98.4%', 
                                    icon: TrendingUp, 
                                    color: 'text-blue-400', 
                                    bg: 'bg-blue-400/5' 
                                },
                                { 
                                    label: 'Unique Buyers', 
                                    value: data.total_customers, 
                                    icon: Users, 
                                    color: 'text-purple-400', 
                                    bg: 'bg-purple-400/5' 
                                }
                            ].map((stat, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={stat.label} 
                                    className="bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-white/10 transition-colors shadow-2xl"
                                >
                                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-white/5`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        {stat.growth !== undefined && (
                                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {Math.abs(stat.growth)}%
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                                    <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Chart & Top Models Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Earnings Trend Chart */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="lg:col-span-8 bg-[#0c0c0c] border border-white/5 rounded-[3rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tight italic">Earnings <span className="text-yellow-400">Trend</span></h2>
                                        <p className="text-xs text-gray-600 font-medium mt-1">Revenue distribution over the last 12 months</p>
                                    </div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                                </div>

                                <div className="h-[300px] w-full relative group">
                                    <svg className="w-full h-full" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#facd15" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#facd15" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path 
                                            d={generateAreaPath(monthlySales, 1000, 300)} 
                                            fill="url(#chartGradient)"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                        <path 
                                            d={generatePath(monthlySales, 1000, 300)} 
                                            fill="none" 
                                            stroke="#facd15" 
                                            strokeWidth="4" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            className="transition-all duration-1000 ease-out"
                                        />
                                        
                                        {/* Grid Lines */}
                                        {[0, 0.25, 0.5, 0.75, 1].map(tick => (
                                            <line 
                                                key={tick} 
                                                x1="0" y1={tick * 300} x2="1000" y2={tick * 300} 
                                                stroke="white" strokeOpacity="0.03" strokeWidth="1" 
                                            />
                                        ))}

                                        {/* X-Axis Labels */}
                                        {monthlySales.map((m: any, i: number) => (
                                            <g key={m.month}>
                                                {i % 2 === 0 && (
                                                    <text 
                                                        x={(i / (monthlySales.length - 1)) * 1000} 
                                                        y="320" 
                                                        textAnchor="middle" 
                                                        fill="#444" 
                                                        fontSize="10" 
                                                        fontWeight="900"
                                                        className="uppercase tracking-widest"
                                                    >
                                                        {m.month.split('-')[1]}
                                                    </text>
                                                )}
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                            </motion.div>

                            {/* Top Models Feed */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-4 bg-[#0c0c0c] border border-white/5 rounded-[3rem] p-8 shadow-2xl flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black uppercase tracking-tight italic">Top <span className="text-yellow-400">Performers</span></h2>
                                    <div className="p-2 bg-white/5 rounded-xl">
                                        <Award className="w-4 h-4 text-gray-500" />
                                    </div>
                                </div>

                                <div className="space-y-5 flex-1">
                                    {data.top_models.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-30">
                                            <Package className="w-10 h-10 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Sales Data</p>
                                        </div>
                                    ) : (
                                        data.top_models.map((model, i) => (
                                            <div key={model.id} className="group relative">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-[#111] rounded-2xl flex items-center justify-center font-black text-gray-700 border border-white/5 group-hover:border-yellow-400 group-hover:text-yellow-400 transition-all">
                                                        {i + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-bold text-sm truncate uppercase tracking-tight italic">{model.title}</h4>
                                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{model.sales} Units Sold</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-yellow-400">{formatPrice(model.revenue).idr}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <button className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest transition-all">
                                    Full Asset Report
                                </button>
                            </motion.div>
                        </div>

                        {/* Recent Activity Table */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0c0c0c] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <h2 className="text-xl font-black uppercase tracking-tight italic">Live <span className="text-yellow-400">Sales Feed</span></h2>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Real-time Activity</span>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#111]/50 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">
                                        <tr>
                                            <th className="px-8 py-5">Transaction ID</th>
                                            <th className="px-8 py-5">Asset</th>
                                            <th className="px-8 py-5">Customer</th>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-medium">
                                        {data.recent_sales.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-16 text-center text-gray-600 uppercase tracking-widest font-black text-xs italic opacity-30">
                                                    Establishing Marketplace Presence...
                                                </td>
                                            </tr>
                                        ) : (
                                            data.recent_sales.map((sale) => (
                                                <tr key={sale.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-8 py-5 text-gray-600 font-mono text-[10px]">#{sale.id.slice(0, 8).toUpperCase()}</td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-sm font-bold uppercase tracking-tight italic text-white group-hover:text-yellow-400 transition-colors">
                                                            {sale.model.title}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-black uppercase">
                                                                {sale.user.username[0]}
                                                            </div>
                                                            <span className="text-xs text-gray-400">@{sale.user.username}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-xs text-gray-600">
                                                        {new Date(sale.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className="text-sm font-black text-emerald-400">+{formatPrice(sale.price_paid).idr}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
