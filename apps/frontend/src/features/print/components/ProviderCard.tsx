'use client';

import Link from 'next/link';
import { User, ProviderConfig } from '@/types';
import UserAvatar from '@/components/common/UserAvatar';
import { Star, MapPin, Box, Palette, Printer } from 'lucide-react';

interface ProviderCardProps {
    provider: User;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
    const config = provider.provider_config as ProviderConfig | undefined;

    // Fallbacks if config is missing (shouldn't happen for approved providers)
    const materials = config?.materials || [];
    const printerTypes = config?.printerTypes || [];

    return (
        <div className="bg-[#141414] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <UserAvatar user={provider} size="md" linkToProfile={true} />
                        <div>
                            <Link href={`/u/${provider.username}`} className="font-semibold text-white hover:text-yellow-400 transition-colors">
                                {provider.display_name || provider.username}
                            </Link>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span>{provider.location || 'Unknown Location'}</span>
                            </div>
                        </div>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">{provider.rating?.toFixed(1) || 'New'}</span>
                        <span className="text-xs text-gray-500">({provider.review_count})</span>
                    </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-3 mb-5">
                    <div className="flex items-start gap-2 text-sm">
                        <Box className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-gray-500 text-xs mb-1">Materials</p>
                            <div className="flex flex-wrap gap-1.5">
                                {materials.length > 0 ? materials.slice(0, 3).map(m => (
                                    <span key={m} className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">
                                        {m}
                                    </span>
                                )) : <span className="text-gray-600 text-xs">No materials listed</span>}
                                {materials.length > 3 && (
                                    <span className="text-xs text-gray-500 self-center">+{materials.length - 3}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                        <Printer className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-gray-500 text-xs mb-1">Printers</p>
                            <p className="text-gray-300 text-sm truncate max-w-[200px]">
                                {printerTypes.join(', ') || 'Standard'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <Link
                    href={`/print-services/${provider.username}/order`}
                    className="flex w-full items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                    Start Order
                </Link>
            </div>
        </div>
    );
}
