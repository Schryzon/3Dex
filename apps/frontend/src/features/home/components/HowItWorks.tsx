'use client';

import Link from 'next/link';
import { Search, ShoppingCart, Download, CheckCircle } from 'lucide-react';
import { useInView } from '@/lib/hooks/useInView';

export default function HowItWorks() {
    const { ref, inView } = useInView({ threshold: 0.1 });

    return (
        <section className="relative py-14 md:py-20 overflow-hidden bg-[#090909]">

            {/* Fine line grid for depth */}
            <div className="absolute inset-0 bg-line-grid pointer-events-none" />
            {/* Section background: Unsplash image faded out */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=1920&q=60"
                    alt=""
                    className="w-full h-full object-cover opacity-[0.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
            </div>
            {/* Centered yellow glow */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(250,204,21,0.12) 0%, rgba(250,204,21,0) 70%)' }} />

            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10">

                {/* Header — centered for this section */}
                <div className="text-center mb-12">
                    <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-yellow-400/70 mb-3">How it works</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1]">
                        Up and running in<br />
                        <em className="not-italic text-yellow-400">three steps.</em>
                    </h2>
                </div>

                {/* Steps — horizontal, connected by numbers */}
                <div ref={ref} className="relative">

                    {/* Connector line */}
                    <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-yellow-400/10 via-yellow-400/30 to-yellow-400/10" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">

                        {/* Step 01 */}
                        <div
                            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.6s ease 0s, transform 0.6s ease 0s' }}
                            className="group flex flex-col items-center md:items-start text-center md:text-left"
                        >
                            {/* Number bubble on the connector */}
                            <div className="w-16 h-16 rounded-full bg-[#0d0d0d] border border-yellow-400/30 flex items-center justify-center mb-8 shrink-0 group-hover:border-yellow-400/70 transition-colors duration-300">
                                <span className="text-yellow-400 font-black text-lg">01</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Search className="w-5 h-5 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-black text-white">Discover</h3>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Browse thousands of curated 3D models, textures, and assets. Filter by format, polygon count, license, and more.
                            </p>
                            <ul className="mt-4 space-y-1.5">
                                {['Advanced search & filters', 'Preview before purchase', 'Verified artist profiles'].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                                        <CheckCircle className="w-3.5 h-3.5 text-yellow-400/60 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Step 02 */}
                        <div
                            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s' }}
                            className="group flex flex-col items-center md:items-start text-center md:text-left"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#0d0d0d] border border-yellow-400/30 flex items-center justify-center mb-8 shrink-0 group-hover:border-yellow-400/70 transition-colors duration-300">
                                <span className="text-yellow-400 font-black text-lg">02</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                    <ShoppingCart className="w-5 h-5 text-yellow-400" />
                                </div>
                                <h3 className="text-xl font-black text-white">Purchase</h3>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Secure checkout via Midtrans. Payment confirmed instantly, access granted in seconds — no subscriptions required.
                            </p>
                            <ul className="mt-4 space-y-1.5">
                                {['One-time purchase', 'Secure payment gateway', 'Instant order confirmation'].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                                        <CheckCircle className="w-3.5 h-3.5 text-yellow-400/60 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Step 03 */}
                        <div
                            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s' }}
                            className="group flex flex-col items-center md:items-start text-center md:text-left"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#0d0d0d] border border-yellow-400/30 flex items-center justify-center mb-8 shrink-0 group-hover:border-yellow-400/70 transition-colors duration-300">
                                <span className="text-yellow-400 font-black text-lg">03</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                    <Download className="w-5 h-5 text-green-400" />
                                </div>
                                <h3 className="text-xl font-black text-white">Create</h3>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Download in your preferred format. Commercial license included. Your library stays online — access any time.
                            </p>
                            <ul className="mt-4 space-y-1.5">
                                {['Multiple file formats', 'Commercial use license', 'Lifetime access to downloads'].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                                        <CheckCircle className="w-3.5 h-3.5 text-yellow-400/60 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl text-sm transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:shadow-yellow-400/20"
                    >
                        Start browsing now
                    </Link>
                </div>

            </div>
        </section>
    );
}
