'use client';

import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LandingNavbar() {
  const { showLogin, showRegister } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-400 text-black flex items-center justify-center font-black text-xl rounded">
              R
            </div>
            <span className="text-white font-bold text-2xl">3Dēx</span>
          </Link>

          {/* Nav Items */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/catalog" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <span className="text-gray-500">○</span>
              <span>3D Models</span>
            </Link>
            
            <Link href="/cg-models" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <span className="text-gray-500">○</span>
              <span>CG Models</span>
              <span className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded">
                NEW
              </span>
            </Link>
            
            <Link href="/textures" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <span className="text-gray-500">○</span>
              <span>Textures</span>
            </Link>
          </div>

          {/* Search Dropdown */}
          <div className="hidden md:block">
            <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 outline-none focus:border-yellow-400 cursor-pointer">
              <option>3D Models</option>
              <option>Textures</option>
              <option>CG Models</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Keywords"
                className="w-full bg-gray-800 text-white px-4 py-2.5 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 border border-gray-700 placeholder-gray-400"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="text-gray-300 hover:text-white transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </Link>

            <button 
              onClick={showLogin}
              className="text-white hover:text-gray-300 px-4 py-2 transition-colors"
            >
              Login
            </button>

            <button 
              onClick={showRegister}
              className="relative px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Register
              <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-yellow-400 text-black text-xs font-bold rounded">
                Freebie
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}