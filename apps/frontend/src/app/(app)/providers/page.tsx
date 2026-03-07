'use client';

import React, { useState, useEffect } from 'react';
import ProviderCard from '@/components/providers/ProviderCard';
import { api } from '@/lib/api';
import { Search, MapPin, Printer, Loader2, Filter } from 'lucide-react';

export default function ProvidersPage() {
    const [providers, setProviders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                // In a real app, you would have a dedicated endpoint for listing filtered providers
                // For now, we'll fetch all users, or simulate with a mockup if no endpoint exists
                const { data } = await api.get('/users');
                const providerUsers = data.filter((u: any) => u.role === 'PROVIDER' || u.provider_config);
                setProviders(providerUsers);
            } catch (err) {
                console.error("Failed to fetch providers", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProviders();
    }, []);

    const filteredProviders = providers.filter(p =>
        p.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            Find a <span className="text-blue-400">Provider</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl text-lg">
                            Connect with verified 3D printing professionals in your area to bring your digital assets into the physical world.
                        </p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, username, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 focus:border-blue-500 outline-none transition-colors shadow-lg"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 px-6 py-4 rounded-2xl hover:border-gray-700 transition-colors font-semibold shadow-lg">
                        <Filter className="w-5 h-5" /> Filters
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 px-6 py-4 rounded-2xl hover:border-gray-700 transition-colors font-semibold shadow-lg">
                        <MapPin className="w-5 h-5" /> Near Me
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p className="font-medium animate-pulse">Scanning the network...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredProviders.length === 0 && (
                    <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/20 text-center px-4">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <Printer className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No providers found</h3>
                        <p className="text-gray-400 max-w-sm">
                            {searchTerm
                                ? `We couldn't find any providers matching "${searchTerm}". Try adjusting your search.`
                                : "There are currently no registered providers in the network."}
                        </p>
                    </div>
                )}

                {/* Grid */}
                {!isLoading && filteredProviders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProviders.map(p => {
                            const config = p.provider_config || {};
                            return (
                                <ProviderCard
                                    key={p.id}
                                    id={p.id}
                                    username={p.username}
                                    displayName={p.display_name || p.username}
                                    avatarUrl={p.avatar_url}
                                    location={p.location}
                                    rating={p.rating || 0}
                                    reviewCount={p.review_count || 0}
                                    materials={config.materials || ['PLA', 'ABS', 'PETG']}
                                    printerTypes={config.printerTypes || ['FDM', 'Resin']}
                                    basePrice={config.basePrice}
                                    verified={p.role === 'PROVIDER'} // If their role is officially PROVIDER, they are verified
                                />
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}
