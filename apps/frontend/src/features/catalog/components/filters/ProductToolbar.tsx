'use client';

import { Grid3x3, List, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type SortOption = 'newest' | 'popular' | 'rating' | 'price_asc' | 'price_desc';
type ViewMode = 'grid' | 'list';

interface ProductToolbarProps {
    totalResults: number;
    currentPage: number;
    itemsPerPage: number;
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

const sortOptions = [
    { value: 'newest' as SortOption, label: 'Newest' },
    { value: 'popular' as SortOption, label: 'Most Popular' },
    { value: 'rating' as SortOption, label: 'Best Rated' },
    { value: 'price_asc' as SortOption, label: 'Price: Low to High' },
    { value: 'price_desc' as SortOption, label: 'Price: High to Low' },
];

export default function ProductToolbar({
    totalResults,
    currentPage,
    itemsPerPage,
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange,
}: ProductToolbarProps) {
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalResults);
    const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || 'Newest';

    return (
        <div className="flex items-center justify-between gap-4 py-4">
            {/* Result Count */}
            <div className="text-gray-400 text-sm">
                Showing <span className="text-white font-medium">{startItem}-{endItem}</span> of{' '}
                <span className="text-white font-medium">{totalResults.toLocaleString()}</span> results
            </div>

            {/* Sort & View Controls */}
            <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div ref={sortRef} className="relative">
                    <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:border-gray-600 transition-colors"
                    >
                        <span className="text-sm">Sort: {currentSortLabel}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSortOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onSortChange(option.value);
                                        setIsSortOpen(false);
                                    }}
                                    className={`
                    w-full px-4 py-2.5 text-left text-sm transition-colors
                    ${sortBy === option.value
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700'
                                        }
                  `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-2 rounded transition-colors ${viewMode === 'grid'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                        title="Grid view"
                    >
                        <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-2 rounded transition-colors ${viewMode === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                        title="List view"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
