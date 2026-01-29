'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Crown, Download } from 'lucide-react';

interface CatalogProductCardProps {
    id: string;
    title: string;
    image: string;
    isPremium?: boolean;
    isFree?: boolean;
    discount?: number;
    author?: string;
    isBookmarked?: boolean;
    onBookmark?: () => void;
}

export default function CatalogProductCard({
    id,
    title,
    image,
    isPremium = false,
    isFree = false,
    discount,
    author,
    isBookmarked = false,
    onBookmark,
}: CatalogProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Link href={`/product/${id}`}>
            <div
                className="group relative rounded-xl overflow-hidden bg-[#1a1a1a] cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Container with fixed aspect ratio */}
                <div className="relative aspect-[4/3]">
                    {/* Placeholder while loading */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                    )}

                    {/* Main Image */}
                    <img
                        src={image}
                        alt={title}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'block' : 'hidden'
                            }`}
                        onLoad={() => setImageLoaded(true)}
                    />

                    {/* Gradient Overlay on Hover */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                            }`}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        {/* Discount Badge */}
                        {discount && (
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                                -{discount}%
                            </span>
                        )}

                        {/* Premium Badge */}
                        {isPremium && (
                            <span className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-md">
                                <Crown className="w-3 h-3" />
                                PRO
                            </span>
                        )}

                        {/* Free Badge */}
                        {isFree && (
                            <span className="flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                                <Download className="w-3 h-3" />
                                FREE
                            </span>
                        )}
                    </div>

                    {/* Bookmark Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onBookmark?.();
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${isBookmarked
                            ? 'bg-yellow-500 text-black'
                            : isHovered
                                ? 'bg-black/50 text-white opacity-100'
                                : 'bg-black/50 text-white opacity-0'
                            }`}
                    >
                        <Bookmark
                            className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`}
                        />
                    </button>

                    {/* Bottom Info on Hover */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                            }`}
                    >
                        <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                            {title}
                        </h3>
                        {author && (
                            <p className="text-gray-400 text-xs">by {author}</p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
