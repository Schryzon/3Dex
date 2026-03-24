import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    active?: boolean;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
    return (
        <div className="relative w-full max-w-full">
            {/* Fade out mask for mobile overflow indication */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none sm:hidden z-10" />
            <nav
                aria-label="Breadcrumb"
                className={cn(
                    "flex flex-nowrap items-center gap-2 text-sm text-gray-400 py-2 pl-1 pr-6 sm:pr-1 rounded-lg transition-all overflow-x-auto custom-scrollbar",
                    className
                )}
                style={{ WebkitOverflowScrolling: 'touch', minWidth: 'min-content' }}
            >
                <Link
                href="/dashboard"
                className="flex items-center gap-1.5 hover:text-yellow-500 transition-colors group"
                title="Home"
            >
                <div className="p-1 rounded-md bg-gray-900 group-hover:bg-yellow-500/10 border border-gray-800 group-hover:border-yellow-500/30 transition-all">
                    <Home className="w-3.5 h-3.5" />
                </div>
            </Link>

            {items.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                    {item.active || !item.href ? (
                        <span className={cn(
                            "font-medium truncate max-w-[150px] sm:max-w-[300px]",
                            item.active ? "text-white" : "text-gray-500"
                        )}>
                            {item.label}
                        </span>
                    ) : (
                        <Link
                            href={item.href}
                            className="hover:text-yellow-500 transition-colors font-medium hover:underline underline-offset-4 decoration-yellow-500/30"
                        >
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
            </nav>
        </div>
    );
};

export default Breadcrumbs;
