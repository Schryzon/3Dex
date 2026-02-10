'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Crown, Download, Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';

const FORMAT_COLORS: Record<string, string> = {
    blend: 'bg-orange-500/20 text-orange-400',
    fbx: 'bg-blue-500/20 text-blue-400',
    obj: 'bg-green-500/20 text-green-400',
    max: 'bg-purple-500/20 text-purple-400',
};

interface CatalogProductCardProps {
    id: string;
    title: string;
    image: string;
    isPremium?: boolean;
    isFree?: boolean;
    discount?: number;
    author?: string;
    isSaved?: boolean;
    onSave?: () => void;
    onClick?: () => void;
    price?: number;
    originalPrice?: number;
    formats?: string[];
    rating?: number;
    reviewCount?: number;
    polyCount?: string;
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
    isSaved = false,
    onSave,
    onClick,
    price,
    originalPrice,
    formats = [],
    rating,
    reviewCount,
    polyCount,
    viewMode = 'grid',
}: CatalogProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const { addItem, items } = useCart();
    const isInCart = items.some(item => item.id === id);

    const displayPrice = isFree ? 'Free' : price ? `$${price.toFixed(0)}` : null;
    const hasDiscount = discount && originalPrice;

    // List View - Compact horizontal card
    if (viewMode === 'list') {
        const Wrapper = onClick ? 'div' : Link;
        const wrapperProps = onClick ? { onClick } : { href: `/catalog/${id}` };

        return (
            <Wrapper {...wrapperProps as any}>
                <div className="group flex bg-[#1a1a1a] rounded-lg overflow-hidden hover:bg-[#252525] transition-all cursor-pointer border border-transparent hover:border-gray-700">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-20 md:w-32 md:h-24 shrink-0">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                        {/* Badges overlay */}
                        {discount && (
                            <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                -{discount}%
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-2 md:p-3 flex flex-col justify-between min-w-0">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-white text-sm font-medium line-clamp-1">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-1 shrink-0">
                                    {isPremium && (
                                        <Crown className="w-3.5 h-3.5 text-yellow-500" />
                                    )}
                                    {isFree && (
                                        <Download className="w-3.5 h-3.5 text-blue-400" />
                                    )}
                                </div>
                            </div>
                            {author && (
                                <p className="text-gray-500 text-xs mt-0.5">{author}</p>
                            )}
                        </div>

                        {/* Bottom row */}
                        <div className="flex items-center justify-between gap-2 mt-1">
                            {/* Formats */}
                            <div className="flex items-center gap-1 overflow-hidden">
                                {formats.slice(0, 3).map((format) => (
                                    <span
                                        key={format}
                                        className={`text-[9px] font-semibold px-1 py-0.5 rounded ${FORMAT_COLORS[format] || 'bg-gray-700 text-gray-300'
                                            }`}
                                    >
                                        {format.toUpperCase()}
                                    </span>
                                ))}
                            </div>

                            {/* Price + Rating */}
                            <div className="flex items-center gap-2 shrink-0">
                                {rating !== undefined && (
                                    <div className="flex items-center gap-0.5 text-xs">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <span className="text-gray-400">{rating.toFixed(1)}</span>
                                    </div>
                                )}
                                {displayPrice && (
                                    <span className={`text-sm font-bold ${isFree ? 'text-blue-400' : 'text-white'}`}>
                                        {displayPrice}
                                    </span>
                                )}
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
                        className={`self-center p-2 mr-2 rounded-md transition-all cursor-pointer ${isSaved
                            ? 'text-red-500'
                            : 'text-gray-600 hover:text-white'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
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
                className="group relative rounded-xl overflow-hidden bg-[#1a1a1a] cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/50"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative aspect-[4/3]">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                    )}

                    <img
                        src={image}
                        alt={title}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'block' : 'hidden'
                            }`}
                        onLoad={() => setImageLoaded(true)}
                    />

                    <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-70'
                            }`}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                        {discount && (
                            <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                -{discount}%
                            </span>
                        )}
                        {isPremium && (
                            <span className="flex items-center gap-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                                <Crown className="w-2.5 h-2.5" />
                                PRO
                            </span>
                        )}
                        {isFree && (
                            <span className="flex items-center gap-0.5 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                <Download className="w-2.5 h-2.5" />
                                FREE
                            </span>
                        )}
                    </div>

                    {/* Quick Actions (Always visible on mobile/touch, hover on desktop) */}
                    <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0 md:opacity-0 lg:opacity-0 lg:group-hover:opacity-100'} sm:opacity-100`}>
                        {/* Save Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSave?.();
                            }}
                            className={`p-2 cursor-pointer rounded-lg backdrop-blur-md transition-all ${isSaved
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                : 'bg-black/50 text-white hover:bg-black/70'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        {/* Quick Add To Cart */}
                        {!isFree && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isInCart) {
                                        addItem({ id, title, price: price || 0, image, author: author || 'Unknown' });
                                    }
                                }}
                                className={`p-2 cursor-pointer rounded-lg backdrop-blur-md transition-all ${isInCart
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                    : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/20'
                                    }`}
                            >
                                {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                            </button>
                        )}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <h3 className="text-white font-medium text-xs line-clamp-1 mb-0.5">
                            {title}
                        </h3>
                        {author && (
                            <p className="text-gray-400 text-[10px] mb-1.5">{author}</p>
                        )}

                        {formats.length > 0 && (
                            <div className="flex items-center gap-0.5 mb-1.5 flex-wrap">
                                {formats.slice(0, 3).map((format) => (
                                    <span
                                        key={format}
                                        className={`text-[8px] font-semibold px-1 py-0.5 rounded ${FORMAT_COLORS[format] || 'bg-gray-700 text-gray-300'
                                            }`}
                                    >
                                        {format.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                {displayPrice && (
                                    <span className={`font-bold text-xs ${isFree ? 'text-blue-400' : 'text-white'}`}>
                                        {displayPrice}
                                    </span>
                                )}
                                {hasDiscount && (
                                    <span className="text-gray-500 text-[10px] line-through">
                                        ${originalPrice.toFixed(0)}
                                    </span>
                                )}
                            </div>
                            {rating !== undefined && (
                                <div className="flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                    <span className="text-[10px] text-gray-300">{rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </GridWrapper>
    );
}
