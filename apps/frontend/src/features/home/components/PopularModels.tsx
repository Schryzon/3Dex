'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { formatPrice } from '@/lib/utils';
import { useInView } from '@/lib/hooks/useInView';
import { CatalogProductCard } from '@/features/catalog/components/product-card';



function ModelCardSkeleton() {
    return (
        <div className="flex-shrink-0 w-[240px] md:w-[280px] bg-[#111] rounded-xl border border-white/[0.05] overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-white/5" />
            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <div className="h-5 bg-white/5 rounded-lg w-3/4" />
                    <div className="h-3 bg-white/5 rounded-lg w-1/2" />
                </div>
            </div>
        </div>
    );
}

export default function PopularModels() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const { ref: headerRef, inView: headerVisible } = useInView({ threshold: 0.2 });

    const { data, isLoading } = useProducts({
        sort: 'rating',
        limit: 12,
    });

    const models = data?.data || [];

    // Auto-scroll functionality
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || models.length === 0) return;

        let scrollInterval: NodeJS.Timeout;

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                if (!isPaused && container) {
                    const maxScroll = container.scrollWidth - container.clientWidth;
                    const currentScroll = container.scrollLeft;

                    if (currentScroll >= maxScroll - 10) {
                        container.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        container.scrollBy({ left: 320, behavior: 'smooth' });
                    }
                }
            }, 3000);
        };

        startAutoScroll();
        return () => clearInterval(scrollInterval);
    }, [isPaused, models.length]);

    return (
        <section className="relative py-14 md:py-20 bg-[#070707] overflow-hidden">
            {/* Fine line grid for depth */}
            <div className="absolute inset-0 bg-line-grid pointer-events-none" />
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                {/* Header */}
                <div
                    ref={headerRef}
                    style={{
                        opacity: headerVisible ? 1 : 0,
                        transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'opacity 0.7s ease, transform 0.7s ease',
                    }}
                    className="mb-12"
                >
                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-yellow-400 mb-3">Community picks</p>
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                            Trending <span className="text-yellow-400">right now.</span>
                        </h2>
                        <Link
                            href="/catalog?sort=rating"
                            className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-400 transition-colors group shrink-0"
                        >
                            View all
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Scrollable Cards */}
                <div
                    ref={scrollContainerRef}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 scroll-smooth"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {/* Loading skeletons */}
                    {isLoading && Array.from({ length: 6 }).map((_, i) => (
                        <ModelCardSkeleton key={i} />
                    ))}

                    {/* Empty state */}
                    {!isLoading && models.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                            <ShoppingCart className="w-12 h-12 text-gray-700 mb-4" />
                            <p className="text-gray-500 text-lg font-medium">No models yet</p>
                            <p className="text-gray-600 text-sm mt-1">Be the first to upload and get rated!</p>
                        </div>
                    )}

                    {/* Model cards */}
                    {!isLoading && models.map((model: any) => (
                        <div key={model.id} className="flex-shrink-0 w-[240px] md:w-[280px]">
                            <CatalogProductCard
                                id={model.id}
                                title={model.title}
                                image={model.thumbnails?.[0] || '/placeholder-model.jpg'}
                                author={model.artist?.username || 'Unknown'}
                                authorAvatar={model.artist?.avatar_url}
                                price={model.price}
                                isFree={model.price === 0}
                                rating={model.rating}
                                reviewCount={model.reviewCount}
                                formats={model.specifications?.formats || []}
                            />
                        </div>
                    ))}
                </div>

                {/* View All - Mobile */}
                <div className="md:hidden mt-8 text-center">
                    <Link
                        href="/catalog?sort=rating"
                        className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
                    >
                        View All Models
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
