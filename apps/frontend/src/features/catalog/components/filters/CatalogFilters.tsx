'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal, Check } from 'lucide-react';

// Supported Filter Options
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
                    className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer text-sm font-bold shadow-lg ${isExpanded || hasActiveFilters
                            ? 'bg-yellow-400 text-black scale-105'
                            : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] hover:text-white border border-white/5'
                        }`}
                >
                    <SlidersHorizontal className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? 'rotate-90' : ''}`} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 bg-black/20 rounded-full text-[10px] font-black">
                            {activeFilterCount}
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 opacity-50" />
                    ) : (
                        <ChevronDown className="w-4 h-4 opacity-50" />
                    )}
                </button>

                {/* Active Filter Tags - Compact */}
                {hasActiveFilters && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        {filters.formats.map((formatId) => (
                            <Tag 
                                key={formatId} 
                                label={FILE_FORMATS.find(f => f.id === formatId)?.label || formatId} 
                                onRemove={() => handleFormatToggle(formatId)} 
                            />
                        ))}
                        {filters.price !== 'all' && (
                            <Tag 
                                label={PRICE_OPTIONS.find(p => p.id === filters.price)?.label || filters.price} 
                                onRemove={() => handlePriceChange('all')} 
                                color="yellow"
                            />
                        )}
                        {filters.licenses.map((licenseId) => (
                            <Tag 
                                key={licenseId} 
                                label={LICENSE_OPTIONS.find(l => l.id === licenseId)?.label || licenseId} 
                                onRemove={() => handleLicenseToggle(licenseId)} 
                            />
                        ))}
                        {filters.showNsfw && (
                            <Tag 
                                label="NSFW" 
                                onRemove={() => onFilterChange({ ...filters, showNsfw: false })} 
                                color="red"
                            />
                        )}
                        <button
                            onClick={clearAllFilters}
                            className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors cursor-pointer uppercase tracking-widest px-2"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {/* Expandable Filter Panel - Premium Glass Design */}
            {isExpanded && (
                <div className="absolute left-0 right-0 top-full mt-4 mx-0 bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 z-[60] shadow-[0_30px_60px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        
                        {/* File Format Section */}
                        <FilterSection 
                            title="File Format" 
                            isOpen={expandedSections.has('format')}
                            onToggle={() => toggleSection('format')}
                        >
                            <div className="space-y-2">
                                {FILE_FORMATS.map((format) => (
                                    <Checkbox 
                                        key={format.id}
                                        label={format.label}
                                        checked={filters.formats.includes(format.id)}
                                        onChange={() => handleFormatToggle(format.id)}
                                    />
                                ))}
                            </div>
                        </FilterSection>

                        {/* Price Section */}
                        <FilterSection 
                            title="Price" 
                            isOpen={expandedSections.has('price')}
                            onToggle={() => toggleSection('price')}
                        >
                            <div className="flex flex-wrap gap-2">
                                {PRICE_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handlePriceChange(option.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${filters.price === option.id
                                                ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>

                        {/* License Section */}
                        <FilterSection 
                            title="License" 
                            isOpen={expandedSections.has('license')}
                            onToggle={() => toggleSection('license')}
                        >
                            <div className="flex flex-wrap gap-2">
                                {LICENSE_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleLicenseToggle(option.id)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all duration-300 active:scale-95 ${filters.licenses.includes(option.id)
                                                ? 'bg-white text-black'
                                                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 border border-white/5'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Content Section */}
                        <FilterSection 
                            title="Content Settings" 
                            isOpen={expandedSections.has('content')}
                            onToggle={() => toggleSection('content')}
                        >
                            <div className="space-y-4">
                                <Checkbox 
                                    label="Show NSFW (18+)"
                                    checked={filters.showNsfw}
                                    onChange={(e) => onFilterChange({ ...filters, showNsfw: e.target.checked })}
                                    accentColor="red"
                                />
                                <Checkbox 
                                    label="3D Printable Assets"
                                    checked={filters.isPrintable}
                                    onChange={(e) => onFilterChange({ ...filters, isPrintable: e.target.checked })}
                                />
                            </div>
                        </FilterSection>

                    </div>
                </div>
            )}
        </>
    );
}

// Sub-components
function Tag({ label, onRemove, color = 'gray' }: { label: string, onRemove: () => void, color?: 'gray' | 'yellow' | 'red' }) {
    const colorClasses = {
        gray: 'bg-white/5 border-white/10 text-gray-300',
        yellow: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
        red: 'bg-red-500/10 border-red-500/20 text-red-400',
    };

    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all animate-in zoom-in-95 duration-200 ${colorClasses[color]}`}>
            {label}
            <button onClick={onRemove} className="hover:text-white transition-colors cursor-pointer p-0.5">
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}

function FilterSection({ title, children, isOpen, onToggle }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) {
    return (
        <div className="space-y-4">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full text-left cursor-pointer group"
            >
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">{title}</h4>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {children}
            </div>
        </div>
    );
}

function Checkbox({ label, checked, onChange, accentColor = 'yellow' }: { label: string, checked: boolean, onChange: (e: any) => void, accentColor?: 'yellow' | 'red' }) {
    const colorClass = accentColor === 'red' ? 'text-red-500' : 'text-yellow-400';
    const borderClass = checked ? (accentColor === 'red' ? 'border-red-500' : 'border-yellow-400') : 'border-white/10';
    const bgClass = checked ? (accentColor === 'red' ? 'bg-red-500/10' : 'bg-yellow-400/10') : 'bg-transparent';

    return (
        <label className="flex items-center gap-3 cursor-pointer group py-1">
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border transition-all duration-300 flex items-center justify-center ${borderClass} ${bgClass} group-hover:border-white/30`}>
                    {checked && <Check className={`w-3.5 h-3.5 ${colorClass}`} strokeWidth={4} />}
                </div>
            </div>
            <span className={`text-xs font-bold transition-colors ${checked ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {label}
            </span>
        </label>
    );
}

export { FILE_FORMATS, PRICE_OPTIONS, LICENSE_OPTIONS };
