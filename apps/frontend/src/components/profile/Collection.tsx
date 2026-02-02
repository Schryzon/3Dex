'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Download, Eye, Calendar, Filter, Search, Grid3x3, List, ChevronDown, ExternalLink, Trash2, Archive } from 'lucide-react';

interface PurchasedModel {
  id: string;
  title: string;
  thumbnail: string;
  seller: {
    name: string;
    avatar: string;
  };
  purchaseDate: string;
  price: number;
  downloadCount: number;
  lastDownloaded?: string;
  fileSize: string;
  fileFormats: string[];
  category: string;
  specifications: {
    polygons: number;
    version: string;
  };
}

export default function Collection() {
  const [collections, setCollections] = useState<PurchasedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'price'>('recent');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCollections();
  }, [sortBy, filterCategory]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort: sortBy,
        ...(filterCategory !== 'all' && { category: filterCategory }),
      });
      const response = await fetch(`/api/user/purchases?${params}`);
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (modelId: string) => {
    try {
      const response = await fetch(`/api/user/purchases/${modelId}/download`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `model-${modelId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Refresh to update download count
        fetchCollections();
      }
    } catch (error) {
      console.error('Error downloading model:', error);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedItems.size === 0) return;
    
    for (const itemId of selectedItems) {
      await handleDownload(itemId);
    }
    setSelectedItems(new Set());
  };

  const handleToggleSelect = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredCollections.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredCollections.map(item => item.id)));
    }
  };

  const filteredCollections = collections.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const categories = ['all', ...new Set(collections.map(item => item.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">My Collections</h2>
          <p className="text-gray-400">
            {filteredCollections.length} purchased {filteredCollections.length === 1 ? 'model' : 'models'}
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your collections..."
            className="w-full bg-gray-900/50 border border-gray-800 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-gray-700 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg px-4 py-3 flex items-center gap-2 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
              {filterCategory !== 'all' && (
                <span className="bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  1
                </span>
              )}
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-10">
                <div className="p-3 border-b border-gray-800">
                  <h4 className="font-semibold text-sm">Category</h4>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFilterCategory(category);
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${
                        filterCategory === category
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg px-4 py-3 pr-10 cursor-pointer transition-colors focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name A-Z</option>
              <option value="price">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredCollections.length}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded border-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">
              {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDownload}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Download Selected
            </button>
            <button
              onClick={() => setSelectedItems(new Set())}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-800"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                <div className="h-5 bg-gray-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCollections.length > 0 ? (
        viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((item) => (
              <div
                key={item.id}
                className={`bg-gray-900/50 border rounded-lg overflow-hidden hover:border-gray-700 transition-all group ${
                  selectedItems.has(item.id) ? 'border-blue-600 ring-2 ring-blue-600/50' : 'border-gray-800'
                }`}
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Checkbox Overlay */}
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      className="w-5 h-5 rounded border-gray-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => window.open(`/product/${item.id}`, '_blank')}
                      className="p-2 bg-black/70 hover:bg-black rounded-lg backdrop-blur-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Download Badge */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {item.downloadCount}x
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 truncate hover:text-blue-400 cursor-pointer transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={item.seller.avatar}
                      alt={item.seller.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sm text-gray-400 truncate">{item.seller.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <span className="text-gray-500">{item.fileSize}</span>
                  </div>

                  <button
                    onClick={() => handleDownload(item.id)}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {filteredCollections.map((item) => (
              <div
                key={item.id}
                className={`bg-gray-900/50 border rounded-lg p-4 hover:border-gray-700 transition-all ${
                  selectedItems.has(item.id) ? 'border-blue-600 ring-2 ring-blue-600/50' : 'border-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                    className="w-5 h-5 rounded border-gray-700 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                  />

                  {/* Thumbnail */}
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate hover:text-blue-400 cursor-pointer transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src={item.seller.avatar}
                        alt={item.seller.name}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-sm text-gray-400 truncate">{item.seller.name}</span>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="hidden lg:flex items-center gap-6 text-sm text-gray-400">
                    <div>
                      <span className="text-gray-500">Polygons:</span> {item.specifications.polygons.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-500">Format:</span> {item.fileFormats.join(', ')}
                    </div>
                    <div>
                      <span className="text-gray-500">Size:</span> {item.fileSize}
                    </div>
                  </div>

                  {/* Purchase Date */}
                  <div className="hidden md:flex items-center gap-1 text-sm text-gray-400 flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.purchaseDate).toLocaleDateString()}
                  </div>

                  {/* Download Count */}
                  <div className="hidden sm:flex items-center gap-1 text-sm text-gray-400 flex-shrink-0">
                    <Download className="w-4 h-4" />
                    {item.downloadCount}x
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(item.id)}
                      className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    <button
                      onClick={() => window.open(`/product/${item.id}`, '_blank')}
                      className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <FolderOpen className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            {searchQuery
              ? `No models found matching "${searchQuery}"`
              : "You haven't purchased any 3D models yet. Browse our marketplace to get started!"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => window.location.href = '/marketplace'}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Browse Marketplace
            </button>
          )}
        </div>
      )}
    </div>
  );
}