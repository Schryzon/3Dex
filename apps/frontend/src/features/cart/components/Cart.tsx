'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/features/cart';
import {
  ShoppingCart, Trash2, CheckCircle, Package,
  Calendar, ExternalLink, ShieldCheck, ChevronRight,
  ShoppingBag, CreditCard, Building2, Check, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/features/cart/hooks/useOrders';
import type { CartItem, Order } from '@/types';

const EXCHANGE_RATE = 16800;

function formatPrice(amount: number) {
  const idr = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
  const usd = (amount / EXCHANGE_RATE).toFixed(2);
  return { idr, usd };
}

const STATUS_STYLE: Record<string, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-yellow-400/10  text-yellow-400  border-yellow-400/20',
};

export default function ShoppingCartPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { items, removeItem, total, clearCart } = useCart();
  const { orders } = useOrders();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="min-h-screen bg-[#080808]" />;

  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-[#080808] text-white pb-24">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">

          {/* Title */}
          <h1 className="font-bold text-[20px] tracking-tight flex items-center gap-3">
            <ShoppingBag size={20} strokeWidth={1.5} className="text-yellow-400" />
            Shopping Cart
          </h1>

          {/* Tabs */}
          <div className="flex items-center bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 gap-1">
            {([
              { id: 'cart', label: 'Products', count: items.length },
              { id: 'orders', label: 'Invoices', count: orders.length },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                                    px-5 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer
                                    ${activeTab === tab.id
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/35 hover:text-white/70'
                  }
                                `}
              >
                {tab.label}
                <span className={`ml-1.5 text-[11px] ${activeTab === tab.id ? 'text-black/40' : 'text-white/20'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-10">

        {/*  CART TAB */}
        {activeTab === 'cart' && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-4 lg:mt-8 pb-32 lg:pb-0">
            {/* Main list */}
            <div className="flex-1 min-w-0">
              {!isEmpty ? (
                <>
                  <div className="flex items-center justify-between mb-4 lg:mb-6 px-1 lg:px-0">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30">
                      Items in Cart ({items.length})
                    </span>
                    <button
                      onClick={() => clearCart()}
                      className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 lg:gap-3.5">
                    {items.map((item: CartItem) => {
                      const price = formatPrice(item.model?.price ?? 0);
                      return (
                        <div
                          key={item.id}
                          className="group flex gap-4 lg:gap-5 p-4 lg:p-5 rounded-2xl bg-[#111111] border border-white/[0.07] hover:border-white/[0.12] transition-all"
                        >
                          {/* Thumb */}
                          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.04] border border-white/[0.06]">
                            <img
                              src={item.model?.thumbnails?.[0] || '/placeholder.jpg'}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 lg:py-1">
                            <div className="flex items-start justify-between gap-3 lg:gap-4">
                              <div className="min-w-0">
                                <h3 className="text-[14px] lg:text-[16px] font-bold tracking-tight truncate leading-tight lg:leading-snug group-hover:text-yellow-400 transition-colors">
                                  {item.model.title}
                                </h3>
                                <p className="text-[12px] lg:text-[13px] text-white/30 mt-0.5 lg:mt-1">
                                  @{item.model?.artist?.username || 'Unknown'}
                                </p>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 lg:p-2 text-white/15 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0 rounded-lg hover:bg-red-400/[0.08]"
                              >
                                <Trash2 size={14} className="lg:size-4" strokeWidth={1.5} />
                              </button>
                            </div>

                            <div className="flex items-end justify-between mt-3 lg:mt-4">
                              <div className="flex gap-1.5 lg:gap-2">
                                <span className="px-2 py-0.5 lg:px-2.5 lg:py-1 bg-white/[0.05] border border-white/[0.08] rounded text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.08em] text-white/35">
                                  {item.model?.fileFormat?.[0] || 'GLB'}
                                </span>
                                <span className="px-2 py-0.5 lg:px-2.5 lg:py-1 bg-yellow-400/[0.08] border border-yellow-400/[0.15] rounded text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.08em] text-yellow-400/70 hidden sm:inline-block">
                                  Pro License
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-[15px] lg:text-[18px] font-bold font-mono leading-none">{price.idr}</p>
                                <p className="text-[11px] lg:text-[12px] font-mono text-white/25 mt-0.5 lg:mt-1">~${price.usd}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="py-20 lg:py-32 text-center border border-dashed border-white/[0.07] rounded-3xl px-6 lg:px-10">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart size={28} strokeWidth={1} className="text-white/20 lg:size-8" />
                  </div>
                  <h3 className="text-[18px] lg:text-[20px] font-bold mb-2">Your cart is empty</h3>
                  <p className="text-[13px] lg:text-[14px] text-white/30 max-w-xs mx-auto mb-8 lg:mb-10 leading-relaxed">
                    Explore our collection of high-quality 3D models to get started.
                  </p>
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 bg-white text-black text-[13px] lg:text-[14px] font-bold px-7 lg:px-8 py-3.5 lg:py-4 rounded-2xl hover:bg-yellow-400 transition-colors cursor-pointer"
                  >
                    Explore Models
                    <ChevronRight size={16} />
                  </Link>
                </div>
              )}
            </div>

            {/* Summary sidebar */}
            {!isEmpty && (
              <>
                {/* Desktop sidebar */}
                <div className="hidden lg:block w-[380px] flex-shrink-0 sticky top-24">
                  <div className="bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden">
                    <div className="px-7 py-6 border-b border-white/[0.06]">
                      <h2 className="font-bold text-[15px] tracking-tight">Order Summary</h2>
                    </div>

                    <div className="px-7 py-7 flex flex-col gap-6">
                      {/* Rows */}
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-[14px]">
                          <span className="text-white/40">Subtotal ({items.length} items)</span>
                          <span className="font-mono text-[13px]">{formatPrice(total).idr}</span>
                        </div>
                        <div className="flex justify-between items-center text-[14px]">
                          <span className="text-white/40">Platform fee</span>
                          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-400 bg-emerald-500/[0.08] px-2 py-0.5 rounded">Free</span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-end pt-6 border-t border-white/[0.06]">
                        <span className="text-[16px] font-bold">Total</span>
                        <div className="text-right">
                          <p className="text-[28px] font-bold tracking-tight leading-none text-yellow-400">
                            {formatPrice(total).idr}
                          </p>
                          <p className="text-[12px] font-mono text-white/30 mt-1.5">
                            ≈ ${formatPrice(total).usd}
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => router.push('/checkout')}
                        className="
                          w-full flex items-center justify-between
                          px-6 py-5 rounded-2xl font-bold text-[15px] tracking-tight
                          bg-yellow-400 text-black
                          hover:bg-yellow-300 transition-all duration-150 cursor-pointer
                          hover:-translate-y-px active:translate-y-0 shadow-[0_8px_30px_rgb(250,204,21,0.1)]
                        "
                      >
                        <span>Proceed to Checkout</span>
                        <ChevronRight size={18} />
                      </button>

                      {/* Trust */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] mt-2">
                        <div className="flex items-center gap-2 text-[12px] text-white/25">
                          <ShieldCheck size={14} strokeWidth={1.5} />
                          Secured by Midtrans
                        </div>
                        <div className="flex items-center gap-3 opacity-25">
                          <CreditCard size={16} strokeWidth={1.5} />
                          <Building2 size={16} strokeWidth={1.5} />
                          <ShoppingBag size={16} strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Sticky Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/[0.08] px-6 py-5 safe-bottom">
                  <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-6">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 mb-0.5">Total Amount</p>
                      <p className="text-[20px] font-bold text-yellow-400 leading-none">{formatPrice(total).idr}</p>
                    </div>
                    <button
                      onClick={() => router.push('/checkout')}
                      className="flex-1 bg-yellow-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg"
                    >
                      Checkout
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════ ORDERS TAB ════════════ */}
        {activeTab === 'orders' && (
          <div className="max-w-3xl mx-auto flex flex-col gap-5">
            {orders.length === 0 ? (
              <div className="py-32 text-center border border-dashed border-white/[0.07] rounded-3xl">
                <div className="w-20 h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Package size={32} strokeWidth={1} className="text-white/20" />
                </div>
                <h3 className="text-[18px] font-bold mb-2">No purchases yet</h3>
                <p className="text-[14px] text-white/30 mt-1">Your purchase history will appear here.</p>
              </div>
            ) : (
              orders.map((order: Order) => {
                const amt = formatPrice((order as any).total_amount ?? (order as any).totalAmount ?? 0);
                const isPaid = order.status === 'PAID' || (order.status as string) === 'COMPLETED';
                const statusClass = STATUS_STYLE[order.status as string] ?? 'bg-red-500/10 text-red-400 border-red-500/20';

                return (
                  <div key={order.id} className="bg-[#111111] border border-white/[0.07] rounded-3xl overflow-hidden shadow-sm">

                    {/* Order header */}
                    <div className="px-7 py-6 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/20 mb-1.5">
                          Invoice #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar size={13} strokeWidth={1.5} className="text-white/25" />
                            <span className="text-[13px] font-medium text-white/50">
                              {new Date((order as any).created_at || order.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border ${statusClass}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/20 mb-1">Amount</p>
                        <p className="text-[22px] font-bold font-mono tracking-tight text-yellow-400">{amt.idr}</p>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="px-7 py-5 flex flex-col gap-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-5 py-1.5">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                            <img
                              src={item.model?.thumbnails?.[0] || '/placeholder.jpg'}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold truncate tracking-tight">{item.model?.title || 'Unknown'}</p>
                            <p className="text-[12px] text-white/30 uppercase tracking-widest font-medium mt-0.5">@{item.model?.artist?.username || 'Unknown'}</p>
                          </div>
                          {isPaid && (
                            <button className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all cursor-pointer">
                              <ExternalLink size={13} strokeWidth={2} />
                              Download
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── SUCCESS MODAL ── */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#111111] border border-white/[0.08] rounded-3xl max-w-sm w-full p-10 text-center shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Check size={32} strokeWidth={2.5} className="text-emerald-400" />
            </div>
            <h2 className="text-[24px] font-bold tracking-tight mb-3">Payment Successful</h2>
            <p className="text-[14px] text-white/40 mb-10 leading-relaxed">
              Your order has been confirmed. You can now download your 3D assets from your invoices.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setIsSuccess(false); setActiveTab('orders'); }}
                className="w-full py-4 bg-yellow-400 text-black text-[15px] font-bold rounded-2xl hover:bg-yellow-300 transition-colors cursor-pointer shadow-lg active:scale-[0.98]"
              >
                View Invoices
              </button>
              <button
                onClick={() => setIsSuccess(false)}
                className="w-full py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white/20 hover:text-white/50 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}