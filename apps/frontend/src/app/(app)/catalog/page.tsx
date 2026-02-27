'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CatalogProductCard from '@/components/catalog/CatalogProductCard';
import CatalogFilters, { FilterState } from '@/components/catalog/CatalogFilters';
import { Skeleton } from '@/components/common/Loading';
import { useProducts } from '@/lib/hooks/useProducts';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useAuth } from '@/components/auth/AuthProvider';
import type { ModelFilters } from '@/lib/types';

// Sort options
const SORT_OPTIONS = [
    { id: 'newest', label: 'Newest' },
    { id: 'price_asc', label: 'Price ↑' },
    { id: 'price_desc', label: 'Price ↓' },
    { id: 'popular', label: 'Popular' },
] as const;

// Categories
const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'characters', label: 'Characters' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'nature', label: 'Nature' },
    { id: 'weapons', label: 'Weapons' },
];

export default function CatalogPage() {
    const router = useRouter();
    const { isAuthenticated, showLogin } = useAuth();
    const { isInWishlist, toggle: toggleWishlist } = useWishlist();
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<ModelFilters['sort']>('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterExpanded, setFilterExpanded] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        formats: [],
        price: 'all',
        types: [],
    });
    const [page, setPage] = useState(1);

    // Build API filters
    const apiFilters: ModelFilters = {
        category: activeCategory !== 'all' ? activeCategory : undefined,
        format: filters.formats.length > 0 ? filters.formats : undefined,
        sort: sortBy,
        page,
        limit: 20,
    };

    // Fetch products from API
    const { data, isLoading, error } = useProducts(apiFilters);

    const products = data?.data || [];
    const totalResults = data?.pagination?.total || 0;
    const hasMore = page < (data?.pagination?.totalPages || 1);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const handleSave = async (productId: string) => {
        if (!isAuthenticated) { showLogin?.(); return; }
        try {
            await toggleWishlist(productId);
        } catch (e) {
            console.error('Wishlist toggle failed:', e);
        }
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    const handleSortChange = (sortId: string) => {
        setSortBy(sortId as ModelFilters['sort']);
        setShowSortDropdown(false);
        setPage(1); // Reset to first page when sort changes
    };

    const handleProductClick = (productId: string) => {
        router.push(`/catalog/${productId}`);
    };

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [isLoading, hasMore, page]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.sort-dropdown')) setShowSortDropdown(false);
            if (!target.closest('.filter-area') && isFilterExpanded) setFilterExpanded(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isFilterExpanded]);

    // Reset page when category changes
    useEffect(() => {
        setPage(1);
    }, [activeCategory]);

    return (
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-4">
                {CATEGORIES.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${activeCategory === category.id
                            ? 'bg-white text-black'
                            : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] hover:text-white border border-gray-800'
                            }`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="relative flex items-center gap-3 mb-4 filter-area flex-wrap">
                <CatalogFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    isExpanded={isFilterExpanded}
                    onToggleExpand={() => setFilterExpanded(!isFilterExpanded)}
                />

                <div className="flex items-center gap-2 ml-auto shrink-0">
                    {/* Results Count */}
                    <span className="text-xs text-gray-500 hidden sm:block">
                        <span className="text-gray-300">{products.length}</span> of{' '}
                        <span className="text-gray-300">{totalResults.toLocaleString()}</span>
                    </span>

                    {/* Sort Dropdown */}
                    <div className="relative sort-dropdown">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSortDropdown(!showSortDropdown);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1a] text-gray-400 hover:text-white text-xs rounded-lg border border-gray-800 cursor-pointer"
                        >
                            {SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Sort'}
                            <ChevronDown className={`w-3 h-3 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showSortDropdown && (
                            <div className="absolute top-full right-0 mt-1 w-36 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl z-30 overflow-hidden">
                                {SORT_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSortChange(option.id)}
                                        className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${sortBy === option.id
                                            ? 'bg-yellow-400/10 text-yellow-400'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-[#1a1a1a] rounded-lg border border-gray-800">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'
                                }`}
                            title="Grid view"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'
                                }`}
                            title="List view"
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="text-center py-12 bg-red-900/20 rounded-xl border border-red-800">
                    <p className="text-red-400 mb-4">Failed to load products</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Product Grid/List */}
            {!error && (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-5'
                        : 'grid grid-cols-1 lg:grid-cols-2 gap-3'
                }>
                    {products.map((product) => (
                        <CatalogProductCard
                            key={product.id}
                            id={product.id}
                            title={product.title}
                            image={product.thumbnails?.[0] || ''}
                            isPremium={false}
                            isFree={product.price === 0}
                            discount={undefined}
                            author={product.artist.username}
                            isSaved={isInWishlist(product.id)}
                            onSave={() => handleSave(product.id)}
                            onClick={() => handleProductClick(product.id)}
                            price={product.price}
                            originalPrice={undefined}
                            formats={product.fileFormat}
                            rating={product.rating || 0}
                            reviewCount={product.reviewCount || 0}
                            polyCount={product.polyCount?.toString() || 'N/A'}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            )}

            {/* Loading Skeletons */}
            {isLoading && (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 mt-4'
                        : 'grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4'
                }>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                            key={`skeleton-${i}`}
                            className="w-full rounded-xl"
                            height={viewMode === 'grid' ? '200px' : '100px'}
                        />
                    ))}
                </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-16 flex items-center justify-center mt-6">
                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Loading...</span>
                    </div>
                )}
                {!hasMore && products.length > 0 && (
                    <p className="text-gray-600 text-xs">You've reached the end ✨</p>
                )}
            </div>

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
                <div className="text-center py-12 bg-gray-800/20 rounded-xl border border-gray-800">
                    <p className="text-gray-400">No products found. Try adjusting your filters.</p>
                </div>
            )}
        </div>
    );
}
