'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // BACKEND INTEGRATION: Fetch search suggestions
        // TODO: Debounced API call to /api/products/search-suggestions?q=${newValue}
        if (newValue.length > 2) {
            // Mock suggestions for now
            setSuggestions(['3D Character', '3D Car', '3D Building', 'Texture Pack']);
        } else {
            setSuggestions([]);
        }
    };

    const handleClear = () => {
        onChange('');
        setSuggestions([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(value);
        setSuggestions([]);
        setIsFocused(false);
    };

    return (
        <div className="relative w-full">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={value}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="Search 3D models, textures, and more..."
                        className="w-full pl-12 pr-12 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </form>

            {/* Autocomplete Suggestions */}
            {isFocused && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onChange(suggestion);
                                onSearch(suggestion);
                                setSuggestions([]);
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                            <Search className="w-4 h-4 text-gray-400" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
