'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/features/cart';
import { formatPrice } from '@/lib/utils';
import { getStorageUrl } from '@/lib/utils/storage';

const FORMAT_COLORS: Record<string, string> = {
    blend: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    fbx: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    obj: 'bg-green-500/10 text-green-400 border-green-500/20',
    max: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

function NSFWRibbon({ className = "" }: { className?: string }) {
    return (
        <div className={`absolute top-0 right-0 z-20 overflow-hidden w-12 h-12 md:w-16 md:h-16 pointer-events-none ${className}`}>
            <div className="absolute top-0 right-0 w-[141%] h-5 md:h-6 bg-red-600 text-white text-[8px] md:text-[10px] font-black flex items-center justify-center uppercase tracking-tighter md:tracking-widest shadow-xl transform rotate-45 translate-x-[25%] translate-y-[20%] md:translate-x-[30%] md:translate-y-[25%] border-b border-white/20">
                NSFW
            </div>
        </div>
    );
}

interface CatalogProductCardProps {
    id: string;
    title: string;
    image: string;
    isPremium?: boolean;
    isFree?: boolean;
    discount?: number;
    author?: string;
    authorAvatar?: string;
    isSaved?: boolean;
    onSave?: () => void;
    onClick?: () => void;
    price?: number;
    originalPrice?: number;
    formats?: string[];
    rating?: number;
    reviewCount?: number;
    isNsfw?: boolean;
    viewMode?: 'grid' | 'list';
}

export default function CatalogProductCard({
    id,
    title,
    image,
    isPremium = false,
    isFree = false,
    discount,
    author,
    authorAvatar,
    isSaved = false,
    onSave,
    onClick,
    price,
    originalPrice,
    formats = [],
    rating,
    reviewCount,
    isNsfw = false,
    viewMode = 'grid',
}: CatalogProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const { addToCart, items } = useCart();
    const isInCart = items.some(item => item.model_id === id);

    const formatted = price ? formatPrice(price) : null;

    // List View - Compact horizontal card
    if (viewMode === 'list') {
        const Wrapper = onClick ? 'div' : Link;
        const wrapperProps = onClick ? { onClick } : { href: `/catalog/${id}` };

        return (
            <Wrapper {...wrapperProps as any}>
                <div className="group flex bg-[#111] rounded-xl overflow-hidden hover:bg-[#161616] transition-all duration-300 cursor-pointer border border-white/[0.05] hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/40">
                    {/* Thumbnail */}
                    <div className="relative w-28 h-24 md:w-40 md:h-32 shrink-0 overflow-hidden">
                        <img
                            src={getStorageUrl(image)}
                            alt={title}
                            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${isNsfw ? 'blur-xl scale-110' : ''}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                        
                        {isNsfw && (
                            <>
                                <NSFWRibbon />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                                    <span className="text-[10px] md:text-xs font-semibold text-white/90 uppercase tracking-wider px-2 py-1 bg-black/40 rounded-lg border border-white/10">
                                        Mature
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Badges overlay */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {discount && (
                                <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-lg shadow-green-500/20">
                                    -{discount}%
                                </span>
                            )}
                            {isPremium && (
                                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-lg shadow-yellow-500/20">
                                    PRO
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
                        <div>
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-white text-sm md:text-base font-semibold line-clamp-1 group-hover:text-yellow-400 transition-colors">
                                    {title}
                                </h3>
                                {author && (
                                    <div
                                        className="flex items-center gap-1.5 min-w-0"
                                        title={author}
                                    >
                                        {authorAvatar ? (
                                            <img
                                                src={getStorageUrl(authorAvatar)}
                                                alt=""
                                                className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-white/10 shrink-0 object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-4 w-4 md:h-5 md:w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[8px] md:text-[9px] font-bold text-gray-400">
                                                {author.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        <p className="hidden md:block text-gray-500 text-xs font-medium truncate leading-tight">{author}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom row */}
                        <div className="flex items-end justify-between gap-2 mt-2">
                            {/* Formats */}
                            <div className="flex flex-wrap items-center gap-1 min-w-0">
                                {formats.slice(0, 3).map((format) => (
                                    <span
                                        key={format}
                                        className={`text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${FORMAT_COLORS[format] || 'bg-white/5 text-gray-400 border-white/10'
                                            }`}
                                    >
                                        {format.toUpperCase()}
                                    </span>
                                ))}
                            </div>

                            {/* Price + Rating */}
                            <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                                {rating !== undefined && (
                                    <div className="flex items-center gap-1 text-[10px] md:text-xs">
                                        <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-gray-400 font-medium">{rating.toFixed(1)}</span>
                                    </div>
                                )}
                                {isFree ? (
                                    <span className="text-xs md:text-base font-semibold text-blue-400">
                                        Free
                                    </span>
                                ) : formatted ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs md:text-base font-semibold text-white leading-none whitespace-nowrap">
                                            {formatted.idr}
                                        </span>
                                        <span className="text-[9px] md:text-[10px] font-medium text-gray-500 mt-0.5 whitespace-nowrap">
                                            {formatted.usd}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSave?.();
                        }}
                        className={`self-center p-3 mr-3 rounded-xl transition-all cursor-pointer hover:bg-white/5 ${isSaved
                            ? 'text-red-500'
                            : 'text-gray-600 hover:text-white'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </Wrapper>
        );
    }

    // Grid View - Original card design
    const GridWrapper = onClick ? 'div' : Link;
    const gridWrapperProps = onClick ? { onClick } : { href: `/catalog/${id}` };

    return (
        <GridWrapper {...gridWrapperProps as any}>
            <div
                className="group relative rounded-xl overflow-hidden bg-[#0c0c0c] cursor-pointer transition-all duration-500 border border-white/[0.04] hover:border-yellow-400/30 hover:shadow-2xl hover:shadow-yellow-400/5"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Section */}
                <div className="relative aspect-[3/4] overflow-hidden">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-white/5 animate-pulse" />
                    )}

                    <img
                        src={getStorageUrl(image)}
                        alt={title}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-102 ${imageLoaded ? 'block' : 'hidden'
                            } ${isNsfw ? 'blur-2xl scale-110' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                    />

                    {isNsfw && (
                        <>
                            <NSFWRibbon />
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-[2px]">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] md:text-xs font-semibold text-white px-3 py-1.5 bg-black/60 rounded-xl border border-white/10 uppercase tracking-widest shadow-2xl">
                                        Mature Content
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Gradient Overlay - lightened for visibility */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/80 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-90' : 'opacity-40'
                            }`}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
                        {discount && (
                            <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-lg">
                                -{discount}%
                            </span>
                        )}
                        {isPremium && (
                            <span className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[9px] font-black px-2 py-0.5 rounded-lg">
                                PRO
                            </span>
                        )}
                    </div>

                    {/* Quick Actions — mobile: always visible & compact; md+: show on hover */}
                    <div
                        className={[
                            'absolute top-2.5 right-2.5 z-10 flex flex-row items-center rounded-xl border border-white/[0.08] bg-black/50 backdrop-blur-md shadow-md shadow-black/25 transition-all duration-300',
                            'gap-0.5 p-0.5 max-md:opacity-100 max-md:translate-x-0 max-md:pointer-events-auto',
                            'md:top-3 md:right-3 md:gap-1 md:rounded-2xl md:p-1 md:shadow-lg',
                            isHovered
                                ? 'opacity-100 translate-x-0'
                                : 'max-md:opacity-100 max-md:translate-x-0 md:pointer-events-none md:opacity-0 md:translate-x-3',
                        ].join(' ')}
                    >
                        <button
                            type="button"
                            aria-label={isSaved ? 'Remove from saved' : 'Save'}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSave?.();
                            }}
                            className={`cursor-pointer rounded-lg transition-all duration-300 max-md:p-1.5 md:rounded-xl md:p-2 ${isSaved
                                ? 'bg-red-500/90 text-white shadow-inner'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <Heart className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        {!isFree && (
                            <button
                                type="button"
                                aria-label={isInCart ? 'In cart' : 'Add to cart'}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isInCart) {
                                        addToCart({ modelId: id });
                                    }
                                }}
                                className={`cursor-pointer rounded-lg transition-all duration-300 max-md:p-1.5 md:rounded-xl md:p-2 ${isInCart
                                    ? 'bg-emerald-500 text-white shadow-inner'
                                    : 'bg-yellow-400 text-black hover:bg-yellow-300'
                                    }`}
                            >
                                {isInCart ? (
                                    <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                ) : (
                                    <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Info Overlay Panel (Bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-[#0c0c0c] to-transparent">
                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-white font-semibold text-sm md:text-base line-clamp-1 group-hover:text-yellow-400 transition-colors">
                                {title}
                            </h3>
                            <div className="flex items-center justify-between gap-2">
                                {author ? (
                                    <div
                                        className="flex min-w-0 flex-1 items-center gap-1.5"
                                        title={author}
                                    >
                                        {authorAvatar ? (
                                            <img
                                                src={getStorageUrl(authorAvatar)}
                                                alt=""
                                                className="h-5 w-5 shrink-0 rounded-full border border-white/10 object-cover ring-1 ring-white/5"
                                            />
                                        ) : (
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-gray-400 ring-1 ring-white/5">
                                                {author.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        <p className="hidden md:block truncate text-[10px] font-medium text-gray-500">{author}</p>
                                    </div>
                                ) : (
                                    <span className="min-w-0 flex-1" />
                                )}
                                {isFree ? (
                                    <span className="font-semibold text-xs md:text-sm tracking-tight text-blue-400 shrink-0">
                                        Free
                                    </span>
                                ) : formatted ? (
                                    <div className="flex flex-col items-end shrink-0 text-right">
                                        <span className="font-semibold text-[10px] sm:text-xs md:text-sm tracking-tight text-white leading-none whitespace-nowrap">
                                            {formatted.idr}
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-gray-500 mt-0.5 whitespace-nowrap">
                                            {formatted.usd}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* Expandable Meta section on hover */}
                        <div className={`grid transition-all duration-500 ease-in-out ${isHovered ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-white/[0.05]' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        {formats.slice(0, 3).map((format) => (
                                            <span
                                                key={format}
                                                className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border ${FORMAT_COLORS[format] || 'bg-white/5 text-gray-500 border-white/5'
                                                    }`}
                                            >
                                                {format.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                    {rating !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-bold text-gray-300">{rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GridWrapper>
    );
}
