'use client';

import { Search, ShoppingCart, Download, ArrowRight } from 'lucide-react';

const steps = [
    {
        number: '01',
        title: 'Browse & Discover',
        description: 'Explore thousands of high-quality 3D models, textures, and CG assets across various categories',
        icon: Search,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
    },
    {
        number: '02',
        title: 'Purchase Securely',
        description: 'Add items to cart and checkout with secure payment. Get instant access to your purchases',
        icon: ShoppingCart,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
    },
    {
        number: '03',
        title: 'Download & Create',
        description: 'Download your assets immediately and start creating amazing projects with commercial licenses',
        icon: Download,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
    },
];

export default function HowItWorks() {
    return (
        <section className="py-16 md:py-24 bg-black">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        How It <span className="text-yellow-400">Works</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Get started with 3Dēx in three simple steps
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
                    {/* Connection Lines - Desktop Only */}
                    <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.number}
                                className="relative group"
                            >
                                {/* Card */}
                                <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-400/10">
                                    {/* Step Number */}
                                    <div className="absolute -top-6 left-8">
                                        <div className="w-12 h-12 rounded-full bg-gray-900 border-2 border-yellow-400 flex items-center justify-center">
                                            <span className="text-yellow-400 font-bold text-lg">{step.number}</span>
                                        </div>
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-xl ${step.bgColor} flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-8 h-8 ${step.color}`} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {step.description}
                                    </p>

                                    {/* Arrow Indicator - Not on last item */}
                                    {index < steps.length - 1 && (
                                        <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-gray-600">
                                            <ArrowRight className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <a
                        href="/catalog"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-full text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20"
                    >
                        Start Browsing
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </section>
    );
}
