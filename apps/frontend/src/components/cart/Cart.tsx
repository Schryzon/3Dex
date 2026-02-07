'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart, CartItem, OrderRecord } from '@/lib/hooks/useCart';
import { api } from '@/lib/api';
import {
  ShoppingCart,
  ArrowLeft,
  CreditCard,
  Building2,
  Trash2,
  CheckCircle,
  Package,
  Calendar,
  ExternalLink,
  Loader2,
  ShieldCheck,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';

declare global {
  interface Window {
    snap: any;
  }
}

const EXCHANGE_RATE = 16800;

export default function ShoppingCartPage() {
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: ''
  });

  // Use real cart data
  const { items, removeItem, total, clearCart, completeOrder, orders } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCartEmpty = items.length === 0;

  const formatPrice = (amount: number) => {
    const idr = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

    const usd = (amount / EXCHANGE_RATE).toFixed(2);

    return { idr, usd };
  };

  const handleCheckout = async () => {
    if (isCartEmpty) return;

    // Simple validation (can be expanded)
    // if (!formData.firstName) {
    //   alert('Please fill in your details.');
    //   return;
    // }

    setIsProcessing(true);

    try {
      // 1. Initiate Order on Backend
      const response = await api.post('/orders/checkout', {
        model_ids: items.map((item: CartItem) => item.id)
      });

      const { token } = response.data;

      // 2. Trigger Snap Popup
      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: function (result: any) {
            console.log('Payment Success:', result);
            completeOrder('Midtrans'); // Clear cart and add to local records (backend handles real logic)
            setIsSuccess(true);
            setIsProcessing(false);
          },
          onPending: function (result: any) {
            console.log('Payment Pending:', result);
            setIsProcessing(false);
            alert('Payment pending... please complete payment.');
          },
          onError: function (result: any) {
            console.error('Payment Error:', result);
            setIsProcessing(false);
            alert('Payment failed. Please try again.');
          },
          onClose: function () {
            console.log('Customer closed the popup without finishing the payment');
            setIsProcessing(false);
          }
        });
      } else {
        console.error('Snap.js not loaded');
        alert('Payment gateway not ready. Please refresh.');
        setIsProcessing(false);
      }

    } catch (error: any) {
      console.error('Checkout failed:', error);
      alert('Checkout failed: ' + (error.response?.data?.message || error.message));
      setIsProcessing(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header & Tabs */}
      <div className="border-b border-gray-800 bg-gray-900/10 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-yellow-400" />
                Shopping Cart
              </h1>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Review items and secure checkout</p>
            </div>

            <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800 self-start">
              <button
                onClick={() => setActiveTab('cart')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'cart' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Products ({items.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Invoices ({orders.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {activeTab === 'cart' ? (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* ITEM LIST */}
            <div className="flex-1 space-y-6">
              {!isCartEmpty ? (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-gray-900">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selected Assets</span>
                    <button onClick={clearCart} className="text-[10px] font-bold text-red-400/60 hover:text-red-400 uppercase tracking-widest cursor-pointer">Flush Cart</button>
                  </div>

                  {items.map((item: CartItem) => {
                    const price = formatPrice(item.price);
                    return (
                      <div key={item.id} className="group relative flex gap-6 p-4 rounded-3xl bg-gray-900/20 border border-white/5 hover:border-white/10 transition-all">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-black border border-white/5">
                          <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight group-hover:text-yellow-400 transition-colors">{item.title}</h3>
                              <button onClick={() => removeItem(item.id)} className="p-2 text-gray-700 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <p className="text-sm text-gray-500">Artist: <span className="text-gray-300">@{item.author}</span></p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-gray-400 uppercase">.GLB</span>
                              <span className="px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 rounded text-[9px] font-bold text-yellow-500 uppercase">License: PRO</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold text-white block">{price.idr}</span>
                              <span className="text-xs text-gray-500 font-mono">~${price.usd}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="py-24 text-center border-2 border-dashed border-gray-900 rounded-[40px] px-10">
                  <div className="w-24 h-24 bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-10 h-10 text-gray-700" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Cart is empty</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mb-8 text-sm">Your creative journey starts here. Add some high-quality 3D models to get started.</p>
                  <Link href="/catalog" className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-2xl hover:bg-yellow-400 transition-all cursor-pointer">
                    Explore Models <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* CHECKOUT SIDEBAR */}
            {!isCartEmpty && (
              <div className="w-full lg:w-[420px] shrink-0">
                <div className="bg-[#0c0c0c] border border-gray-800 rounded-[32px] p-8 sticky top-32 shadow-2xl">
                  <div className="flex items-center gap-2 text-green-400 text-[10px] font-bold uppercase tracking-widest mb-6 border border-green-500/20 bg-green-500/5 w-fit px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Secure Checkout
                  </div>

                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-yellow-400 outline-none transition-all"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-yellow-400 outline-none transition-all"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Email or Contact Number"
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-4 text-sm focus:border-yellow-400 outline-none transition-all"
                      value={formData.contact}
                      onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>

                  <div className="py-6 border-y border-gray-900 my-6 space-y-3">
                    <div className="flex justify-between text-gray-500 text-sm">
                      <span>Platform Fee</span>
                      <span className="text-white font-mono">Rp 0</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold">Total</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-yellow-400 font-mono block">
                          {formatPrice(total).idr}
                        </span>
                        <span className="text-sm text-gray-500 font-mono">
                          ~${formatPrice(total).usd}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="p-4 bg-gray-900/30 rounded-2xl border border-gray-800">
                      <p className="text-xs text-gray-400 text-center">
                        Payments are processed securely by <strong>Midtrans</strong>.
                      </p>
                      <div className="flex justify-center gap-2 mt-3 opacity-50">
                        <CreditCard className="w-6 h-6" />
                        <Building2 className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-[20px] shadow-[0_15px_40px_rgba(250,204,21,0.2)] transition-all flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                    {isProcessing ? 'Processing via Midtrans...' : 'Pay with Midtrans'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ORDER RECORD COMPONENT */
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            {orders.length === 0 ? (
              <div className="py-32 text-center border-2 border-dashed border-gray-900 rounded-[40px]">
                <Package className="w-16 h-16 text-gray-800 mx-auto mb-6" />
                <h3 className="text-xl font-bold">No assets purchased yet</h3>
                <p className="text-gray-500 text-sm mt-2">Your purchase history will appear here.</p>
              </div>
            ) : (
              orders.map((order: OrderRecord) => {
                const totalFormatted = formatPrice(order.total);
                return (
                  <div key={order.id} className="bg-gray-900/20 border border-gray-800 rounded-[32px] overflow-hidden">
                    <div className="p-6 bg-gray-900/40 border-b border-gray-800 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Invoice #{order.id}</p>
                        <div className="flex items-center gap-3 text-sm font-bold text-white">
                          <Calendar className="w-4 h-4 text-gray-500" /> {new Date(order.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Amount</p>
                        <p className="text-2xl font-bold text-yellow-400">{totalFormatted.idr}</p>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {order.items.map((item: CartItem) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-black" alt="" />
                            <div>
                              <p className="font-bold text-white">{item.title}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">@{item.author}</p>
                            </div>
                          </div>
                          <button className="px-5 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded-lg hover:bg-blue-500/20 transition-all flex items-center gap-2 cursor-pointer">
                            <ExternalLink className="w-3 h-3" /> Download Assets
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* SUCCESS MODAL OVERLAY */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(34,197,94,0.3)]">
              <CheckCircle className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-10">Your payment was processing successfully. Check your invoices.</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setIsSuccess(false); setActiveTab('orders'); }}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-yellow-400 transition-all cursor-pointer shadow-xl"
              >
                Go to Invoices
              </button>
              <button
                onClick={() => { setIsSuccess(false); }}
                className="text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Dismiss Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}