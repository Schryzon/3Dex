'use client';

import { BarChart3, Construction } from 'lucide-react';

export default function ProviderAnalyticsPage() {
    return (
        <div className="p-6 md:p-10 space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-yellow-500" /> Provider Analytics
            </h1>

            <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-400/20">
                    <Construction className="w-10 h-10 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Fitur Sedang Dikembangkan</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                    Panel statistik untuk layanan cetak 3D di 3Dēx sedang disempurnakan untuk membantu Anda melacak pesanan, pendapatan, dan efisiensi waktu kerja.
                </p>
            </div>
        </div>
    );
}
