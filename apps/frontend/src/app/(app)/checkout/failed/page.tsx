'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

export default function CheckoutFailedPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-16 h-16 text-red-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Payment Failed
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Something went wrong with your payment
                    </p>
                </div>

                {orderId && (
                    <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-6 mb-6">
                        <p className="text-sm text-gray-400 mb-1">Order ID</p>
                        <p className="text-xl font-mono font-bold text-white">{orderId}</p>
                    </div>
                )}

                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
                    <p className="text-sm text-red-400">
                        Your payment could not be processed. Please try again or contact support if the problem persists.
                    </p>
                </div>

                <div className="space-y-3">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full gap-2"
                        onClick={() => router.push('/checkout')}
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </Button>

                    <Button
                        variant="ghost"
                        size="md"
                        className="w-full gap-2"
                        onClick={() => router.push('/cart')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Cart
                    </Button>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                    Need help? Contact our support team
                </p>
            </div>
        </div>
    );
}
