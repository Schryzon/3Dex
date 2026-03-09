'use client';

import { useQuery } from '@tanstack/react-query';
import { purchaseService, Purchase } from '@/lib/api/services/purchase.service';
import { FolderOpen, Download, Eye, Calendar, Filter, Search, Grid3x3, List, ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useState } from 'react';

export default function Collection() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'price'>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => purchaseService.getPurchases(),
    enabled: !!user,
  });

  const handleDownload = async (modelId: string, title: string) => {
    try {
      const { download_url } = await purchaseService.getDownloadUrl(modelId);
      const a = document.createElement('a');
      a.href = download_url;
      a.setAttribute('download', `${title}.glb`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading model:', error);
    }
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

  const handleBulkDownload = async () => {
    if (selectedItems.size === 0) return;
    for (const itemId of selectedItems) {
      const purchase = collections.find(p => p.id === itemId);
      if (purchase) await handleDownload(purchase.model_id, purchase.model.title);
    }
    setSelectedItems(new Set());
  };

  const filteredCollections = collections
    .filter((item) => item.model.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.model.title.localeCompare(b.model.title);
      if (sortBy === 'price') return b.price_paid - a.price_paid;
      return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
    });

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
            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
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

        <div className="flex gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'price')}
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
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredCollections.length}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded border-gray-700 text-yellow-400 focus:ring-yellow-400"
            />
            <span className="text-sm">
              {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDownload}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
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
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-800"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
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
                className={`bg-gray-900/50 border rounded-lg overflow-hidden hover:border-gray-700 transition-all group ${selectedItems.has(item.id) ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-gray-800'
                  }`}
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                  <img
                    src={item.model.preview_url}
                    alt={item.model.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Checkbox Overlay */}
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      className="w-5 h-5 rounded border-gray-700 text-yellow-400 focus:ring-yellow-400 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/catalog/${item.model_id}`}
                      className="p-2 bg-black/70 hover:bg-black rounded-lg backdrop-blur-sm transition-colors"
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <Link href={`/catalog/${item.model_id}`}>
                    <h3 className="font-semibold text-white mb-2 truncate hover:text-yellow-400 cursor-pointer transition-colors">
                      {item.model.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.purchase_date).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => handleDownload(item.model_id, item.model.title)}
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
                className={`bg-gray-900/50 border rounded-lg p-4 hover:border-gray-700 transition-all ${selectedItems.has(item.id) ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-gray-800'
                  }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                    className="w-5 h-5 rounded border-gray-700 text-yellow-400 focus:ring-yellow-400 cursor-pointer flex-shrink-0"
                  />

                  {/* Thumbnail */}
                  <img
                    src={item.model.preview_url}
                    alt={item.model.title}
                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/catalog/${item.model_id}`}>
                      <h3 className="font-semibold text-white truncate hover:text-yellow-400 cursor-pointer transition-colors">
                        {item.model.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.purchase_date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(item.model_id, item.model.title)}
                      className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    <Link
                      href={`/catalog/${item.model_id}`}
                      className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
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
            <Link
              href="/catalog"
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Browse Catalog
            </Link>
          )}
        </div>
      )}
    </div>
  );
}