'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { ProductCard } from '../product-card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface RelatedProduct {
  id: string;
  title: string;
  price: number;
  preview_url: string;
  artist: {
    username: string;
    avatar_url?: string;
  };
}

interface Props {
  productId: string;
  categories: string[];
}

export default function RelatedProducts({ productId, categories }: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [productId, categories]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const category = categories && categories.length > 0 ? categories[0] : undefined;

      const response = await apiClient.get<any>('/models', {
        params: {
          exclude_id: productId,
          limit: 8,
          category: category, // Pass category name/slug
          status: 'APPROVED'
        }
      });

      // Map backend model to ProductCard's expected format
      // Note: Backend returns { data: [], meta: {} }
      const mappedProducts = (response.data || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        price: m.price,
        thumbnails: m.preview_url ? [m.preview_url] : ['/placeholder.jpg'],
        seller: {
          name: m.artist?.username || 'Anonymous',
          avatar: m.artist?.avatar_url || '/placeholder-avatar.jpg'
        },
        specifications: {
          version: '1.0'
        }
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg overflow-hidden animate-pulse">
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
        <h2 className="text-2xl font-bold text-white">Related Products</h2>
        <Link href={`/catalog?category=${categories?.[0] || ''}`} className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold flex items-center gap-1 transition-colors duration-300 group">
          View All
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}