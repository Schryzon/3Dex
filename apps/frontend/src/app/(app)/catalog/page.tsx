'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import CatalogProductCard from '@/components/catalog/CatalogProductCard';
import { Skeleton } from '@/components/common/Loading';

// 🔴 BACKEND INTEGRATION: This will come from API
const generateMockProducts = (count: number, startId: number) =>
    Array.from({ length: count }, (_, i) => ({
        id: `product-${startId + i}`,
        title: ['Sci-Fi Robot', 'Fantasy Dragon', 'Modern Car', 'Medieval Castle', 'Space Station', 'Character Rig', 'Environment Kit', 'Weapon Pack'][i % 8] + ` ${startId + i}`,
        image: `https://picsum.photos/400/${300 + (i % 3) * 50}?random=${startId + i}`,
        isPremium: (startId + i) % 3 !== 0,
        isFree: (startId + i) % 3 === 0,
        discount: (startId + i) % 5 === 0 ? 20 : undefined,
        author: ['ArtStation3D', 'BlenderGuru', 'PolyHaven', 'CGTrader', 'TurboSquid'][i % 5],
    }));

// Categories for tabs
const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: '3d-models', label: '3D Models' },
    { id: 'textures', label: 'Textures' },
    { id: 'animations', label: 'Animations' },
    { id: 'tutorials', label: 'Tutorials' },
];

export default function CatalogPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [products, setProducts] = useState(generateMockProducts(20, 1));
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Toggle bookmark
    const handleBookmark = (productId: string) => {
        setBookmarked((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    };

    // Infinite scroll handler
    const loadMore = useCallback(() => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        // 🔴 BACKEND INTEGRATION: Replace with API call
        setTimeout(() => {
            const newProducts = generateMockProducts(20, products.length + 1);
            setProducts((prev) => [...prev, ...newProducts]);
            setIsLoading(false);

            // Stop after 100 products for demo
            if (products.length >= 80) {
                setHasMore(false);
            }
        }, 800);
    }, [isLoading, hasMore, products.length]);

    // Setup intersection observer for infinite scroll
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMore]);

    return (
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-6">
            {/* Header Row: Filters Left, Sort Right */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                {/* Category Tabs - Left */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${activeCategory === category.id
                                ? 'bg-white text-black'
                                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] hover:text-white border border-gray-800'
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Sort Dropdown - Right */}
                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm shrink-0 cursor-pointer">
                    Relevance
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Pinterest-style Masonry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <CatalogProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        image={product.image}
                        isPremium={product.isPremium}
                        isFree={product.isFree}
                        discount={product.discount}
                        author={product.author}
                        isBookmarked={bookmarked.has(product.id)}
                        onBookmark={() => handleBookmark(product.id)}
                    />
                ))}
            </div>

            {/* Loading Skeletons */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="break-inside-avoid mb-4">
                            <Skeleton
                                className="w-full rounded-xl"
                                height={`${200 + (i % 3) * 80}px`}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-8">
                {isLoading && (
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading more...</span>
                    </div>
                )}
                {!hasMore && (
                    <p className="text-gray-600 text-sm">You've reached the end ✨</p>
                )}
            </div>
        </div>
    );
}
