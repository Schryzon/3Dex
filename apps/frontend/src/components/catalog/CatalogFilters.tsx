'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';

// Filter options
const FILE_FORMATS = [
    { id: 'blend', label: 'Blender', ext: '.blend' },
    { id: 'fbx', label: 'FBX', ext: '.fbx' },
    { id: 'obj', label: 'OBJ', ext: '.obj' },
    { id: 'max', label: '3ds Max', ext: '.max' },
    { id: 'maya', label: 'Maya', ext: '.ma/.mb' },
    { id: 'c4d', label: 'Cinema 4D', ext: '.c4d' },
];

const PRICE_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'free', label: 'Free' },
    { id: 'paid', label: 'Paid' },
];

const MODEL_TYPES = [
    { id: 'animated', label: 'Animated' },
    { id: 'rigged', label: 'Rigged' },
    { id: 'lowpoly', label: 'Low Poly' },
    { id: 'highpoly', label: 'High Poly' },
    { id: 'pbr', label: 'PBR Ready' },
];

export interface FilterState {
    formats: string[];
    price: string;
    types: string[];
}

interface CatalogFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export default function CatalogFilters({
    filters,
    onFilterChange,
    isExpanded,
    onToggleExpand,
}: CatalogFiltersProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['format', 'price', 'type'])
    );

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const handleFormatToggle = (formatId: string) => {
        const newFormats = filters.formats.includes(formatId)
            ? filters.formats.filter((f) => f !== formatId)
            : [...filters.formats, formatId];
        onFilterChange({ ...filters, formats: newFormats });
    };

    const handlePriceChange = (priceId: string) => {
        onFilterChange({ ...filters, price: priceId });
    };

    const handleTypeToggle = (typeId: string) => {
        const newTypes = filters.types.includes(typeId)
            ? filters.types.filter((t) => t !== typeId)
            : [...filters.types, typeId];
        onFilterChange({ ...filters, types: newTypes });
    };

    const clearAllFilters = () => {
        onFilterChange({ formats: [], price: 'all', types: [] });
    };

    const activeFilterCount =
        filters.formats.length +
        (filters.price !== 'all' ? 1 : 0) +
        filters.types.length;

    const hasActiveFilters = activeFilterCount > 0;

    return (
        <>
            {/* Filter Button & Active Tags - Inline */}
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                <button
                    onClick={onToggleExpand}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-sm ${isExpanded || hasActiveFilters
                            ? 'bg-yellow-400 text-black'
                            : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] hover:text-white border border-gray-800'
                        }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="font-medium">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-black/20 rounded text-xs font-bold">
                            {activeFilterCount}
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                    ) : (
                        <ChevronDown className="w-3 h-3" />
                    )}
                </button>

                {/* Active Filter Tags - Compact */}
                {hasActiveFilters && (
                    <>
                        {filters.formats.map((formatId) => {
                            const format = FILE_FORMATS.find((f) => f.id === formatId);
                            return (
                                <span
                                    key={formatId}
                                    className="flex items-center gap-1 px-2 py-1 bg-[#252525] text-gray-300 text-xs rounded-md"
                                >
                                    {format?.label}
                                    <button
                                        onClick={() => handleFormatToggle(formatId)}
                                        className="hover:text-white cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                        {filters.price !== 'all' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-[#252525] text-gray-300 text-xs rounded-md">
                                {PRICE_OPTIONS.find((p) => p.id === filters.price)?.label}
                                <button
                                    onClick={() => handlePriceChange('all')}
                                    className="hover:text-white cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.types.map((typeId) => {
                            const type = MODEL_TYPES.find((t) => t.id === typeId);
                            return (
                                <span
                                    key={typeId}
                                    className="flex items-center gap-1 px-2 py-1 bg-[#252525] text-gray-300 text-xs rounded-md"
                                >
                                    {type?.label}
                                    <button
                                        onClick={() => handleTypeToggle(typeId)}
                                        className="hover:text-white cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                        <button
                            onClick={clearAllFilters}
                            className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
                        >
                            Clear all
                        </button>
                    </>
                )}
            </div>

            {/* Expandable Filter Panel - Below the toolbar */}
            {isExpanded && (
                <div className="absolute left-0 right-0 top-full mt-2 mx-4 md:mx-6 bg-[#141414] border border-gray-800 rounded-xl p-4 z-20 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        {/* File Format Section */}
                        <div>
                            <button
                                onClick={() => toggleSection('format')}
                                className="flex items-center justify-between w-full text-left mb-2 cursor-pointer"
                            >
                                <h4 className="text-sm font-semibold text-white">File Format</h4>
                                {expandedSections.has('format') ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                            {expandedSections.has('format') && (
                                <div className="grid grid-cols-2 gap-1">
                                    {FILE_FORMATS.map((format) => (
                                        <label
                                            key={format.id}
                                            className="flex items-center gap-2 cursor-pointer group py-1"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.formats.includes(format.id)}
                                                onChange={() => handleFormatToggle(format.id)}
                                                className="w-3.5 h-3.5 rounded border-gray-600 bg-transparent text-yellow-400 focus:ring-yellow-400 focus:ring-offset-0 cursor-pointer"
                                            />
                                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                                                {format.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price Section */}
                        <div>
                            <button
                                onClick={() => toggleSection('price')}
                                className="flex items-center justify-between w-full text-left mb-2 cursor-pointer"
                            >
                                <h4 className="text-sm font-semibold text-white">Price</h4>
                                {expandedSections.has('price') ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                            {expandedSections.has('price') && (
                                <div className="flex flex-wrap gap-2">
                                    {PRICE_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handlePriceChange(option.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filters.price === option.id
                                                    ? 'bg-yellow-400 text-black'
                                                    : 'bg-[#252525] text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Model Type Section */}
                        <div>
                            <button
                                onClick={() => toggleSection('type')}
                                className="flex items-center justify-between w-full text-left mb-2 cursor-pointer"
                            >
                                <h4 className="text-sm font-semibold text-white">Model Type</h4>
                                {expandedSections.has('type') ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                            {expandedSections.has('type') && (
                                <div className="flex flex-wrap gap-1.5">
                                    {MODEL_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => handleTypeToggle(type.id)}
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${filters.types.includes(type.id)
                                                    ? 'bg-yellow-400 text-black'
                                                    : 'bg-[#252525] text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Export constants for use in page
export { FILE_FORMATS, PRICE_OPTIONS, MODEL_TYPES };
