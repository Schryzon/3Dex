import React from 'react';
import { Star, MapPin, Printer, ShieldCheck, CheckCircle2, Package, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface ProviderCardProps {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    location?: string;
    rating: number;
    reviewCount: number;
    materials: string[];
    printerTypes: string[];
    basePrice?: number;
    verified?: boolean;
}

export default function ProviderCard({
    id,
    username,
    displayName,
    avatarUrl,
    location,
    rating,
    reviewCount,
    materials,
    printerTypes,
    basePrice,
    verified = true
}: ProviderCardProps) {
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`;

    return (
        <div className="group relative bg-[#0a0a0a] border border-gray-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col h-full">
            {/* Top Banner & Avatar Profile */}
            <div className="relative h-24 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800/50">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute -bottom-10 left-6">
                    <div className="relative w-20 h-20 rounded-2xl border-4 border-[#0a0a0a] overflow-hidden bg-gray-800 shadow-xl group-hover:scale-105 transition-transform duration-500">
                        <Image
                            src={avatarUrl || defaultAvatar}
                            alt={displayName}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    {verified && (
                        <div className="absolute -bottom-1 -right-1 bg-[#0a0a0a] rounded-full p-0.5" title="Verified Provider">
                            <ShieldCheck className="w-5 h-5 text-blue-400 fill-blue-400/20" />
                        </div>
                    )}
                </div>

                {basePrice && (
                    <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-md border border-gray-700 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg">
                        <span className="text-gray-400 mr-1">from</span>
                        <span className="text-blue-400">${basePrice.toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="pt-12 p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <Link href={`/profile/${username}`}>
                            <h3 className="text-xl font-bold hover:text-blue-400 transition-colors line-clamp-1">{displayName}</h3>
                        </Link>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                            @{username}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2.5 py-1 rounded-lg text-sm font-bold border border-yellow-400/20">
                            <Star className="w-4 h-4 fill-yellow-400" />
                            {rating > 0 ? rating.toFixed(1) : 'New'}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 font-medium">{reviewCount} reviews</span>
                    </div>
                </div>

                {location && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{location}</span>
                    </div>
                )}

                {/* Capabilities Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                    <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 mb-2">
                            <Printer className="w-3.5 h-3.5 text-blue-400" /> Technologies
                        </div>
                        <div className="flex flex-wrap gap-1 text-[11px] text-gray-400">
                            {printerTypes.slice(0, 3).map((type, i) => (
                                <span key={i} className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">{type}</span>
                            ))}
                            {printerTypes.length > 3 && <span className="px-1 py-0.5">+{printerTypes.length - 3}</span>}
                        </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 mb-2">
                            <Package className="w-3.5 h-3.5 text-blue-400" /> Materials
                        </div>
                        <div className="flex flex-wrap gap-1 text-[11px] text-gray-400">
                            {materials.slice(0, 3).map((mat, i) => (
                                <span key={i} className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">{mat}</span>
                            ))}
                            {materials.length > 3 && <span className="px-1 py-0.5">+{materials.length - 3}</span>}
                        </div>
                    </div>
                </div>

                {/* Tags/Badges */}
                <div className="flex gap-2 mb-6 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">
                        <CheckCircle2 className="w-3 h-3" /> Accepting Orders
                    </div>
                    <div className="flex items-center gap-1 text-purple-400 bg-purple-400/10 px-2 py-1 rounded-md border border-purple-400/20">
                        <Zap className="w-3 h-3" /> Fast Turnaround
                    </div>
                </div>

                {/* Footer Action */}
                <Link href={`/profile/${username}/order`} className="mt-auto w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center transition-all bg-opacity-90 hover:bg-opacity-100 group/btn overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    <span className="relative z-10 flex items-center gap-2">Request Print</span>
                </Link>
            </div>
        </div>
    );
}
