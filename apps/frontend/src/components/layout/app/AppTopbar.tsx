'use client';

import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import Link from 'next/link';

interface AppTopbarProps {
  onMenuClick: () => void;
}

export default function AppTopbar({ onMenuClick }: AppTopbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111] border-b border-gray-800">
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
          style={{ touchAction: 'manipulation' }}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
          <div className="w-8 h-8 bg-yellow-400 text-black flex items-center justify-center font-black">
            R
          </div>
          3Dēx
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-3xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for 3D assets..."
              className="w-full bg-[#1a1a1a] text-white px-6 py-3 pr-12 rounded-full outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="p-2 text-gray-400 hover:text-white relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center">
              0
            </span>
          </Link>

          <button className="p-2 text-gray-400 hover:text-white cursor-pointer">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}