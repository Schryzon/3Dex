'use client';

import Link from 'next/link';
import { Box, Palette, Printer, ArrowRight } from 'lucide-react';
import { useInView } from '@/lib/hooks/useInView';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export default function FeaturedCategories() {
    const { ref, inView } = useInView({ threshold: 0.1 });

    const { data: stats } = useQuery({
        queryKey: ['public-stats'],
        queryFn: async () => {
            const res = await apiClient.get('/analytics/public');
            return res as any; // apiClient.get returns data directly
        }
    });

    return (
        <section className="relative py-14 md:py-20 bg-[#060606] overflow-hidden">

            {/* Dot grid texture */}
            <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10">

                {/* Header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-yellow-400/70 mb-3">Browse by category</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1]">
                            Everything you need<br />
                            <em className="not-italic text-yellow-400">in one place.</em>
                        </h2>
                    </div>
                    <Link href="/catalog" className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors group">
                        Browse all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Asymmetric mosaic grid */}
                <div ref={ref} className="grid grid-cols-1 md:grid-cols-5 gap-4 auto-rows-[280px]">

                    {/* 3D Models — spans 3 cols, tall */}
                    <Link
                        href="/catalog"
                        style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.6s ease 0s, transform 0.6s ease 0s' }}
                        className="group md:col-span-3 md:row-span-1 relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-yellow-400/25 transition-all duration-500"
                    >
                        <img src="/category-3d-models.jpg" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-blue-400/20">
                                    <Box className="w-4 h-4 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white">3D Models</h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-3 max-w-xs">Game-ready, animation rigs, props & architectural models</p>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 group-hover:gap-3 transition-all duration-300">{stats ? `${stats.models}+` : '...'} assets <ArrowRight className="w-3.5 h-3.5" /></span>
                        </div>
                    </Link>

                    {/* Textures — spans 2 cols */}
                    <Link
                        href="/textures"
                        style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s' }}
                        className="group md:col-span-2 relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-yellow-400/25 transition-all duration-500"
                    >
                        <img src="/category-textures.jpg" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 rounded-lg bg-orange-500/20 backdrop-blur-sm flex items-center justify-center border border-orange-400/20">
                                    <Palette className="w-3.5 h-3.5 text-orange-400" />
                                </div>
                                <h3 className="text-xl font-black text-white">Textures</h3>
                            </div>
                            <p className="text-gray-400 text-xs mb-2">PBR materials & surface details</p>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400">{stats ? `${stats.models}+` : '...'} <ArrowRight className="w-3 h-3" /></span>
                        </div>
                    </Link>

                    {/* 3D Printing — full width bottom strip */}
                    <Link
                        href="/print-services"
                        style={{ height: '160px', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s' }}
                        className="group md:col-span-5 relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-violet-400/25 transition-all duration-500"
                    >
                        <img src="/category-3d-print.jpg" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: 'center 40%' }} />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                        <div className="absolute inset-0 flex items-center px-8 gap-6">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 backdrop-blur-sm flex items-center justify-center border border-violet-400/20 shrink-0">
                                <Printer className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white mb-0.5">3D Printing Services</h3>
                                <p className="text-gray-400 text-sm">Print-on-demand via {stats ? stats.providers : '...'} verified local providers</p>
                            </div>
                            <span className="ml-auto hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-violet-400/30 text-violet-300 text-sm font-semibold rounded-xl group-hover:bg-violet-400/10 transition-colors">
                                Find a provider <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>

                </div>

                {/* Mobile view all */}
                <div className="mt-8 md:hidden text-center">
                    <Link href="/catalog" className="inline-flex items-center gap-2 text-sm text-yellow-400 font-semibold">All categories <ArrowRight className="w-4 h-4" /></Link>
                </div>

            </div>
        </section>
    );
}
