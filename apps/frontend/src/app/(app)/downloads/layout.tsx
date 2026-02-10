'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import {
    Search,
    ShoppingCart,
    Home,
    Grid3x3,
    Download,
    Menu,
    X,
    PanelLeftClose,
    PanelLeftOpen,
    LogOut,
    Settings,
    User,
    ChevronDown,
    Package,
    Heart,
    Boxes,
    Bell
} from 'lucide-react';

// Sidebar menu items
const SIDEBAR_MENU = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'browse', label: 'Catalog', icon: Grid3x3, href: '/catalog' },
    { id: 'print', label: 'Print Services', icon: Boxes, href: '/print-services' },
];

const SIDEBAR_MY_STUFF = [
    { id: 'downloads', label: 'Downloads', icon: Download, href: '/downloads' },
    { id: 'orders', label: 'My Orders', icon: Package, href: '/orders' },
    { id: 'saved', label: 'Saved', icon: Heart, href: '/saved' },
];

const SIDEBAR_BOTTOM = [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/profile?tab=settings' },
    { id: 'logout', label: 'Log Out', icon: LogOut, href: '/logout' },
];

export default function DownloadsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileOpen, setMobileOpen] = useState(false);
    const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [isAvatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { items } = useCart();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const mockUser = { name: 'John Doe', email: 'john@example.com', initials: 'JD' };

    useEffect(() => {
        setMounted(true);
        setMobileOpen(false);
        setMobileSearchOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-[#141414] border-r border-gray-800 z-50 transition-all duration-300 ease-in-out overflow-x-hidden
                    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
                    lg:translate-x-0 ${isSidebarOpen ? 'lg:w-64' : 'lg:w-16'}
                `}
            >
                {/* Logo Section */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800">
                    {isSidebarOpen ? (
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-black font-bold text-sm">3D</span>
                            </div>
                            <span className="text-white font-bold text-lg">3Dēx</span>
                        </Link>
                    ) : (
                        <div className="w-full flex justify-center" />
                    )}

                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className={`hidden lg:flex items-center justify-center transition-colors cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg p-2 ${!isSidebarOpen ? 'absolute left-1/2 -translate-x-1/2' : ''}`}
                        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                    </button>

                    <button className="lg:hidden text-gray-400 hover:text-white p-2" onClick={() => setMobileOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 overflow-y-auto py-4 space-y-6 scrollbar-hide ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
                    {/* Main Menu */}
                    <div>
                        {isSidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Main Menu</div>}
                        <div className="space-y-1">
                            {SIDEBAR_MENU.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        title={!isSidebarOpen ? item.label : undefined}
                                        className={`relative flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center px-2'} py-2.5 rounded-lg transition-all group overflow-hidden whitespace-nowrap ${isActive ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        <span className={`font-medium transition-opacity duration-300 ${!isSidebarOpen ? 'hidden w-0' : 'opacity-100 ml-3'}`}>{item.label}</span>
                                        {isActive && <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full transition-opacity ${!isSidebarOpen ? 'hidden' : ''}`} />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* My Stuff */}
                    <div>
                        {isSidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">My Stuff</div>}
                        <div className="space-y-1">
                            {SIDEBAR_MY_STUFF.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        title={!isSidebarOpen ? item.label : undefined}
                                        className={`flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center px-2'} py-2.5 rounded-lg transition-all group overflow-hidden whitespace-nowrap ${isActive ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        <span className={`font-medium transition-opacity duration-300 ${!isSidebarOpen ? 'hidden w-0' : 'opacity-100 ml-3'}`}>{item.label}</span>
                                        {isActive && <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full transition-opacity ${!isSidebarOpen ? 'hidden' : ''}`} />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-gray-800 bg-[#141414]">
                    <div className="space-y-1">
                        {SIDEBAR_BOTTOM.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    title={!isSidebarOpen ? item.label : undefined}
                                    className={`flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center px-2'} py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all overflow-hidden whitespace-nowrap`}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span className={`font-medium transition-opacity duration-300 ${!isSidebarOpen ? 'hidden w-0' : 'opacity-100 ml-3'}`}>{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-14 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800">
                    <div className="h-full flex items-center justify-between px-4 md:px-6">
                        <div className="flex items-center gap-3 lg:hidden">
                            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-gray-400 hover:text-white cursor-pointer">
                                <Menu className="w-6 h-6" />
                            </button>
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                    <span className="text-black font-bold text-sm">3D</span>
                                </div>
                            </Link>
                        </div>

                        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search 3D models, textures, and more..."
                                    className="w-full pl-12 pr-4 py-2.5 bg-[#1a1a1a] border border-gray-800 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 md:hidden" />

                        <div className="flex items-center gap-1 md:gap-3">
                            <button onClick={() => setMobileSearchOpen(true)} className="md:hidden p-2 text-gray-400 hover:text-white cursor-pointer">
                                <Search className="w-5 h-5" />
                            </button>

                            <Link href="/cart" className="p-2 text-gray-400 hover:text-white relative transition-colors">
                                <ShoppingCart className="w-5 h-5" />
                                {mounted && items.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {items.length}
                                    </span>
                                )}
                            </Link>

                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsLoggedIn(true)} className="hidden md:block px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Log In</button>
                                <button onClick={() => setIsLoggedIn(true)} className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-medium rounded-lg transition-colors cursor-pointer">Sign Up</button>
                            </div>
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}
