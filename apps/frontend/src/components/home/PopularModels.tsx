'use client';

import Link from 'next/link';
import { Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

// Mock data - replace with actual popular models from API
const popularModels: any[] = [];


export default function PopularModels() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-scroll functionality
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || popularModels.length === 0) return;

        let scrollInterval: NodeJS.Timeout;

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                if (!isPaused && container) {
                    const maxScroll = container.scrollWidth - container.clientWidth;
                    const currentScroll = container.scrollLeft;

                    if (currentScroll >= maxScroll - 10) {
                        // Reset to start for infinite loop
                        container.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        // Scroll by one card width + gap (320px + 24px = 344px)
                        container.scrollBy({ left: 344, behavior: 'smooth' });
                    }
                }
            }, 3000); // Every 3 seconds
        };

        startAutoScroll();

        return () => {
            clearInterval(scrollInterval);
        };
    }, [isPaused]);

    return (
        <section className="py-16 md:py-24 bg-black">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            Popular <span className="text-yellow-400">Models</span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Trending assets loved by our community
                        </p>
                    </div>
                    <Link
                        href="/catalog"
                        className="hidden md:flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors group"
                    >
                        View All
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Scrollable Cards with Auto-Scroll */}
                <div
                    ref={scrollContainerRef}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 scroll-smooth"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {popularModels.map((model) => (
                        <div
                            key={model.id}
                            className="group flex-shrink-0 w-[280px] md:w-[320px] bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-yellow-400/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-400/10"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] bg-gray-700 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    <ShoppingCart className="w-16 h-16" />
                                </div>
                                {/* Category Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                                        {model.category}
                                    </span>
                                </div>
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-yellow-400 transition-colors line-clamp-1">
                                    {model.title}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-white font-medium text-sm">{model.rating}</span>
                                    </div>
                                    <span className="text-gray-400 text-sm">({model.reviews} reviews)</span>
                                </div>

                                {/* Price & Button */}
                                <div className="flex items-center justify-between">
                                    <span className="text-yellow-400 font-bold text-xl">
                                        ${model.price}
                                    </span>
                                    <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-colors text-sm">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Auto-Scroll Indicator */}
                {popularModels.length > 0 && (
                    <div className="mt-4 text-center">
                        <p className="text-gray-500 text-xs">
                            {isPaused ? '⏸ Paused' : '▶ Auto-scrolling'} • Hover to pause
                        </p>
                    </div>
                )}

                {/* View All Button - Mobile */}
                <div className="md:hidden mt-8 text-center">
                    <Link
                        href="/catalog"
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
