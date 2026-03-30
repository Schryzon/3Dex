'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Menu,
  ChevronDown,
  Bell,
  User,
  Download,
  Package,
  Heart,
  FolderOpen,
  Settings,
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import ProtectedLink from '@/components/common/ProtectedLink';
import { ROUTES } from '@/lib/constants/routes';

interface AppTopbarProps {
  user: any;
  isLoggedIn: boolean;
  mounted: boolean;
  cartItemsCount: number;
  isAvatarDropdownOpen: boolean;
  setAvatarDropdownOpen: (open: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  handleLogout: () => void;
  notificationsCount?: number;
  showLogin?: () => void;
  showRegister?: () => void;
}

export default function AppTopbar({
  user,
  isLoggedIn,
  mounted,
  cartItemsCount,
  isAvatarDropdownOpen,
  setAvatarDropdownOpen,
  setMobileOpen,
  handleLogout,
  notificationsCount = 0,
  showLogin,
  showRegister,
}: AppTopbarProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/catalog?search=${encodeURIComponent(q)}`);
      setMobileSearchOpen(false);
    }
  };

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isAvatarDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAvatarDropdownOpen, setAvatarDropdownOpen]);
  return (
    <header className="sticky top-0 z-30 bg-[#111]/95 backdrop-blur-sm border-b border-white/[0.06]">
      <div className="h-14 flex items-center justify-between px-4 md:px-6">

        {/* Mobile Logo & Menu Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-white cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href={ROUTES.PUBLIC.LANDING} className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/3Dex.svg" alt="3Dex" className="w-full h-full object-contain" />
            </div>
          </Link>
        </div>

        {/* Global Search — Desktop */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 3D models, textures, and more..."
              className="w-full pl-11 pr-9 py-2 bg-[#1a1a1a] border border-white/[0.06] rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Mobile: spacer + search icon */}
        <div className="flex-1 md:hidden" />

        {/* Action Icons & User Menu */}
        <div className="flex items-center gap-1 md:gap-3">

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-2 text-gray-500 hover:text-white transition-colors md:hidden cursor-pointer"
            aria-label="Toggle search"
          >
            {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Cart */}
          <ProtectedLink href={ROUTES.USER.CART} className="p-2 text-gray-500 hover:text-white relative transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {mounted && cartItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </ProtectedLink>

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAvatarDropdownOpen(!isAvatarDropdownOpen)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="relative">
                  <UserAvatar user={user} size="sm" className="border-2 border-white/[0.08]" />
                  {mounted && notificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#111]" />
                  )}
                </div>
                <ChevronDown className={`w-3 h-3 text-gray-500 hidden md:block transition-transform ${isAvatarDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAvatarDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-white/[0.06] rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-white text-sm font-medium">{user?.username}</p>
                    <p className="text-gray-500 text-xs">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    {user?.role === 'ADMIN' && (
                      <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm font-bold">Admin Dashboard</span>
                      </Link>
                    )}
                    <Link href={ROUTES.USER.PROFILE} className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <User className="w-4 h-4" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                    <Link href={ROUTES.USER.NOTIFICATIONS} className="flex items-center justify-between px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4" />
                        <span className="text-sm">Notifications</span>
                      </div>
                      {notificationsCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{notificationsCount}</span>
                      )}
                    </Link>
                    <Link href={ROUTES.USER.DOWNLOADS} className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <Download className="w-4 h-4" />
                      <span className="text-sm">My Downloads</span>
                    </Link>
                    <Link href={ROUTES.USER.ORDERS} className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <Package className="w-4 h-4" />
                      <span className="text-sm">My Orders</span>
                    </Link>
                    <Link href={ROUTES.USER.LIBRARY} className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <FolderOpen className="w-4 h-4" />
                      <span className="text-sm">My Library</span>
                    </Link>
                  </div>
                  <div className="border-t border-white/[0.06] py-1">
                    <button
                      onClick={() => { handleLogout(); setAvatarDropdownOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-white/[0.04] hover:text-red-300 transition-colors w-full text-left cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={showLogin}
                className="hidden md:block px-3 py-1.5 text-sm text-gray-500 hover:text-white transition-colors cursor-pointer font-medium"
              >
                Log In
              </button>
              <button
                onClick={showRegister}
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 py-2 border-t border-white/[0.06] bg-[#111]/95 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              ref={mobileSearchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 3D models, textures..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#1a1a1a] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
}
