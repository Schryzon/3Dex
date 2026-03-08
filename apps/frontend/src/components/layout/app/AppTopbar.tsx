'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
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
  Settings,
  LogOut
} from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-30 h-14 bg-[#111]/95 backdrop-blur-sm border-b border-white/[0.06]">
      <div className="h-full flex items-center justify-between px-4 md:px-6">

        {/* Mobile Logo & Menu Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-white cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/icon.png" alt="3Dex" className="w-full h-full object-contain" />
            </div>
          </Link>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search 3D models, textures, and more..."
              className="w-full pl-12 pr-4 py-2 bg-[#1a1a1a] border border-white/[0.06] rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Action Icons & User Menu */}
        <div className="flex items-center gap-1 md:gap-3">

          {/* Cart */}
          <Link href="/cart" className="p-2 text-gray-500 hover:text-white relative transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {mounted && cartItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>

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
                    <Link href="/notifications" className="flex items-center justify-between px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4" />
                        <span className="text-sm">Notifications</span>
                      </div>
                      {notificationsCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{notificationsCount}</span>
                      )}
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <User className="w-4 h-4" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                    <Link href="/downloads" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <Download className="w-4 h-4" />
                      <span className="text-sm">My Downloads</span>
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <Package className="w-4 h-4" />
                      <span className="text-sm">My Orders</span>
                    </Link>
                    <Link href="/saved" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors" onClick={() => setAvatarDropdownOpen(false)}>
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Saved Items</span>
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
    </header>
  );
}
