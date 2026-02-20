'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import { CreditCard, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { orderService, paymentService } from '@/lib/api/services';

declare global {
    interface Window {
        snap: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { items, total, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if not authenticated
    if (!authLoading && !user) {
        router.push('/');
        return null;
    }

    // Redirect if cart is empty
    if (!authLoading && items.length === 0) {
        router.push('/cart');
        return null;
    }

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // Initiate unified checkout
            const modelIds = items.map(item => item.model.id);
            const { orderId, token } = await orderService.checkout(modelIds);

            // 3. Open Midtrans Snap
            if (window.snap) {
                window.snap.pay(token, {
                    onSuccess: function (result: any) {
                        clearCart();
                        router.push(`/checkout/success?order=${orderId}`);
                    },
                    onPending: function (result: any) {
                        router.push(`/checkout/pending?order=${orderId}`);
                    },
                    onError: function (result: any) {
                        router.push(`/checkout/failed?order=${orderId}`);
                    },
                    onClose: function () {
                        setIsProcessing(false);
                    }
                });
            } else {
                throw new Error('Midtrans Snap not loaded');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to process checkout');
            setIsProcessing(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Order Summary
                            </h2>

                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 pb-4 border-b border-gray-700 last:border-0"
                                    >
                                        <div className="w-20 h-20 bg-gray-900 rounded-lg overflow-hidden shrink-0">
                                            {item.model.thumbnails?.[0] ? (
                                                <img
                                                    src={item.model.thumbnails[0]}
                                                    alt={item.model.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                                    No image
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate">
                                                {item.model.title}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                by {item.model.artist.username}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-gray-400">
                                                    Qty: {item.quantity}
                                                </span>
                                                <span className="font-semibold text-white">
                                                    {formatPrice(item.model.price * item.quantity).idr}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Payment Method
                            </h2>
                            <p className="text-gray-300 mb-4">
                                You will be redirected to Midtrans secure payment page to complete your purchase.
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                </svg>
                                <span>Secure payment powered by Midtrans</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-white mb-6">Payment Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span>{formatPrice(total).idr}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Processing Fee</span>
                                    <span>{formatPrice(0).idr}</span>
                                </div>
                                <div className="border-t border-gray-700 pt-3 mt-3">
                                    <div className="flex justify-between text-xl font-bold text-white">
                                        <span>Total</span>
                                        <span className="text-yellow-400">{formatPrice(total).idr}</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full gap-2 mt-6"
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Pay {formatPrice(total).idr}
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    By completing this purchase, you agree to our Terms of Service
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
