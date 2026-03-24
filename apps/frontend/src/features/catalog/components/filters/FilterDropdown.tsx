'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

interface FilterDropdownProps {
    label: string;
    options: FilterOption[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    multiSelect?: boolean;
}

export default function FilterDropdown({
    label,
    options,
    selectedValues,
    onChange,
    multiSelect = true,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (value: string) => {
        if (multiSelect) {
            if (selectedValues.includes(value)) {
                onChange(selectedValues.filter((v) => v !== value));
            } else {
                onChange([...selectedValues, value]);
            }
        } else {
            onChange([value]);
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        onChange([]);
    };

    const activeCount = selectedValues.length;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
          ${activeCount > 0
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }
        `}
            >
                <span className="font-medium">{label}</span>
                {activeCount > 0 && (
                    <span className="bg-white text-blue-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {activeCount}
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="max-h-80 overflow-y-auto p-2">
                        {options.map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded cursor-pointer transition-colors"
                            >
                                <input
                                    type={multiSelect ? 'checkbox' : 'radio'}
                                    checked={selectedValues.includes(option.value)}
                                    onChange={() => handleToggle(option.value)}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="flex-1 text-white text-sm">{option.label}</span>
                                {option.count !== undefined && (
                                    <span className="text-gray-400 text-xs">({option.count})</span>
                                )}
                            </label>
                        ))}
                    </div>

                    {activeCount > 0 && (
                        <div className="border-t border-gray-700 p-2">
                            <button
                                onClick={handleClear}
                                className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
