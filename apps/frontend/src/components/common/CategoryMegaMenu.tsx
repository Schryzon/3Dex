'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Category {
    name: string;
    href: string;
    count: number;
}

interface CategoryMegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
    type: '3d-models' | 'cg-models' | 'textures';
}

const menuData = {
    '3d-models': {
        title: '3D Models',
        categories: [
            { name: 'Characters', href: '/catalog?category=characters', count: 1250 },
            { name: 'Vehicles', href: '/catalog?category=vehicles', count: 890 },
            { name: 'Architecture', href: '/catalog?category=architecture', count: 2100 },
            { name: 'Furniture', href: '/catalog?category=furniture', count: 1560 },
            { name: 'Props', href: '/catalog?category=props', count: 3200 },
            { name: 'Nature', href: '/catalog?category=nature', count: 980 },
        ],
    },
    'cg-models': {
        title: 'CG Models',
        categories: [
            { name: 'Game Assets', href: '/cg-models?category=game-assets', count: 1800 },
            { name: 'Animation Rigs', href: '/cg-models?category=animation-rigs', count: 450 },
            { name: 'VFX Elements', href: '/cg-models?category=vfx-elements', count: 720 },
            { name: 'UI Elements', href: '/cg-models?category=ui-elements', count: 890 },
            { name: 'Particles', href: '/cg-models?category=particles', count: 560 },
            { name: 'Shaders', href: '/cg-models?category=shaders', count: 340 },
        ],
    },
    textures: {
        title: 'Textures',
        categories: [
            { name: 'PBR Materials', href: '/textures?category=pbr-materials', count: 2400 },
            { name: 'Wood', href: '/textures?category=wood', count: 680 },
            { name: 'Metal', href: '/textures?category=metal', count: 540 },
            { name: 'Fabric', href: '/textures?category=fabric', count: 890 },
            { name: 'Stone', href: '/textures?category=stone', count: 760 },
            { name: 'Organic', href: '/textures?category=organic', count: 420 },
        ],
    },
};

export default function CategoryMegaMenu({ isOpen, onClose, type }: CategoryMegaMenuProps) {
    if (!isOpen) return null;

    const data = menuData[type];

    return (
        <div className="absolute left-0 right-0 top-full mt-0 z-40">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
                <div className="bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-lg shadow-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Categories Grid - 2 columns */}
                    <div className="grid grid-cols-2 gap-3">
                        {data.categories.map((category) => (
                            <Link
                                key={category.name}
                                href={category.href}
                                onClick={onClose}
                                className="group flex items-center justify-between p-3 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
                            >
                                <div>
                                    <p className="text-white font-medium text-sm group-hover:text-yellow-400 transition-colors">
                                        {category.name}
                                    </p>
                                    <p className="text-gray-400 text-xs">{category.count} items</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>

                    {/* View All Link */}
                    <Link
                        href={type === '3d-models' ? '/catalog' : `/${type}`}
                        onClick={onClose}
                        className="mt-4 inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                    >
                        View All {data.title}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
