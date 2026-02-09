'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

export default function CheckoutPendingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-16 h-16 text-yellow-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Payment Pending
                    </h1>
                    <p className="text-gray-400 text-lg">
                        We're waiting for your payment confirmation
                    </p>
                </div>

                {orderId && (
                    <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-6 mb-6">
                        <p className="text-sm text-gray-400 mb-1">Order ID</p>
                        <p className="text-xl font-mono font-bold text-white">{orderId}</p>
                    </div>
                )}

                <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 mb-6">
                    <p className="text-sm text-yellow-400">
                        Please complete your payment to access your digital assets. You can check your order status in your profile.
                    </p>
                </div>

                <div className="space-y-3">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full gap-2"
                        onClick={() => router.push('/profile/orders')}
                    >
                        <RefreshCw className="w-5 h-5" />
                        Check Order Status
                    </Button>

                    <Button
                        variant="ghost"
                        size="md"
                        className="w-full"
                        onClick={() => router.push('/')}
                    >
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
