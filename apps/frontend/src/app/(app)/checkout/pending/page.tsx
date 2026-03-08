'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Suspense } from 'react';

function PendingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full bg-gray-900/40 border border-white/5 rounded-[48px] p-10 backdrop-blur-2xl text-center relative z-10 animate-in zoom-in-95 duration-500">
                <div className="mb-10">
                    <div className="w-24 h-24 bg-yellow-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                        <Clock className="w-12 h-12 text-black" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                        Payment Pending
                    </h1>
                    <p className="text-gray-400 font-medium px-4">
                        We're waiting for your payment to be confirmed.
                    </p>
                </div>

                {orderId && (
                    <div className="bg-black/40 rounded-3xl border border-white/5 p-6 mb-8">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Order Reference</p>
                        <p className="text-xl font-mono font-bold text-yellow-400">#{orderId.slice(-12).toUpperCase()}</p>
                    </div>
                )}

                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 mb-10">
                    <p className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest leading-relaxed">
                        Assets will be unlocked automatically once payment is settled.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl"
                        onClick={() => router.push('/cart')}
                    >
                        <RefreshCw className="w-5 h-5" />
                        Check My Invoices
                    </button>

                    <button
                        className="w-full py-4 text-gray-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        Return to Homepage
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPendingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <PendingContent />
        </Suspense>
    );
}
