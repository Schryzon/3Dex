import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Box, Target, TrendingUp, Scale, Github,
    ArrowRight, Layers, Users, Printer, ShoppingCart, Star, ChevronRight, ExternalLink
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about 3Dēx — the 3D asset marketplace built by creators, for creators. Meet the team and discover our vision.',
};

const team = [
    {
        slug: 'jay',
        name: 'I Nyoman Widiyasa Jayananda',
        nickname: 'Jay',
        handle: 'Schryzon',
        role: 'Backend Engineer & SysAdmin',
        short: 'Architects the engine that powers 3Dēx — from API design and database modeling to cloud infrastructure and deployment pipelines.',
        gradient: 'from-violet-500 to-purple-700',
        linkedin: 'https://www.linkedin.com/in/schryzon/',
        githubUser: 'Schryzon',
    },
    {
        slug: 'mahesa',
        name: 'I Kadek Mahesa Permana Putra',
        nickname: 'Mahesa',
        handle: 'Vuxyn',
        role: 'Frontend Engineer & UI/UX',
        short: 'Crafts the visual identity and user experience of 3Dēx — every pixel, interaction, and interface component.',
        gradient: 'from-amber-400 to-orange-500',
        linkedin: 'https://www.linkedin.com/in/i-kadek-mahesa-permana-putra-655184320/',
        githubUser: 'Vuxyn',
    },
    {
        slug: 'thoriq',
        name: 'Thoriq Abdillah Falian Kusuma',
        nickname: 'Thoriq',
        handle: 'ganijack',
        role: 'Frontend Engineer & Integration',
        short: 'Bridges the gap between frontend and backend — implementing integrations, payment flows, and real-world feature delivery.',
        gradient: 'from-teal-400 to-cyan-600',
        linkedin: 'https://www.linkedin.com/in/thoriq-abdillah-falian-kusuma-433615289/',
        githubUser: 'ganijack',
    },
];

const goals = [
    {
        icon: Layers,
        title: 'Centralized 3D Ecosystem',
        description: 'Create a single platform where buyers, artists, and print providers can collaborate without switching tools or marketplaces.',
    },
    {
        icon: Users,
        title: 'Empower Local Creators',
        description: 'Give Indonesian 3D artists and print service providers a professional platform to monetize their skills and grow their audience.',
    },
    {
        icon: Star,
        title: 'Quality Over Quantity',
        description: 'Every model and provider on the platform goes through a review process to ensure reliability and creative excellence.',
    },
    {
        icon: TrendingUp,
        title: 'Sustainable Creative Economy',
        description: 'Build a fair revenue-sharing model that rewards creators while keeping prices accessible for buyers.',
    },
];

const businessModel = [
    {
        icon: ShoppingCart,
        title: 'Digital Asset Sales',
        description: 'Artists upload 3D models, textures, and media. Buyers purchase a Personal or Commercial license. 3Dēx takes a flat commission on each transaction.',
        tag: 'Marketplace',
    },
    {
        icon: Printer,
        title: '3D Print Services',
        description: 'Verified local providers list their printing capabilities. Buyers submit print jobs, pick a provider, and pay through the platform. 3Dēx facilitates fulfillment and handles payments.',
        tag: 'Services',
    },
    {
        icon: Users,
        title: 'Creator Network',
        description: 'Artists and providers apply and are vetted by admins. Community features (posts, likes, collections) drive organic discovery and retention.',
        tag: 'Community',
    },
];

export default function AboutUsPage() {
    return (
        <div className="min-h-screen bg-[#080808] text-white">
            {/* Minimal Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img src="/3Dex.svg" alt="3Dēx" className="w-8 h-8" />
                        <span className="font-black text-xl tracking-tighter">3Dēx</span>
                    </Link>
                    <Link
                        href="/catalog"
                        className="text-sm font-medium text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-2 group"
                    >
                        Back to Platform
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <div className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto px-6 pt-24 pb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Box className="w-3 h-3" />
                        About 3Dēx
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
                        The 3D Marketplace<br />
                        <span className="text-yellow-400">Built for Creators.</span>
                    </h1>
                    <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
                        3Dēx is a full-stack 3D asset and services marketplace where buyers can discover high-quality
                        models, commission print jobs from verified local providers, and connect with a community of
                        3D creators — all in one place.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-20 space-y-24">

                {/* What is 3Dēx */}
                <section>
                    <SectionLabel icon={Box} label="What is 3Dēx" />
                    <h2 className="text-3xl font-bold tracking-tight mb-6">One Platform. Three Roles.</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                role: 'Buyer',
                                color: 'border-yellow-400/30 bg-yellow-400/5',
                                accent: 'text-yellow-400',
                                desc: 'Discover and purchase 3D models with Personal or Commercial licenses. Commission print jobs from verified local providers. Build curated collections and interact with creators.',
                            },
                            {
                                role: 'Artist',
                                color: 'border-violet-400/30 bg-violet-400/5',
                                accent: 'text-violet-400',
                                desc: 'Upload and sell original 3D models, textures, and assets. Set your own pricing, licenses, and tags. Build a public profile with portfolio, social links, and follower stats.',
                            },
                            {
                                role: 'Provider',
                                color: 'border-teal-400/30 bg-teal-400/5',
                                accent: 'text-teal-400',
                                desc: 'List your 3D printing capabilities — materials, colors, printer types, and max build sizes. Accept print jobs submitted by buyers through a structured fulfillment workflow.',
                            },
                        ].map(item => (
                            <div key={item.role} className={`p-6 rounded-2xl border ${item.color}`}>
                                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${item.accent}`}>{item.role}</p>
                                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-8 text-white/50 text-[15px] leading-relaxed max-w-3xl">
                        All three roles are connected through a unified platform. Artists and Providers go through
                        an application and admin-approval process to ensure quality. The admin layer handles
                        moderation, analytics, and content management across the entire network.
                    </p>
                </section>

                {/* Goals */}
                <section>
                    <SectionLabel icon={Target} label="Our Goals" />
                    <h2 className="text-3xl font-bold tracking-tight mb-8">What We're Building Toward</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {goals.map(goal => {
                            const Icon = goal.icon;
                            return (
                                <div key={goal.title} className="flex gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold mb-1">{goal.title}</p>
                                        <p className="text-white/50 text-sm leading-relaxed">{goal.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Business Model */}
                <section>
                    <SectionLabel icon={TrendingUp} label="Business Model" />
                    <h2 className="text-3xl font-bold tracking-tight mb-4">How 3Dēx Works</h2>
                    <p className="text-white/50 mb-8 text-[15px] leading-relaxed max-w-2xl">
                        3Dēx operates on a commission-based model. We facilitate transactions between creators
                        and buyers, taking a flat-rate platform fee on completed sales and service fulfillments.
                    </p>
                    <div className="space-y-4">
                        {businessModel.map(item => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="flex items-start gap-6 p-6 bg-[#111] border border-white/10 rounded-2xl">
                                    <div className="shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="font-bold">{item.title}</p>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                                {item.tag}
                                            </span>
                                        </div>
                                        <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* The Team */}
                <section id="team">
                    <SectionLabel icon={Users} label="The Team" />
                    <h2 className="text-3xl font-bold tracking-tight mb-2">The People Behind 3Dēx</h2>
                    <p className="text-white/50 mb-10 text-[15px]">A team of three computer science students from Bali, Indonesia.</p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {team.map(member => (
                            <a
                                key={member.slug}
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block p-6 bg-[#111] border border-white/10 rounded-2xl hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
                            >
                                {/* Avatar */}
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} overflow-hidden text-white mb-5 group-hover:scale-105 transition-transform relative`}>
                                    <div className="absolute inset-0 bg-black/5" />
                                    <img src={`https://github.com/${member.githubUser}.png`} alt={member.name} className="w-full h-full object-cover" />
                                </div>

                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">@{member.handle}</p>
                                <p className="font-bold text-lg leading-tight mb-1">{member.nickname}</p>
                                <p className="text-xs text-yellow-400 font-medium mb-3">{member.role}</p>
                                <p className="text-white/50 text-sm leading-relaxed mb-5">{member.short}</p>

                                <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-blue-400 transition-colors font-medium">
                                    View LinkedIn <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* License */}
                <section>
                    <SectionLabel icon={Scale} label="Software License" />
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Open Source under GPL-3.0</h2>
                    <div className="p-8 bg-[#111] border border-white/10 rounded-2xl">
                        <div className="flex items-start gap-5 mb-6">
                            <div className="shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Scale className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <p className="font-bold text-lg mb-1">GNU General Public License v3.0</p>
                                <p className="text-white/50 text-sm">The 3Dēx platform (frontend and backend) is licensed under the GPL-3.0.</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm mb-6">
                            {[
                                { label: 'You can', items: ['Use freely for any purpose', 'Study and modify the code', 'Distribute copies'] },
                                { label: 'You must', items: ['Keep the GPL-3.0 license', 'Share source code of modifications', 'State changes you made'] },
                                { label: 'You cannot', items: ['Sublicense under different terms', 'Hold contributors liable', 'Close-source modified forks'] },
                            ].map(col => (
                                <div key={col.label} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <p className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-3">{col.label}</p>
                                    <ul className="space-y-1.5">
                                        {col.items.map(item => (
                                            <li key={item} className="text-white/60 flex items-start gap-2">
                                                <span className="text-white/20 mt-0.5">›</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <a
                            href="https://github.com/Schryzon/3Dex"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                            <Github className="w-4 h-4" />
                            View full license on GitHub
                            <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>
                </section>

            </div>
        </div>
    );
}

function SectionLabel({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>, label: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <Icon className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">{label}</span>
        </div>
    );
}
