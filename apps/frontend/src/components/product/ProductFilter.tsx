'use client';

import { useState, useEffect } from 'react';

interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  software: string[];
  polygonRange: [number, number];
  fileFormats: string[];
  features: string[];
}

interface Props {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

export default function ProductFilter({ onFilterChange, initialFilters }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 1000],
    software: [],
    polygonRange: [0, 1000000],
    fileFormats: [],
    features: [],
  });

  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    priceRange: [0, 1000] as [number, number],
    software: [] as string[],
    polygonRange: [0, 1000000] as [number, number],
    fileFormats: [] as string[],
    features: [] as string[],
    sortBy: 'recent' as 'recent' | 'price-low' | 'price-high' | 'popular' | 'rating',
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (initialFilters) {
      setSelectedFilters({ ...selectedFilters, ...initialFilters });
    }
  }, [initialFilters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/products/filter-options');
      const data = await response.json();
      setFilterOptions(data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedFilters.categories.includes(category)
      ? selectedFilters.categories.filter((c) => c !== category)
      : [...selectedFilters.categories, category];
    
    const newFilters = { ...selectedFilters, categories: newCategories };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSoftwareToggle = (software: string) => {
    const newSoftware = selectedFilters.software.includes(software)
      ? selectedFilters.software.filter((s) => s !== software)
      : [...selectedFilters.software, software];
    
    const newFilters = { ...selectedFilters, software: newSoftware };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = selectedFilters.features.includes(feature)
      ? selectedFilters.features.filter((f) => f !== feature)
      : [...selectedFilters.features, feature];
    
    const newFilters = { ...selectedFilters, features: newFeatures };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    const newFilters = { ...selectedFilters, priceRange: [min, max] as [number, number] };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: typeof selectedFilters.sortBy) => {
    const newFilters = { ...selectedFilters, sortBy };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      categories: [],
      priceRange: [0, 1000] as [number, number],
      software: [],
      polygonRange: [0, 1000000] as [number, number],
      fileFormats: [],
      features: [],
      sortBy: 'recent' as const,
    };
    setSelectedFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount =
    selectedFilters.categories.length +
    selectedFilters.software.length +
    selectedFilters.features.length +
    (selectedFilters.priceRange[0] !== 0 || selectedFilters.priceRange[1] !== 1000 ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-[#141414] hover:bg-[#1a1a1a] px-4 py-3 rounded-lg flex items-center justify-between transition-all"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Sort By */}
        <div className="bg-[#141414] rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            Sort By
          </h3>
          <div className="space-y-2">
            {[
              { value: 'recent', label: 'Most Recent' },
              { value: 'popular', label: 'Most Popular' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'rating', label: 'Highest Rated' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value as any)}
                className={`w-full text-left px-3 py-2 rounded transition-all ${
                  selectedFilters.sortBy === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="bg-[#141414] rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Price Range
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={selectedFilters.priceRange[0]}
                onChange={(e) =>
                  handlePriceRangeChange(Number(e.target.value), selectedFilters.priceRange[1])
                }
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                placeholder="Min"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={selectedFilters.priceRange[1]}
                onChange={(e) =>
                  handlePriceRangeChange(selectedFilters.priceRange[0], Number(e.target.value))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                placeholder="Max"
              />
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={selectedFilters.priceRange[1]}
              onChange={(e) =>
                handlePriceRangeChange(selectedFilters.priceRange[0], Number(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-[#141414] rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Categories
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {['Architecture', 'Character', 'Vehicle', 'Props', 'Nature', 'Interior', 'Furniture', 'Electronics'].map(
              (category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedFilters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Software */}
        <div className="bg-[#141414] rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Software
          </h3>
          <div className="space-y-2">
            {['3ds Max', 'Blender', 'Maya', 'Cinema 4D', 'SketchUp', 'ZBrush'].map((software) => (
              <label key={software} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedFilters.software.includes(software)}
                  onChange={() => handleSoftwareToggle(software)}
                  className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{software}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-[#141414] rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Features
          </h3>
          <div className="space-y-2">
            {['Textured', 'Rigged', 'Animated', 'PBR Materials', 'UV Mapped', 'Low Poly'].map((feature) => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedFilters.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-500 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}