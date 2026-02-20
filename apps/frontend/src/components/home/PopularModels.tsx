'use client';

import Link from 'next/link';
import { Star, ArrowRight, ShoppingCart } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useProducts } from '@/lib/hooks/useProducts';
import { formatPrice } from '@/lib/utils';
import { useInView } from '@/lib/hooks/useInView';

function StarRating({ rating }: { rating: number }) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div className="flex items-center gap-0.5">
            {stars.map((star) => (
                <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= Math.round(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                        }`}
                />
            ))}
        </div>
    );
}

function ModelCardSkeleton() {
    return (
        <div className="flex-shrink-0 w-[280px] md:w-[300px] bg-gray-900 rounded-xl border border-gray-800 overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-gray-800" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-800 rounded w-1/3" />
                    <div className="h-8 bg-gray-800 rounded w-1/4" />
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
        <section className="py-16 md:py-24 bg-black">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                {/* Header */}
                <div
                    ref={headerRef}
                    style={{
                        opacity: headerVisible ? 1 : 0,
                        transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'opacity 0.7s ease, transform 0.7s ease',
                    }}
                    className="flex items-center justify-between mb-12"
                >
                    <div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            Popular <span className="text-yellow-400">Models</span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Trending assets loved by our community
                        </p>
                    </div>
                    <Link
                        href="/catalog?sort=rating"
                        className="hidden md:flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors group"
                    >
                        View All
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
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
                    {!isLoading && models.map((model) => (
                        <Link
                            key={model.id}
                            href={`/product/${model.id}`}
                            className="group flex-shrink-0 w-[280px] md:w-[300px] bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-yellow-400/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-400/10"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-[4/3] bg-gray-800 overflow-hidden">
                                {model.thumbnails?.[0] ? (
                                    <img
                                        src={model.thumbnails[0]}
                                        alt={model.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShoppingCart className="w-10 h-10 text-gray-600" />
                                    </div>
                                )}

                                {/* Category badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/10">
                                        {model.category}
                                    </span>
                                </div>

                                {/* Rating badge */}
                                {(model.rating ?? 0) > 0 && (
                                    <div className="absolute top-3 right-3">
                                        <span className="px-2.5 py-1 bg-yellow-400/90 backdrop-blur-sm text-black text-xs font-bold rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-black" />
                                            {(model.rating ?? 0).toFixed(1)}
                                        </span>
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-white font-semibold text-base mb-2 group-hover:text-yellow-400 transition-colors line-clamp-1">
                                    {model.title}
                                </h3>

                                {/* Stars + Review count */}
                                <div className="flex items-center gap-2 mb-3">
                                    <StarRating rating={model.rating ?? 0} />
                                    <span className="text-gray-500 text-xs">
                                        {(model.reviewCount ?? 0) > 0
                                            ? `(${model.reviewCount})`
                                            : 'No reviews yet'}
                                    </span>
                                </div>

                                {/* Artist */}
                                <p className="text-gray-500 text-xs mb-3">
                                    by{' '}
                                    <span className="text-gray-400 hover:text-yellow-400 transition-colors">
                                        {model.artist?.username || 'Unknown'}
                                    </span>
                                </p>

                                {/* Price */}
                                <div className="flex items-center justify-between">
                                    <span className="text-yellow-400 font-bold text-lg">
                                        {formatPrice(model.price).idr}
                                    </span>
                                    <span className="text-xs text-gray-600 border border-gray-700 px-2 py-1 rounded-lg">
                                        View
                                    </span>
                                </div>
                            </div>
                        </Link>
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
