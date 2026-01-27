'use client';

import { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Grid3x3, 
  LayoutGrid,
  Star,
  Download,
  Heart,
  X,
  PackageOpen
} from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
  downloads: number;
  rating: number;
  price: 'free' | number;
  format: string[];
}

interface ProductsPageProps {
  products?: Product[];
  isLoading?: boolean;
}

export default function ProductsPage({ products = [], isLoading = false }: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('3d asset ram');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);

  const categories = [
    'All Categories',
    'Hardware',
    'Electronics',
    'Furniture',
    'Vehicles',
    'Characters',
    'Architecture'
  ];

  const fileFormats = ['FBX', 'OBJ', 'GLTF', 'BLEND', 'MAX', 'C4D'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      {/* Top Search Bar */}
      <div className="border-b border-gray-800 bg-[#111] sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 max-w-3xl relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for 3D assets..."
                className="w-full bg-[#1a1a1a] text-white px-6 py-3 pr-12 rounded-full outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-[#1a1a1a] rounded-full p-1 border border-gray-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] rounded-full hover:bg-gray-800 transition-colors border border-gray-800"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden md:inline">Filters</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="text-gray-400 text-sm">
              {products.length > 0 ? `${products.length} results` : '0 results'}
            </span>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded-full text-sm border border-gray-800 hover:border-gray-700">
                <span className="text-gray-400">Sort:</span>
                <span className="capitalize">{sortBy}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Active Filters */}
            {priceFilter !== 'all' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm border border-blue-600/30">
                <span className="capitalize">{priceFilter}</span>
                <button onClick={() => setPriceFilter('all')}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`w-64 flex-shrink-0 transition-all duration-300 ${
            showFilters ? 'translate-x-0' : '-translate-x-full absolute'
          } max-md:${showFilters ? 'fixed inset-0 z-50 bg-[#0a0a0a] p-6' : ''}`}>
            <div className="sticky top-24 space-y-6">
              {/* Close button for mobile */}
              <button 
                onClick={() => setShowFilters(false)}
                className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <span className="text-gray-500">⬡</span>
                  CATEGORY
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category.toLowerCase())}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.toLowerCase()
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <span className="text-gray-500">⬡</span>
                  PRICE
                </h3>
                <div className="space-y-2">
                  {['all', 'free', 'paid'].map((price) => (
                    <button
                      key={price}
                      onClick={() => setPriceFilter(price as any)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                        priceFilter === price
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {price === 'all' ? 'All Assets' : price}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Format Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <span className="text-gray-500">⬡</span>
                  FILE FORMAT
                </h3>
                <div className="space-y-2">
                  {fileFormats.map((format) => (
                    <label
                      key={format}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-600"
                      />
                      {format}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <span className="text-gray-500">⬡</span>
                  SORT BY
                </h3>
                <div className="space-y-2">
                  {['newest', 'popular', 'price'].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort as any)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                        sortBy === sort
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid / Empty State */}
          <main className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : products.length === 0 ? (
              <EmptyState />
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-32 h-32 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
        <PackageOpen className="w-16 h-16 text-gray-600" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Produk Kosong</h2>
      <p className="text-gray-400 text-center max-w-md mb-8">
        Tidak ada produk yang ditemukan. Coba ubah filter atau kata kunci pencarian Anda.
      </p>
      <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors">
        Reset Filter
      </button>
    </div>
  );
}

function ProductCard({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div
      className={`group relative bg-[#111] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all cursor-pointer ${
        viewMode === 'list' ? 'flex gap-4' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className={`relative bg-gray-900 ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-[4/3]'}`}>
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-cover"
        />
        
        {/* Overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 transition-opacity">
            <button className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              className={`p-3 rounded-full transition-colors ${
                isSaved ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          {product.price === 'free' ? (
            <span className="px-3 py-1 bg-green-500 text-black text-xs font-bold rounded-full">
              FREE
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              ${product.price}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1">
        <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.title}</h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{product.downloads.toLocaleString()}</span>
          </div>
        </div>

        {/* File Formats */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {product.format.map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded border border-blue-600/30"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
