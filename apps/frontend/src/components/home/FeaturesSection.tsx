'use client';

import { Shield, Zap, Award, Globe, Clock, Heart } from 'lucide-react';

const features = [
    {
        title: 'High Quality Assets',
        description: 'Professionally crafted 3D models and textures',
        icon: Award,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
    },
    {
        title: 'Instant Download',
        description: 'Get your assets immediately after purchase',
        icon: Zap,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
    },
    {
        title: 'Commercial License',
        description: 'Use in personal and commercial projects',
        icon: Shield,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
    },
    {
        title: 'Global Community',
        description: 'Join thousands of creators worldwide',
        icon: Globe,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
    },
    {
        title: '24/7 Support',
        description: 'Get help whenever you need it',
        icon: Clock,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
    },
    {
        title: 'Curated Selection',
        description: 'Hand-picked assets from top artists',
        icon: Heart,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Why Choose <span className="text-yellow-400">3Dēx</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Everything you need to bring your creative vision to life
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="group bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-400/10"
                            >
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-lg ${feature.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-7 h-7 ${feature.color}`} />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">36K+</div>
                        <div className="text-gray-400">3D Assets</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">15K+</div>
                        <div className="text-gray-400">Happy Customers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">500+</div>
                        <div className="text-gray-400">Artists</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">4.9</div>
                        <div className="text-gray-400">Average Rating</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
