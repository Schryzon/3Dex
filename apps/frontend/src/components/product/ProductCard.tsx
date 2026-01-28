'use client';

import Link from 'next/link';
import { useState } from 'react';

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
        className="group bg-[#141414] rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          <img
            src={product.thumbnails[imageIndex]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 bg-gray-900/80 hover:bg-gray-800 p-2 rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <svg
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              fill={isFavorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Thumbnail Navigation */}
          {product.thumbnails.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {product.thumbnails.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    imageIndex === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Quick Add to Cart (on hover) */}
          {isHovered && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {product.title}
          </h3>

          {/* Seller Info */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-400">{product.seller.name}</span>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                {product.specifications.polygons.toLocaleString()} poly
              </span>
              <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">
                {product.specifications.version}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.discount ? (
                <>
                  <span className="text-xl font-bold text-white">${finalPrice.toFixed(1)}</span>
                  <span className="text-sm text-gray-500 line-through">${product.price.toFixed(1)}</span>
                </>
              ) : (
                <span className="text-xl font-bold text-white">${product.price.toFixed(1)}</span>
              )}
            </div>

            {/* Quick View Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Open quick view modal
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}