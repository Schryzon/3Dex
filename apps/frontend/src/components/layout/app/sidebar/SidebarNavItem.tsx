'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
    label: string;
    icon: LucideIcon;
    href: string;
    isActive: boolean;
    isSidebarOpen: boolean;
    title?: string;
    count?: number;
}

export default function SidebarNavItem({
    label,
    icon: Icon,
    href,
    isActive,
    isSidebarOpen,
    title,
    count,
}: SidebarNavItemProps) {
    return (
        <Link
            href={href}
            title={title}
            className={`relative flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center px-2'
                } py-2.5 rounded-lg transition-all group overflow-hidden whitespace-nowrap ${isActive
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-gray-500 hover:bg-white/[0.04] hover:text-white'
                }`}
        >
            {/* Active left accent bar */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-yellow-400 rounded-full" />
            )}

            <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-500 group-hover:text-white'}`} />

            <span
                className={`font-medium transition-all duration-300 ${!isSidebarOpen ? 'hidden w-0 opacity-0' : 'opacity-100 ml-3'
                    } ${isActive ? 'text-yellow-400' : ''}`}
            >
                {label}
            </span>

            {/* Notification Badge */}
            {count !== undefined && count > 0 && isSidebarOpen && (
                <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {count}
                </span>
            )}
            {count !== undefined && count > 0 && !isSidebarOpen && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#111]" />
            )}
        </Link>
    );
}
