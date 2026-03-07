'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Search, MapPin, Box, Star, Printer, ArrowRight, Upload,
    UserCheck, Settings2, Package, Sparkles, Shield, Clock,
    Zap, ChevronLeft, ChevronRight, TrendingUp, Award
} from 'lucide-react';
import { printService } from '@/lib/api/services/print.service';
import { User, ProviderFilters } from '@/lib/types';
import ProviderCard from '@/components/print/ProviderCard';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';

// Service categories
const SERVICE_CATEGORIES = [
    { id: 'all', label: 'All Services', icon: Box },
    { id: 'fdm', label: 'FDM / FFF', icon: Printer },
    { id: 'resin', label: 'Resin / SLA', icon: Sparkles },
    { id: 'metal', label: 'Metal', icon: Shield },
    { id: 'nylon', label: 'Nylon / SLS', icon: Zap },
    { id: 'multicolor', label: 'Multi-Color', icon: Star },
];

// How It Works steps
const STEPS = [
    {
        icon: Upload,
        title: 'Upload Model',
        desc: 'Upload your 3D model or pick one from the catalog.',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20',
    },
    {
        icon: UserCheck,
        title: 'Choose Provider',
        desc: 'Browse verified providers by rating, price & location.',
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        border: 'border-green-400/20',
    },
    {
        icon: Settings2,
        title: 'Configure Print',
        desc: 'Pick material, color, scale and quantity.',
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
        border: 'border-purple-400/20',
    },
    {
        icon: Package,
        title: 'Receive It',
        desc: 'Your printed model ships directly to your door.',
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/20',
    },
];

// Stats
const PLATFORM_STATS = [
    { value: '500+', label: 'Providers', icon: Printer },
    { value: '10K+', label: 'Orders Done', icon: Package },
    { value: '4.8', label: 'Avg Rating', icon: Star },
    { value: '24h', label: 'Avg Response', icon: Clock },
];

export default function PrintServicesPage() {
    const { user } = useAuth();
    const [providers, setProviders] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<ProviderFilters>({
        sort: 'rating',
    });

    // Featured providers carousel
    const carouselRef = useRef<HTMLDivElement>(null);

    // Populate filters from user location
    useEffect(() => {
        if (user?.addresses?.length) {
            const addr = user.addresses[0];
            setFilters(prev => ({ ...prev, city: addr.city, country: addr.country }));
        }
    }, [user]);

    // Fetch providers
    const fetchProviders = async () => {
        setLoading(true);
        try {
            const data = await printService.getProviders(filters);
            setProviders(data);
        } catch (error) {
            console.error('Failed to fetch providers', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [filters]);

    const handleFilterChange = (key: keyof ProviderFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 320;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    // Top providers (by rating)
    const topProviders = [...providers]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 8);

    return (
        <div className="min-h-screen">
            {/* ============================================ */}
            {/* HERO BANNER                                  */}
            {/* ============================================ */}
            <section className="relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-[#111] to-purple-500/5" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />

                <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                        {/* Left content */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-6">
                                <Printer className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-yellow-400 font-medium">3D Print Marketplace</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                                Bring Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">3D Models</span> to Life
                            </h1>

                            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                                Connect with verified print providers near you. Upload your model, choose material & quality — receive it at your door.
                            </p>

                            {/* Hero Search Bar */}
                            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto lg:mx-0">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search providers or materials..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            handleFilterChange('material', e.target.value);
                                        }}
                                        className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                                    />
                                </div>
                                <a
                                    href="#providers"
                                    className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/30 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Find Providers <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Right — Stats Cards */}
                        <div className="grid grid-cols-2 gap-3 w-full max-w-xs shrink-0">
                            {PLATFORM_STATS.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="bg-[#141414]/80 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center hover:border-gray-700 transition-all group"
                                >
                                    <stat.icon className="w-5 h-5 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="text-xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* SERVICE CATEGORY TABS                        */}
            {/* ============================================ */}
            <section className="border-b border-gray-800/60 bg-[#0d0d0d] sticky top-[73px] z-30">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
                        {SERVICE_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${activeCategory === cat.id
                                        ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                                        : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] hover:text-white border border-gray-800'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* HOW IT WORKS                                 */}
            {/* ============================================ */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">How It Works</h2>
                    <p className="text-gray-500">From digital model to physical product in 4 easy steps</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.title}
                                className={`relative bg-[#141414] border ${step.border} rounded-2xl p-6 text-center group hover:border-gray-600 transition-all hover:-translate-y-1`}
                            >
                                {/* Step number */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-[#0a0a0a] border border-gray-800 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
                                        Step {index + 1}
                                    </span>
                                </div>

                                <div className={`inline-flex p-4 rounded-2xl ${step.bg} mb-4 mt-2 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-7 h-7 ${step.color}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>

                                {/* Connector arrow (hidden on last & mobile) */}
                                {index < STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                                        <ArrowRight className="w-5 h-5 text-gray-700" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ============================================ */}
            {/* FEATURED / TOP PROVIDERS (Carousel)          */}
            {/* ============================================ */}
            {topProviders.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-400/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Top Providers</h2>
                                <p className="text-sm text-gray-500">Highest rated in our network</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scrollCarousel('left')}
                                className="p-2 bg-[#1a1a1a] border border-gray-800 rounded-lg hover:bg-[#252525] transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                                onClick={() => scrollCarousel('right')}
                                className="p-2 bg-[#1a1a1a] border border-gray-800 rounded-lg hover:bg-[#252525] transition-colors cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={carouselRef}
                        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                    >
                        {topProviders.map((provider) => (
                            <div key={provider.id} className="min-w-[280px] max-w-[300px] snap-start shrink-0">
                                <ProviderCard provider={provider} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ============================================ */}
            {/* PROMO BANNER                                 */}
            {/* ============================================ */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400/10 via-orange-400/5 to-purple-500/10 border border-yellow-400/20">
                    {/* Glow effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px]" />

                    <div className="relative flex flex-col md:flex-row items-center gap-6 p-8 md:p-10">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 bg-yellow-400/20 rounded-full px-3 py-1 mb-3">
                                <Award className="w-3.5 h-3.5 text-yellow-400" />
                                <span className="text-xs font-semibold text-yellow-400">FOR PROVIDERS</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                Own a 3D Printer?
                            </h3>
                            <p className="text-gray-400 max-w-md">
                                Join our network of verified providers and start earning. Set your own prices, materials, and availability. Reach thousands of customers.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <Link
                                href="/become-provider"
                                className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-yellow-400/20 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Become a Provider <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/printers"
                                className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] text-white font-medium px-6 py-3 rounded-xl border border-gray-700 transition-all"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* ALL PROVIDERS + FILTERS                      */}
            {/* ============================================ */}
            <section id="providers" className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-400/10 rounded-lg">
                        <Printer className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">All Providers</h2>
                        <p className="text-sm text-gray-500">{providers.length} providers available</p>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-[#141414] border border-gray-800 rounded-xl p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        {/* Material Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Filter by material (e.g. PLA, Resin)..."
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                                value={filters.material || ''}
                                onChange={(e) => handleFilterChange('material', e.target.value)}
                            />
                        </div>

                        {/* Location */}
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-36">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="City"
                                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                                    value={filters.city || ''}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                />
                            </div>
                            <div className="relative flex-1 md:w-36">
                                <input
                                    type="text"
                                    placeholder="Country"
                                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                                    value={filters.country || ''}
                                    onChange={(e) => handleFilterChange('country', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <select
                            className="bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                            value={filters.sort || 'rating'}
                            onChange={(e) => handleFilterChange('sort', e.target.value as any)}
                        >
                            <option value="rating">⭐ Top Rated</option>
                            <option value="location">📍 Nearest Me</option>
                        </select>
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-[#141414] rounded-xl animate-pulse">
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-800" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-800 rounded w-2/3" />
                                            <div className="h-3 bg-gray-800/50 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-5">
                                        <div className="h-3 bg-gray-800/50 rounded w-full" />
                                        <div className="h-3 bg-gray-800/50 rounded w-3/4" />
                                    </div>
                                    <div className="h-10 bg-gray-800 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : providers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {providers.map(provider => (
                            <ProviderCard key={provider.id} provider={provider} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-800">
                            <Box className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No providers found</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your filters or change your location to find available print service providers.</p>
                        <button
                            onClick={() => {
                                setFilters({ sort: 'rating' });
                                setSearchQuery('');
                            }}
                            className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#252525] text-white border border-gray-700 rounded-xl transition-all cursor-pointer"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
