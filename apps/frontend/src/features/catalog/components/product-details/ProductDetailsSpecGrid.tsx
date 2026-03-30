'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

// Maps lowercase format keys to their Tailwind badge color classes
const FORMAT_COLORS: Record<string, string> = {
    blend: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    fbx: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    obj: 'bg-green-500/20 text-green-400 border-green-500/30',
    max: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    stl: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    gltf: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

interface ProductDetailsSpecGridProps {
    formats: string[];
    hasTextures: boolean;
    isRigged: boolean;
    isAnimated: boolean;
    // Tags are displayed as clickable catalog filter links below the spec grid
    tags: string[];
}

export default function ProductDetailsSpecGrid({
    formats,
    hasTextures,
    isRigged,
    isAnimated,
    tags,
}: ProductDetailsSpecGridProps) {
    return (
        <>
            {/* 2x2 spec grid: Formats, Features, License */}
            <div className="grid grid-cols-2 gap-3">
                {/* Formats — colored badges per file extension */}
                <div className="bg-[#141414] rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Formats</p>
                    <div className="flex flex-wrap gap-1">
                        {formats.map((format) => (
                            <span
                                key={format}
                                className={`text-xs font-semibold px-2 py-0.5 rounded border ${FORMAT_COLORS[format] || 'bg-gray-700 text-gray-300 border-gray-600'
                                    }`}
                            >
                                {format.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>



                {/* Feature flags: Textures, Rigged, Animated — only shown when true */}
                <div className="bg-[#141414] rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Features</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {hasTextures && (
                            <span className="flex items-center gap-1 text-green-400">
                                <Check className="w-3 h-3" /> Textures
                            </span>
                        )}
                        {isRigged && (
                            <span className="flex items-center gap-1 text-blue-400">
                                <Check className="w-3 h-3" /> Rigged
                            </span>
                        )}
                        {isAnimated && (
                            <span className="flex items-center gap-1 text-purple-400">
                                <Check className="w-3 h-3" /> Animated
                            </span>
                        )}
                    </div>
                </div>

                {/* License type — currently always Royalty Free */}
                <div className="bg-[#141414] rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">License</p>
                    <p className="text-white font-medium text-sm">Royalty Free</p>
                </div>
            </div>

            {/* Tag links — each tag navigates to a filtered catalog view */}
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Link
                        key={tag}
                        href={`/catalog?tag=${tag}`}
                        className="px-3 py-1 bg-[#1a1a1a] text-gray-400 text-xs rounded-full hover:bg-[#252525] hover:text-white transition-colors"
                    >
                        #{tag}
                    </Link>
                ))}
            </div>
        </>
    );
}
