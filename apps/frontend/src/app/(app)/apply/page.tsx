'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Printer, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth';

export default function ApplyHubPage() {
    const { isAuthenticated, isLoading } = useAuth();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-20 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,#2a2a2a_0%,transparent_70%)] pointer-events-none opacity-50" />

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div className="text-center space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-sm font-semibold text-gray-400 mb-2 shadow-2xl">
                        <ShieldCheck className="w-4 h-4 text-yellow-400" />
                        Join the 3Dēx Creator Network
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 pb-2">
                        How do you want to <br className="hidden sm:block" /> build with us?
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Whether you design high-quality 3D assets or operate professional printing equipment,
                        there's a place for you in our ecosystem.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Artist Option */}
                    <div className="group relative bg-gray-900/40 p-1 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-[#0a0a0a] border border-gray-800 rounded-[22px] h-full p-8 sm:p-10 flex flex-col justify-between overflow-hidden transition-colors group-hover:border-yellow-400/50">
                            <div className="space-y-6 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.1)] group-hover:shadow-[0_0_40px_rgba(250,204,21,0.2)] transition-shadow">
                                    <Sparkles className="w-8 h-8 text-yellow-400" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold">Become an Artist</h2>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        Monetize your creativity. Upload your 3D models, set your prices, and sell to a global network of makers and studios.
                                    </p>
                                </div>
                                <ul className="space-y-3 text-sm text-gray-500 font-medium pb-8 border-b border-gray-800/50">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Keep full copyright of your work</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Earn up to 85% on every sale</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Detailed analytics and stats</li>
                                </ul>
                            </div>

                            <div className="pt-8">
                                <Link href="/become-artist" className="w-full py-4 px-6 bg-white text-black font-black rounded-xl flex items-center justify-between group-hover:bg-yellow-400 transition-colors">
                                    Apply as Artist
                                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Provider Option */}
                    <div className="group relative bg-gray-900/40 p-1 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-[#0a0a0a] border border-gray-800 rounded-[22px] h-full p-8 sm:p-10 flex flex-col justify-between overflow-hidden transition-colors group-hover:border-blue-400/50">
                            <div className="space-y-6 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shadow-[0_0_30px_rgba(96,165,250,0.1)] group-hover:shadow-[0_0_40px_rgba(96,165,250,0.2)] transition-shadow">
                                    <Printer className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold">Become a Provider</h2>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        Turn idle printers into profit. Provide physical 3D printing services for marketplace buyers in your region.
                                    </p>
                                </div>
                                <ul className="space-y-3 text-sm text-gray-500 font-medium pb-8 border-b border-gray-800/50">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Receive direct print orders</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Set your own base pricing</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Build local customer base</li>
                                </ul>
                            </div>

                            <div className="pt-8">
                                <Link href="/become-provider" className="w-full py-4 px-6 bg-white text-black font-black rounded-xl flex items-center justify-between group-hover:bg-blue-400 transition-colors">
                                    Apply as Provider
                                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {!isAuthenticated && !isLoading && (
                    <div className="mt-12 text-center text-sm text-gray-500 animate-in fade-in duration-1000 delay-500">
                        You will need to <Link href="/" className="text-white font-semibold underline underline-offset-4">log in</Link> before applying.
                    </div>
                )}
            </div>
        </div>
    );
}

function Check({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}
