'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowRight,
  Package,
  Heart,
  ShoppingCart,
  Download,
  Sparkles,
  LayoutGrid,
  Upload,
  Clock,
  ChevronRight,
  Users,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { api } from '@/lib/api';
import { orderService, orderKeys } from '@/lib/api/services/order.service';
import { wishlistService, wishlistKeys } from '@/lib/api/services/wishlist.service';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { CatalogProductCard } from '@/features/catalog/components/product-card';
import { ROUTES } from '@/lib/constants/routes';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';
import type { Model } from '@/types/catalog';

function orderStatusLabel(status: Order['status']) {
  const map: Record<Order['status'], string> = {
    PENDING: 'Pending payment',
    PAID: 'Paid',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  return map[status] || status;
}

function ModelMiniCard({ model }: { model: Model }) {
  const img = model.thumbnails?.[0] || '/placeholder-model.jpg';
  return (
    <Link
      href={`/catalog/${model.id}`}
      className="group flex gap-3 rounded-xl border border-white/[0.06] bg-[#111] p-3 transition-colors hover:border-yellow-500/30 relative overflow-hidden"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" className={`h-full w-full object-cover transition-all group-hover:scale-105 ${model.is_nsfw ? 'blur-md' : ''}`} />
        {model.is_nsfw && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="text-[8px] font-black text-white px-1 bg-red-600 rounded-sm">NSFW</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-white group-hover:text-yellow-400/90">{model.title}</p>
        <p className="mt-1 text-xs text-gray-500">@{model.artist?.username || 'artist'}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-600 group-hover:text-gray-400" />
    </Link>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const { items: cartItems } = useCart();
  const isCreator = user?.role === 'ARTIST' || user?.role === 'PROVIDER';

  const { data: engagementStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/posts/stats');
      return res.data as { month: { likes: number; comments: number }; year: { likes: number; comments: number } };
    },
    enabled: isCreator,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: orderKeys.all,
    queryFn: () => orderService.getOrders(),
  });

  const { data: wishlist = [], isLoading: wishLoading } = useQuery({
    queryKey: wishlistKeys.all,
    queryFn: () => wishlistService.getWishlist(),
  });

  const { data: recommended, isLoading: recLoading } = useProducts({
    sort: 'rating',
    limit: 10,
  });

  const savedCount = wishlist.length;
  const cartCount = cartItems.length;
  const activeOrders = orders.filter((o) =>
    ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED'].includes(o.status)
  ).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const wishlistModels = wishlist
    .map((w) => w.model)
    .filter((m): m is Model => !!m && (!m.is_nsfw || !!user?.show_nsfw))
    .slice(0, 6);

  const recommendedModels: Model[] = (recommended?.data || [])
    .filter((m: any) => m && (!m.is_nsfw || !!user?.show_nsfw))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-6 md:p-8">
      {/* greeting stats */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#141414] via-[#0f0f0f] to-[#0a0a0a] p-6 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/5 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/80">Your space</p>
            <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Welcome back, <span className="text-yellow-400">{user?.username}</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-gray-400">
              Pick up where you left off, orders, saves, and models worth your time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-white">{savedCount}</p>
              <p className="text-xs text-gray-500">Saved</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-white">{cartCount}</p>
              <p className="text-xs text-gray-500">In cart</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-white">{activeOrders}</p>
              <p className="text-xs text-gray-500">Active orders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href={ROUTES.PUBLIC.CATALOG}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#111] px-4 py-4 transition-colors hover:border-yellow-500/25 hover:bg-[#151515]"
          >
            <LayoutGrid className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-medium text-white">Browse catalog</span>
          </Link>
          <Link
            href={ROUTES.USER.CART}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#111] px-4 py-4 transition-colors hover:border-yellow-500/25 hover:bg-[#151515]"
          >
            <ShoppingCart className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-medium text-white">Cart</span>
          </Link>
          <Link
            href={ROUTES.USER.LIBRARY}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#111] px-4 py-4 transition-colors hover:border-yellow-500/25 hover:bg-[#151515]"
          >
            <Heart className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-medium text-white">Library</span>
          </Link>
          <Link
            href={ROUTES.USER.DOWNLOADS}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#111] px-4 py-4 transition-colors hover:border-yellow-500/25 hover:bg-[#151515]"
          >
            <Download className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-medium text-white">Downloads</span>
          </Link>
          {user?.role === 'ARTIST' && (
            <Link
              href={ROUTES.ARTIST.UPLOAD}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#111] px-4 py-4 transition-colors hover:border-yellow-500/25 hover:bg-[#151515] sm:col-span-2"
            >
              <Upload className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-white">Upload a model</span>
            </Link>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Cart preview */}
        <section className="rounded-2xl border border-white/[0.06] bg-[#111]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Cart</h3>
            </div>
            <Link href={ROUTES.USER.CART} className="text-xs font-medium text-yellow-400 hover:text-yellow-300">
              View cart
            </Link>
          </div>
          <div className="p-5">
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-500">Your cart is empty.{' '}
                <Link href={ROUTES.PUBLIC.CATALOG} className="text-yellow-400 hover:underline">
                  Browse models
                </Link>
              </p>
            ) : (
              <ul className="space-y-3">
                {cartItems.slice(0, 4).map((line) => (
                  <li key={line.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="line-clamp-1 text-gray-300">{line.model?.title || 'Model'}</span>
                    <span className="shrink-0 text-gray-500">×{line.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Recent orders */}
        <section className="rounded-2xl border border-white/[0.06] bg-[#111]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Recent orders</h3>
            </div>
            <Link href={ROUTES.USER.ORDERS} className="text-xs font-medium text-yellow-400 hover:text-yellow-300">
              All orders
            </Link>
          </div>
          <div className="p-5">
            {ordersLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="text-gray-200">
                        {format(new Date(o.created_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">{orderStatusLabel(o.status)}</p>
                    </div>
                    <span className="shrink-0 font-medium text-white">{formatPrice(o.total_amount).idr}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* From your saves */}
      {wishlistModels.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400/90" />
              <h2 className="text-lg font-bold text-white">From your saves</h2>
            </div>
            <Link
              href={ROUTES.USER.LIBRARY}
              className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300"
            >
              Library <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {wishLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : (
              wishlistModels.map((m) => <ModelMiniCard key={m.id} model={m} />)
            )}
          </div>
        </section>
      )}

      {/* Recommended for you */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Recommended for you</h2>
          </div>
          <Link
            href="/catalog?sort=rating"
            className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300"
          >
            Explore <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recLoading ? (
          <p className="text-sm text-gray-500">Loading models…</p>
        ) : recommendedModels.length === 0 ? (
          <p className="text-sm text-gray-500">No recommendations yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedModels.map((model) => (
              <CatalogProductCard
                key={model.id}
                id={model.id}
                title={model.title}
                image={model.thumbnails?.[0] || '/placeholder-model.jpg'}
                author={model.artist?.username || 'Unknown'}
                authorAvatar={model.artist?.avatar_url}
                price={model.price}
                isFree={model.price === 0}
                rating={model.rating}
                reviewCount={model.reviewCount}
                isNsfw={model.is_nsfw}
                formats={Array.isArray(model.fileFormat) ? model.fileFormat : []}
              />
            ))}
          </div>
        )}
      </section>

      {/* Creator engagement */}
      {isCreator && engagementStats && (
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414] p-6">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Community engagement</h2>
                <p className="text-sm text-gray-500">Reactions on your community posts</p>
              </div>
            </div>
            <Link
              href={ROUTES.PUBLIC.COMMUNITY}
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Open feed →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Past 30 days</p>
              <div className="mt-3 flex gap-6">
                <span className="flex items-center gap-2 text-xl font-bold text-white">
                  <Heart className="h-4 w-4 text-red-400" /> {engagementStats.month.likes}
                </span>
                <span className="flex items-center gap-2 text-xl font-bold text-white">
                  <MessageSquare className="h-4 w-4 text-blue-400" /> {engagementStats.month.comments}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Past year</p>
              <div className="mt-3 flex gap-6">
                <span className="flex items-center gap-2 text-xl font-bold text-white">
                  <Heart className="h-4 w-4 text-gray-400" /> {engagementStats.year.likes}
                </span>
                <span className="flex items-center gap-2 text-xl font-bold text-white">
                  <MessageSquare className="h-4 w-4 text-gray-400" /> {engagementStats.year.comments}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty state for new users: still show discovery */}
      {!wishLoading && savedCount === 0 && !recLoading && recommendedModels.length > 0 && (
        <section className="rounded-xl border border-dashed border-white/10 bg-[#0d0d0d] px-5 py-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
            <p className="text-sm text-gray-400">
              Save models you like to build your library recommendations will feel even more personal over time.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
