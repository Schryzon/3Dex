'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, LayoutGrid, List, X } from 'lucide-react';
import CatalogProductCard from '@/components/catalog/CatalogProductCard';
import CatalogFilters, { FilterState } from '@/components/catalog/CatalogFilters';
import ProductDetailsModal from '@/components/catalog/ProductDetailsModal';
import { Skeleton } from '@/components/common/Loading';

// Sort options
const SORT_OPTIONS = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'newest', label: 'Newest' },
    { id: 'price-low', label: 'Price ↑' },
    { id: 'price-high', label: 'Price ↓' },
    { id: 'popular', label: 'Popular' },
    { id: 'rating', label: 'Top Rated' },
];

// Categories for 3Dex (3D Assets + Printing Services)
const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: '3d-models', label: '3D Models' },
    { id: 'printable', label: 'Print Ready' },
    { id: 'textures', label: 'Textures & Materials' },
    { id: 'print-services', label: 'Print Services' },
];

// Mock data
const AVAILABLE_FORMATS = ['blend', 'fbx', 'obj', 'max'];

const generateMockProducts = (count: number, startId: number) =>
    Array.from({ length: count }, (_, i) => {
        const isFreeItem = (startId + i) % 4 === 0;
        const basePrice = 15 + ((startId + i) % 50);
        const hasDiscount = (startId + i) % 5 === 0;

        return {
            id: `product-${startId + i}`,
            title: ['Sci-Fi Robot', 'Fantasy Dragon', 'Modern Car', 'Medieval Castle', 'Space Station', 'Character Rig', 'Environment Kit', 'Weapon Pack'][i % 8] + ` ${startId + i}`,
            image: `https://picsum.photos/400/${300 + (i % 3) * 50}?random=${startId + i}`,
            images: (startId + i === 1) ? [
                'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
                `https://picsum.photos/800/600?random=${startId + i + 100}`,
                `https://picsum.photos/800/600?random=${startId + i + 200}`,
            ] : [
                `https://picsum.photos/800/600?random=${startId + i}`,
                `https://picsum.photos/800/600?random=${startId + i + 100}`,
                `https://picsum.photos/800/600?random=${startId + i + 200}`,
            ],
            isPremium: !isFreeItem && (startId + i) % 3 === 0,
            isFree: isFreeItem,
            discount: hasDiscount ? 20 : undefined,
            author: ['ArtStation3D', 'BlenderGuru', 'PolyHaven', 'CGTrader', 'TurboSquid'][i % 5],
            price: isFreeItem ? 0 : hasDiscount ? basePrice * 0.8 : basePrice,
            originalPrice: hasDiscount ? basePrice : undefined,
            formats: AVAILABLE_FORMATS.slice(0, 1 + (i % 4)),
            rating: 3.5 + ((i % 15) / 10),
            reviewCount: 10 + ((startId + i) % 200),
            polyCount: ['12.5K', '45K', '125K', '8K', '250K'][i % 5],
            hasTextures: (startId + i) % 2 === 0,
            isRigged: (startId + i) % 3 === 0,
            isAnimated: (startId + i) % 5 === 0,
            description: 'High-quality 3D model perfect for games, animations, and architectural visualization. Fully optimized with clean topology and UV mapping.',
            tags: ['3D', 'game-ready', 'pbr', 'low-poly'][i % 4].split(' '),
        };
    });

export default function CatalogPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [products, setProducts] = useState(generateMockProducts(20, 1));
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [saved, setSaved] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState('relevance');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterExpanded, setFilterExpanded] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        formats: [],
        price: 'all',
        types: [],
    });
    const [totalResults] = useState(1234);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const handleSave = (productId: string) => {
        setSaved((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    const handleSortChange = (sortId: string) => {
        setSortBy(sortId);
        setShowSortDropdown(false);
    };

    const handleProductClick = (product: any) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Delay clearing selected product for smoother animation if needed
        setTimeout(() => setSelectedProduct(null), 300);
    };

    const loadMore = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        setTimeout(() => {
            const newProducts = generateMockProducts(20, products.length + 1);
            setProducts((prev) => [...prev, ...newProducts]);
            setIsLoading(false);
            if (products.length >= 80) setHasMore(false);
        }, 800);
    }, [isLoading, hasMore, products.length]);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { threshold: 0.1 }
        );
        if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
        return () => observerRef.current?.disconnect();
    }, [loadMore]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.sort-dropdown')) setShowSortDropdown(false);
            if (!target.closest('.filter-area') && isFilterExpanded) setFilterExpanded(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isFilterExpanded]);

    return (
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-4">
            {/* Category Tabs - Row 1 */}
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

            {/* Unified Toolbar - Row 2: Filters + Sort + Results + View Toggle */}
            <div className="relative flex items-center gap-3 mb-4 filter-area flex-wrap">
                {/* Filter Component (inline) */}
                <CatalogFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    isExpanded={isFilterExpanded}
                    onToggleExpand={() => setFilterExpanded(!isFilterExpanded)}
                />

                {/* Right side controls */}
                <div className="flex items-center gap-2 ml-auto shrink-0">
                    {/* Results Count - Hidden on mobile */}
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
                            {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}
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

            {/* Product Grid/List */}
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
                        image={product.image}
                        isPremium={product.isPremium}
                        isFree={product.isFree}
                        discount={product.discount}
                        author={product.author}
                        isSaved={saved.has(product.id)}
                        onSave={() => handleSave(product.id)}
                        onClick={() => handleProductClick(product)}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        formats={product.formats}
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        polyCount={product.polyCount}
                        viewMode={viewMode}
                    />
                ))}
            </div>

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
                {!hasMore && (
                    <p className="text-gray-600 text-xs">You've reached the end ✨</p>
                )}
            </div>
            {/* Product Details Modal */}
            {selectedProduct && (
                <ProductDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    product={selectedProduct}
                    relatedProducts={products.slice(0, 4)} // Mock related
                />
            )}
        </div>
    );
}
