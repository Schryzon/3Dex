'use client';

import { X } from 'lucide-react';

interface ActiveFilter {
    category: string;
    value: string;
    label: string;
}

interface ActiveFiltersProps {
    filters: ActiveFilter[];
    onRemove: (category: string, value: string) => void;
    onClearAll: () => void;
}

export default function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
    if (filters.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Active filters:</span>

            {filters.map((filter, index) => (
                <button
                    key={`${filter.category}-${filter.value}-${index}`}
                    onClick={() => onRemove(filter.category, filter.value)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors group"
                >
                    <span>{filter.label}</span>
                    <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </button>
            ))}

            {filters.length > 1 && (
                <button
                    onClick={onClearAll}
                    className="text-sm text-gray-400 hover:text-white underline transition-colors ml-2"
                >
                    Clear all
                </button>
            )}
        </div>
    );
}
