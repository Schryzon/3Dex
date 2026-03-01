'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  title: string;
  price: number;
  discount?: number;
  thumbnails: string[];
  seller: {
    name: string;
    avatar: string;
  };
  specifications?: {
    polygons: number;
    version: string;
  };
}

interface Props {
  products: Product[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ProductGrid({ products, loading, onLoadMore, hasMore }: Props) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleAddToCart = async (productId: string) => {
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      // Show success message
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    try {
      const newFavorites = new Set(favorites);
      if (favorites.has(productId)) {
        newFavorites.delete(productId);
        await fetch(`/api/favorites/${productId}`, { method: 'DELETE' });
      } else {
        newFavorites.add(productId);
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      }
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#111] rounded-xl border border-white/[0.05] overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-white/5"></div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="h-5 bg-white/5 rounded-lg w-3/4"></div>
                <div className="h-3 bg-white/5 rounded-lg w-1/2"></div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-7 bg-white/5 rounded-lg w-1/3"></div>
                <div className="h-6 bg-white/5 rounded-lg w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-[#111] rounded-3xl border border-white/[0.05]">
        <svg
          className="w-20 h-20 text-gray-700 mx-auto mb-4 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
        <p className="text-gray-500 font-medium">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.has(product.id)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed px-10 py-3.5 rounded-xl font-bold transition-all flex items-center gap-3 backdrop-blur-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                Load More
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}