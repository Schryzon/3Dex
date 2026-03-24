'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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

  const formatted = formatPrice(finalPrice);

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
    <Link href={`/catalog/${product.id}`}>
      <div
        className="group relative bg-[#0c0c0c] rounded-xl overflow-hidden border border-white/[0.04] hover:border-yellow-400/30 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-yellow-400/5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
          <img
            src={product.thumbnails[imageIndex]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Subtle gradient by default, lighter opacity */}
          <div className={`absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/80 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-90' : 'opacity-40'}`} />

          {product.discount && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg shadow-green-500/20">
              -{product.discount}%
            </div>
          )}

          <button
            onClick={handleToggleFavorite}
            className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20 ${isFavorite
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
              : 'bg-black/40 text-white border border-white/10 hover:bg-white/20 hover:border-white/20'
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
                  className={`h-1.5 rounded-full transition-all duration-300 ${imageIndex === index
                    ? 'bg-yellow-500 w-6'
                    : 'bg-white/50 hover:bg-yellow-500/50 w-1.5'
                    }`}
                />
              ))}
            </div>
          )}

          {/* Info Overlay Panel (Minimalist) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-[#0c0c0c] to-transparent pointer-events-none">
            <div className="flex flex-col gap-1">
              <h3 className="text-white font-bold text-sm md:text-base line-clamp-1 group-hover:text-yellow-400 transition-colors">
                {product.title}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <img
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    className="w-4 h-4 rounded-full border border-white/10"
                  />
                  <p className="text-gray-500 text-[10px] md:text-xs font-medium truncate">{product.seller.name}</p>
                </div>
                {product.price === 0 ? (
                  <span className="text-blue-400 font-black text-sm tracking-tight shrink-0 ml-2">Free</span>
                ) : (
                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <span className="text-white font-black text-sm tracking-tight leading-none">
                      {formatted.idr}
                    </span>
                    <span className="text-gray-400 text-[10px] font-medium mt-0.5">
                      {formatted.usd}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Expandable section on hover */}
            <div className={`grid transition-all duration-500 ease-in-out ${isHovered ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-white/[0.05]' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="flex items-center justify-between pointer-events-auto">
                  {product.price === 0 ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/catalog/${product.id}`;
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-400 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-black text-[10px] font-black py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}