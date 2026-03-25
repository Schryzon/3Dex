'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Unhandled Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Icon */}
                <div className="relative mx-auto w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/10">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Something went wrong
                    </h1>
                    <p className="text-gray-500 leading-relaxed text-sm">
                        An unexpected error occurred while processing your request. 
                        Don't worry, your data is safe—our engineers have been notified.
                    </p>
                    {error.digest && (
                        <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest mt-4">
                            ID: {error.digest}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        onClick={() => reset()}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-400 text-black font-black rounded-xl hover:bg-yellow-300 transition-all active:scale-95 shadow-lg shadow-yellow-400/20"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all transition-all active:scale-95"
                    >
                        <Home className="w-4 h-4 text-gray-400" />
                        Go Home
                    </Link>
                </div>
                
                <p className="text-xs text-gray-600">
                    If the problem persists, please contact <span className="text-gray-400">3dexweb@gmail.com</span>
                </p>
            </div>
        </div>
    );
}
