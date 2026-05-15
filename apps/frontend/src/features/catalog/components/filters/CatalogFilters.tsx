'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';

// Filter options
const FILE_FORMATS = [
    { id: 'glb', label: 'GLB', ext: '.glb' },
    { id: 'gltf', label: 'glTF', ext: '.gltf' },
];

const PRICE_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'free', label: 'Free' },
    { id: 'paid', label: 'Paid' },
];

const LICENSE_OPTIONS = [
    { id: 'PERSONAL_USE', label: 'Personal Use' },
    { id: 'COMMERCIAL_USE', label: 'Commercial Use' },
];

export interface FilterState {
    formats: string[];
    price: string;
    licenses: string[];
    isPrintable: boolean;
    showNsfw: boolean;
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
        new Set(['format', 'price', 'license', 'content'])
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

    const handleLicenseToggle = (licenseId: string) => {
        const newLicenses = filters.licenses.includes(licenseId)
            ? filters.licenses.filter((l) => l !== licenseId)
            : [...filters.licenses, licenseId];
        onFilterChange({ ...filters, licenses: newLicenses });
    };

    const clearAllFilters = () => {
        onFilterChange({
            formats: [],
            price: 'all',
            licenses: [],
            isPrintable: false,
            showNsfw: false,
        });
    };

    const activeFilterCount =
        filters.formats.length +
        (filters.price !== 'all' ? 1 : 0) +
        filters.licenses.length +
        (filters.isPrintable ? 1 : 0) +
        (filters.showNsfw ? 1 : 0);

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
                        {filters.licenses.map((licenseId) => {
                            const license = LICENSE_OPTIONS.find((l) => l.id === licenseId);
                            return (
                                <span
                                    key={licenseId}
                                    className="flex items-center gap-1 px-2 py-1 bg-[#252525] text-gray-300 text-xs rounded-md"
                                >
                                    {license?.label}
                                    <button
                                        onClick={() => handleLicenseToggle(licenseId)}
                                        className="hover:text-white cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                        {filters.isPrintable && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-[#252525] text-gray-300 text-xs rounded-md">
                                3D Printable
                                <button
                                    onClick={() => onFilterChange({ ...filters, isPrintable: false })}
                                    className="hover:text-white cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.showNsfw && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 border border-red-900/50 text-xs rounded-md font-medium">
                                NSFW Included
                                <button
                                    onClick={() => onFilterChange({ ...filters, showNsfw: false })}
                                    className="hover:text-red-300 cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
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

                        {/* License Section */}
                        <div>
                            <button
                                onClick={() => toggleSection('license')}
                                className="flex items-center justify-between w-full text-left mb-2 cursor-pointer"
                            >
                                <h4 className="text-sm font-semibold text-white">License</h4>
                                {expandedSections.has('license') ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                            {expandedSections.has('license') && (
                                <div className="flex flex-wrap gap-1.5">
                                    {LICENSE_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleLicenseToggle(option.id)}
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${filters.licenses.includes(option.id)
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

                        {/* Content & Attributes Section */}
                        <div>
                            <button
                                onClick={() => toggleSection('content')}
                                className="flex items-center justify-between w-full text-left mb-2 cursor-pointer"
                            >
                                <h4 className="text-sm font-semibold text-white">Attributes</h4>
                                {expandedSections.has('content') ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                            {expandedSections.has('content') && (
                                <div className="space-y-3 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={filters.isPrintable}
                                            onChange={(e) => onFilterChange({ ...filters, isPrintable: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-600 bg-transparent text-yellow-400 focus:ring-yellow-400 focus:ring-offset-0 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                            3D Printable
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={filters.showNsfw}
                                            onChange={(e) => onFilterChange({ ...filters, showNsfw: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-600 bg-transparent text-red-500 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                            Show NSFW (18+)
                                        </span>
                                    </label>
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
export { FILE_FORMATS, PRICE_OPTIONS, LICENSE_OPTIONS };
