import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-lg w-full">
                {/* Icon Container */}
                <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse blur-xl" />
                    <div className="relative bg-[#111] border-2 border-red-500/50 rounded-full w-full h-full flex items-center justify-center shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
                        <ShieldAlert className="w-16 h-16 text-red-500" />
                    </div>
                </div>

                <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 mb-4 tracking-tighter">
                    403
                </h1>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Access Denied
                </h2>

                <p className="text-gray-400 mb-10 text-lg">
                    This area is highly classified. You don't have the required clearance to view this page.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Return to Base
                    </Link>
                </div>
            </div>

            {/* Subtle decorative grid/lines to match 3Dex aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none opacity-20" />
        </div>
    );
}
