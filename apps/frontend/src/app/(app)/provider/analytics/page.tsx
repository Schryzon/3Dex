'use client';

import { BarChart3, Construction, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProviderAnalyticsPage() {
    const router = useRouter();

    return (
        <div className="p-6 md:p-10 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-gray-400 hover:text-yellow-400 transition-all group"
                    title="Back"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="w-7 h-7 text-yellow-500" /> Provider Analytics
                </h1>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-400/20">
                    <Construction className="w-10 h-10 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Feature Under Development</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                    The statistics panel for 3D printing services on 3Dex is being refined to help you track orders, revenue, and work efficiency.
                </p>
            </div>
        </div>
    );
}
