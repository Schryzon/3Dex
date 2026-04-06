'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { CatalogProductCard } from '../product-card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useWishlist } from '@/features/catalog/hooks/useWishlist';

interface RelatedProduct {
  id: string;
  title: string;
  price: number;
  preview_url: string;
  artist: {
    username: string;
    avatar_url?: string;
  };
  is_nsfw?: boolean;
  rating?: number;
  reviewCount?: number;
  fileFormat?: string;
}

interface Props {
  productId: string;
  categories: string[];
}

export default function RelatedProducts({ productId, categories }: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();

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
          category: category,
          status: 'APPROVED'
        }
      });

      // Filter and Map backend models
      const filtered = (response.data || []).filter((m: any) => !m.is_nsfw || user?.show_nsfw);

      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-xl overflow-hidden animate-pulse border border-white/5">
              <div className="aspect-[3/4] bg-gray-800"></div>
              <div className="p-4 space-y-3 font-medium uppercase text-[10px] tracking-wider text-zinc-500">
                Loading Assets...
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Related <span className="text-yellow-400">Products</span></h2>
        <Link
          href={`/catalog?category=${categories?.[0] || ''}`}
          className="text-zinc-500 hover:text-white text-[11px] font-medium uppercase tracking-wider flex items-center gap-2 group transition-all"
        >
          View Full Catalog
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <CatalogProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            image={product.preview_url || '/placeholder.jpg'}
            author={product.artist?.username || 'Anonymous'}
            authorAvatar={product.artist?.avatar_url}
            price={product.price}
            isFree={product.price === 0}
            isSaved={isInWishlist(product.id)}
            onSave={() => toggleWishlist(product.id)}
            rating={product.avg_rating}
            reviewCount={product.review_count}
            isNsfw={product.is_nsfw}
            formats={[product.file_format || 'GLB']}
          />
        ))}
      </div>
    </div>
  );
}
