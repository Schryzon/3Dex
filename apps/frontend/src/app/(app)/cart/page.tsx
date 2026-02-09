'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { items, isLoading, total, updateQuantity, removeItem, isUpdating, isRemoving } = useCart();

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/');
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading cart...</p>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity({ itemId, quantity: newQuantity });
    } catch (error) {
      alert('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (confirm('Remove this item from cart?')) {
      try {
        await removeItem(itemId);
      } catch (error) {
        alert('Failed to remove item');
      }
    }
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Shopping Cart</h1>

          <div className="flex flex-col items-center justify-center py-20 bg-gray-800/20 rounded-2xl border border-gray-800">
            <ShoppingBag className="w-24 h-24 text-gray-600 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Start adding some amazing 3D models!</p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/catalog')}
            >
              Browse Catalog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800/40 rounded-xl border border-gray-700 p-4 md:p-6 hover:bg-gray-800/60 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.model.id}`}
                    className="shrink-0"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-400 transition-colors">
                      {item.model.thumbnails?.[0] ? (
                        <img
                          src={item.model.thumbnails[0]}
                          alt={item.model.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.model.id}`}
                      className="block group"
                    >
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors truncate">
                        {item.model.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-400 mb-2">
                      by {item.model.artist.username}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.model.fileFormat.slice(0, 3).map((format, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {format}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                          className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>

                        <span className="w-12 text-center font-semibold text-white">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-4">
                        <p className="text-xl md:text-2xl font-bold text-white">
                          {formatPrice(item.model.price * item.quantity)}
                        </p>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemoving}
                          className="p-2 hover:bg-red-600/20 text-red-500 hover:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span className="text-yellow-400">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full gap-2 mb-3"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="md"
                className="w-full"
                onClick={() => router.push('/catalog')}
              >
                Continue Shopping
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center mb-3">
                  Secure checkout powered by Midtrans
                </p>
                <div className="flex items-center justify-center gap-3 text-gray-600">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                  </svg>
                  <span className="text-xs">256-bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}