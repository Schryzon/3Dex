'use client';

import Link from 'next/link';
import { Box, Palette, ArrowRight } from 'lucide-react';

const categories = [
    {
        title: '3D Models',
        description: 'High-quality 3D assets for games, animation, and visualization',
        icon: Box,
        count: '12,500+',
        href: '/catalog',
        gradient: 'from-blue-500/20 to-purple-500/20',
        iconColor: 'text-blue-400',
    },
    {
        title: 'CG Models',
        description: 'Professional CG assets, rigs, and game-ready models',
        icon: Box,
        count: '8,200+',
        href: '/cg-models',
        gradient: 'from-green-500/20 to-emerald-500/20',
        iconColor: 'text-green-400',
        badge: 'NEW',
    },
    {
        title: 'Textures',
        description: 'PBR materials, seamless textures, and surface details',
        icon: Palette,
        count: '15,800+',
        href: '/textures',
        gradient: 'from-orange-500/20 to-red-500/20',
        iconColor: 'text-orange-400',
    },
];

export default function FeaturedCategories() {
    return (
        <section className="py-16 md:py-24 bg-black">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Explore Our <span className="text-yellow-400">Collections</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Discover thousands of premium 3D assets, models, and textures for your next project
                    </p>
                </div>

                {/* Category Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.title}
                                href={category.href}
                                className="group relative overflow-hidden rounded-2xl bg-gray-800/40 backdrop-blur-sm border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-400/10"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                {/* Content */}
                                <div className="relative p-8">
                                    {/* Icon */}
                                    <div className="mb-6">
                                        <div className="w-16 h-16 rounded-xl bg-gray-700/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-gray-700/70 transition-colors">
                                            <Icon className={`w-8 h-8 ${category.iconColor}`} />
                                        </div>
                                    </div>

                                    {/* Title & Badge */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                                            {category.title}
                                        </h3>
                                        {category.badge && (
                                            <span className="px-2 py-1 bg-green-500 text-black text-xs font-bold rounded">
                                                {category.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-400 mb-6 leading-relaxed">
                                        {category.description}
                                    </p>

                                    {/* Count & Arrow */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-yellow-400 font-bold text-lg">
                                            {category.count} items
                                        </span>
                                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-yellow-400 transition-colors">
                                            <span className="text-sm font-medium">Explore</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect Border */}
                                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 group-hover:ring-yellow-400/20 transition-all" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
