'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useInView } from '@/lib/hooks/useInView';

const PERKS = [
    'Keep up to 80% of every sale',
    'Instant payout after purchase',
    'Free uploads no listing fees',
    'Commercial license built-in',
    'Analytics & download tracking',
    'Join a community of 500+ artists',
];

export default function BecomeArtist() {
    const { ref, inView } = useInView({ threshold: 0.1 });

    return (
        <section className="relative py-14 md:py-20 bg-[#050505] overflow-hidden">

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
            {/* Dot grid */}
            <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
            {/* Yellow glow left */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 40% 60% at 0% 50%, rgba(250,204,21,0.12) 0%, rgba(250,204,21,0) 70%)' }} />

            <div ref={ref} className="relative max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left: copy */}
                <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
                    <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-yellow-400/70 mb-3">For artists</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-5">
                        Turn your passion<br />
                        <em className="not-italic text-yellow-400">into income.</em>
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-8 max-w-md">
                        Upload your 3D models, textures, and assets once,earn every time someone downloads. Your work, your price, your terms.
                    </p>

                    {/* Perks list */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                        {PERKS.map(perk => (
                            <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-400">
                                <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                                {perk}
                            </li>
                        ))}
                    </ul>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/become-artist"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl text-sm transition-all duration-300 hover:scale-[1.04] hover:shadow-lg hover:shadow-yellow-400/20"
                        >
                            Become an Artist
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:bg-white/5"
                        >
                            Browse catalog first
                        </Link>
                    </div>
                </div>

                {/* Right: image with overlay cards */}
                <div
                    style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(24px)', transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s' }}
                    className="relative hidden lg:block"
                >
                    {/* Main image */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] aspect-[4/3]">
                        <img
                            src="/category-3d-models.jpg"
                            alt="Artist workspace"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                    </div>

                    {/* Floating stat cards */}
                    <div className="absolute -bottom-4 -left-4 bg-[#111] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                        <p className="text-xs text-gray-500 mb-0.5">Avg. monthly earnings</p>
                        <p className="text-xl font-black text-yellow-400">Rp 2.4M</p>
                    </div>
                    <div className="absolute -top-4 -right-4 bg-[#111] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                        <p className="text-xs text-gray-500 mb-0.5">Active sellers</p>
                        <p className="text-xl font-black text-white">500+</p>
                    </div>
                </div>

            </div>
        </section>
    );
}
