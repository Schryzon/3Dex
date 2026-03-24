'use client';

import Link from 'next/link';
import { Shield, Zap, Award, Globe, Clock, Heart } from 'lucide-react';
import { useInView } from '@/lib/hooks/useInView';
import { useQuery } from '@tanstack/react-query';
import { analyticsService, analyticsKeys } from '@/lib/api/services/analytics.service';

export default function FeaturesSection() {
    const { ref: leftRef, inView: leftVisible } = useInView({ threshold: 0.1 });
    const { ref: rightRef, inView: rightVisible } = useInView({ threshold: 0.1 });
    const { ref: bannerRef, inView: bannerVisible } = useInView({ threshold: 0.2 });

    const { data: stats } = useQuery({
        queryKey: analyticsKeys.publicStats,
        queryFn: () => analyticsService.getPublicStats()
    });

    const displayStats = [
        { value: stats ? `${stats.models}+` : '...', label: '3D Assets' },
        { value: stats ? `${stats.customers}+` : '...', label: 'Customers' },
        { value: stats ? `${stats.artists}+` : '...', label: 'Artists' },
        { value: '4.9★', label: 'Avg Rating' },
    ];

    return (
        <section className="relative py-14 md:py-20 bg-[#040404] overflow-hidden">

            {/* Dot grid for depth */}
            <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
            {/* Noise / grain texture via SVG filter */}
            <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3CfilterGenerated id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10">

                {/* Split layout: text left, bento grid right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">

                    {/* Left: headline + description */}
                    <div
                        ref={leftRef}
                        style={{ opacity: leftVisible ? 1 : 0, transform: leftVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
                        className="lg:sticky lg:top-28"
                    >
                        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-yellow-400/70 mb-4">Why 3Dēx</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-6">
                            Built for creators,<br />
                            <em className="not-italic text-yellow-400">by creators.</em>
                        </h2>
                        <p className="text-gray-500 leading-relaxed mb-8 max-w-sm">
                            We believe great tools should get out of the way. Everything on 3Dēx is designed to help you spend less time searching and more time building.
                        </p>
                        {/* Mini stats */}
                        <div className="grid grid-cols-2 gap-5">
                            {displayStats.map(stat => (
                                <div key={stat.label} className="border border-white/[0.07] rounded-xl px-4 py-3 bg-white/[0.02]">
                                    <div className="text-2xl font-black text-yellow-400">{stat.value}</div>
                                    <div className="text-xs text-gray-600 mt-0.5">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: bento feature grid */}
                    <div
                        ref={rightRef}
                        className="grid grid-cols-2 gap-4"
                    >
                        {[
                            { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/15', title: 'Curated Quality', desc: 'Every asset reviewed before publish. Only production-ready work.', span: 'col-span-2' },
                            { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15', title: 'Instant Download', desc: 'Assets available the moment payment clears.', span: '' },
                            { icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/15', title: 'Commercial License', desc: 'Use in personal and commercial projects confidently.', span: '' },
                            { icon: Globe, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/15', title: 'Global Community', desc: 'Connect with artists worldwide.', span: '' },
                            { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/15', title: 'Always Available', desc: 'Your library, online forever.', span: '' },
                            { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15', title: 'Artist First', desc: 'Low fees, full ownership, fair revenue.', span: 'col-span-2' },
                        ].map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    style={{ opacity: rightVisible ? 1 : 0, transform: rightVisible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s` }}
                                    className={`${feature.span} group rounded-2xl border ${feature.border} bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-opacity-40 transition-all duration-300`}
                                >
                                    <div className={`w-9 h-9 rounded-lg ${feature.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`w-4.5 h-4.5 ${feature.color}`} style={{ width: '18px', height: '18px' }} />
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
                                    <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* CTA Banner — full-width, image bg */}
                <div
                    ref={bannerRef}
                    style={{ opacity: bannerVisible ? 1 : 0, transform: bannerVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
                    className="relative rounded-2xl overflow-hidden border border-white/[0.06]"
                >
                    <img
                        src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1600&q=80"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />

                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-10 md:p-12">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-yellow-400/70 mb-2">For artists</p>
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                                Ready to sell your work?
                            </h3>
                            <p className="text-gray-400 text-sm max-w-md">
                                Upload your first asset today. Join {stats ? stats.artists : ''}+ artists already earning on 3Dēx and reach thousands of buyers worldwide.
                            </p>
                        </div>
                        <Link
                            href="/become-artist"
                            className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl text-sm transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:shadow-yellow-400/20"
                        >
                            Start Selling
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}
