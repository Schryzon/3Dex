'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Box } from 'lucide-react';
import { printService } from '@/lib/services/print.service';
import { User, ProviderFilters } from '@/lib/types';
import ProviderCard from '@/components/print/ProviderCard';
import { useAuth } from '@/components/auth/AuthProvider';

export default function PrintServicesPage() {
    const { user } = useAuth();
    const [providers, setProviders] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ProviderFilters>({
        sort: 'location' // Default to location based sorting if user has address
    });

    // Populate filters from user location if available
    useEffect(() => {
        if (user && user.addresses && user.addresses.length > 0) {
            const defaultAddress = user.addresses[0];
            setFilters(prev => ({
                ...prev,
                city: defaultAddress.city,
                country: defaultAddress.country
            }));
        }
    }, [user]);

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
    }, [filters]); // Refetch when filters change

    const handleFilterChange = (key: keyof ProviderFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">3D Print Services</h1>
                <p className="text-gray-400">Find local providers to print your models. Filter by material, location, and rating.</p>
            </div>

            {/* Filters */}
            <div className="bg-[#141414] border border-gray-800 rounded-xl p-4 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center">

                    {/* Search / Material */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filter by material (e.g. PLA, Resin)..."
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                            value={filters.material || ''}
                            onChange={(e) => handleFilterChange('material', e.target.value)}
                        />
                    </div>

                    {/* Location Filters */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-40">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="City"
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white"
                                value={filters.city || ''}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                            />
                        </div>
                        <div className="relative flex-1 md:w-40">
                            <input
                                type="text"
                                placeholder="Country"
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white"
                                value={filters.country || ''}
                                onChange={(e) => handleFilterChange('country', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Sort */}
                    <select
                        className="bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-yellow-400"
                        value={filters.sort || 'rating'}
                        onChange={(e) => handleFilterChange('sort', e.target.value as any)}
                    >
                        <option value="rating">Top Rated</option>
                        <option value="location">Nearest Me</option>
                    </select>

                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-[#141414] rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : providers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {providers.map(provider => (
                        <ProviderCard key={provider.id} provider={provider} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-[#141414] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Box className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No providers found</h3>
                    <p className="text-gray-500">Try adjusting your filters or location.</p>
                </div>
            )}
        </div>
    );
}
