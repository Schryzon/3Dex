'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { FolderOpen, Bookmark, Settings, Upload, BarChart3, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    {
        label: 'Collections',
        href: '/collections',
        icon: FolderOpen,
        description: 'Your purchased assets',
    },
    {
        label: 'Bookmarks',
        href: '/bookmarks',
        icon: Bookmark,
        description: 'Saved for later',
    },
    {
        label: 'Uploads',
        href: '/uploads',
        icon: Upload,
        description: 'Your uploaded models',
        roles: ['ARTIST', 'ADMIN'],
    },
    {
        label: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'View your stats',
        roles: ['ARTIST', 'ADMIN'],
    },
    {
        label: 'Account Settings',
        href: '/settings',
        icon: Settings,
        description: 'Manage your account',
    },
];

export default function ProfileSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const filteredMenuItems = menuItems.filter(item => {
        if (!item.roles) return true;
        return user && item.roles.includes(user.role);
    });

    return (
        <div className="w-full lg:w-64 bg-black border-r border-gray-800">
            <div className="p-6">
                {/* User Info */}
                <div className="mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-2xl mb-4 mx-auto lg:mx-0">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h2 className="text-white font-bold text-xl mb-1">{user?.username || 'User'}</h2>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-400/10 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-400/20">
                        {user?.role || 'CUSTOMER'}
                    </span>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2">
                    {filteredMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-yellow-400/10 border border-yellow-400/20'
                                        : 'hover:bg-gray-800/50 border border-transparent'
                                    }`}
                            >
                                <Icon
                                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-yellow-400' : 'text-gray-400 group-hover:text-white'
                                        }`}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`font-medium text-sm ${isActive ? 'text-yellow-400' : 'text-white group-hover:text-yellow-400'
                                            }`}
                                    >
                                        {item.label}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 group mt-4"
                    >
                        <LogOut className="w-5 h-5 mt-0.5 text-gray-400 group-hover:text-red-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium text-sm text-white group-hover:text-red-400">Logout</p>
                            <p className="text-gray-500 text-xs mt-0.5">Sign out of your account</p>
                        </div>
                    </button>
                </nav>
            </div>
        </div>
    );
}
