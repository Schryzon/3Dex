'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { useEffect } from 'react';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');

    useEffect(() => {
        // Confetti or celebration animation could go here
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Your order has been confirmed
                    </p>
                </div>

                {orderId && (
                    <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-6 mb-6">
                        <p className="text-sm text-gray-400 mb-1">Order ID</p>
                        <p className="text-xl font-mono font-bold text-white">{orderId}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full gap-2"
                        onClick={() => router.push('/collections')}
                    >
                        <Download className="w-5 h-5" />
                        View My Assets
                    </Button>

                    <Button
                        variant="ghost"
                        size="md"
                        className="w-full gap-2"
                        onClick={() => router.push('/catalog')}
                    >
                        Continue Shopping
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                    A confirmation email has been sent to your inbox
                </p>
            </div>
        </div>
    );
}
