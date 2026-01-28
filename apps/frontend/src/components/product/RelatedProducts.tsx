'use client';

import { useEffect, useState } from 'react';
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
  productId: string;
  categories: string[];
}

export default function RelatedProducts({ productId, categories }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [productId, categories]);

  const fetchRelatedProducts = async () => {
    try {
      const categoryQuery = categories.map(cat => `category=${encodeURIComponent(cat)}`).join('&');
      const response = await fetch(`/api/products/related?productId=${productId}&${categoryQuery}&limit=8`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#141414] rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-800"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                <div className="h-5 bg-gray-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Related Products</h2>
        <button className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1">
          View All
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}