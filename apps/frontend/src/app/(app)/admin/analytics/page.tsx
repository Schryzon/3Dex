'use client';

import { BarChart3, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminAnalytics from '@/features/admin/components/AdminAnalytics';
import { Suspense } from 'react';

export default function AdminAnalyticsPage() {
    const router = useRouter();

    return (
        <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 h-10 w-10 flex items-center justify-center hover:bg-white/5 rounded-lg border border-white/10 text-gray-400 hover:text-yellow-400 transition-all group"
                    title="Back"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <div className="h-10 border-r border-white/10 mx-2" />
                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                    Admin <span className="text-gray-500">Analytics</span>
                </h1>
            </div>

            <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-500">Loading platform data...</div>}>
                <AdminAnalytics />
            </Suspense>
        </div>
    );
}
