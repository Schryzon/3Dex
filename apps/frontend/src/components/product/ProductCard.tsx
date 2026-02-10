'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye } from 'lucide-react';

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
  product: Product;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export default function ProductCard({ product, onAddToCart, onToggleFavorite, isFavorite }: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const finalPrice = product.discount
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div
        className="group bg-gray-900 rounded-lg overflow-hidden border border-gray-900 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-yellow-500/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-800 to-black">
          <img
            src={product.thumbnails[imageIndex]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-yellow-500/20">
              -{product.discount}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 ${
              isFavorite 
                ? 'bg-yellow-500 text-black border border-yellow-500 shadow-lg shadow-yellow-500/20' 
                : 'bg-black/80 text-white border border-gray-800 hover:bg-yellow-500 hover:text-black hover:border-yellow-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Thumbnail Navigation */}
          {product.thumbnails.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.thumbnails.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    imageIndex === index 
                      ? 'bg-yellow-500 w-6' 
                      : 'bg-white/50 hover:bg-yellow-500/50 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Quick Add to Cart (on hover) */}
          {isHovered && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
              <button
                onClick={handleAddToCart}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-yellow-500 transition-colors duration-300">
            {product.title}
          </h3>

          {/* Seller Info */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-6 h-6 rounded-full border border-gray-800"
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
              {product.seller.name}
            </span>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                {product.specifications.polygons.toLocaleString()} poly
              </span>
              <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">
                {product.specifications.version}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.discount ? (
                <>
                  <span className="text-xl font-bold text-yellow-500">
                    ${finalPrice.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-yellow-500">
                  ${product.price.toFixed(1)}
                </span>
              )}
            </div>

            {/* Quick View Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Open quick view modal
              }}
              className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}