'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import RegisterModal from './RegisterModal';

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavbarProps {
  logo?: string;
  navItems?: NavItem[];
}

export default function Navbar({ 
  logo = "3Dēx",
  navItems = [
    { label: "3D Models", href: "/models" },
    { label: "CG Models", href: "/cg-models", badge: "NEW" },
    { label: "Textures", href: "/textures" }
  ]
}: NavbarProps) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-yellow-400 font-bold text-2xl hover:text-yellow-300 transition-colors flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-400 text-black flex items-center justify-center font-black text-xl">
                R
              </div>
              {logo}
            </Link>

            {/* Nav Items */}
            <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">⬡</span>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Search Bar - Takes remaining space */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <select className="absolute left-0 top-0 h-full bg-gray-800 text-white px-4 rounded-l-full border-r border-gray-700 outline-none appearance-none pr-8">
                  <option>3D Models</option>
                  <option>Textures</option>
                  <option>CG Models</option>
                </select>
                <input
                  type="text"
                  placeholder="Search Keywords"
                  className="w-full bg-gray-800 text-white pl-40 pr-12 py-3 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button className="text-gray-300 hover:text-white relative">
                <ShoppingCart className="w-6 h-6" />
              </button>
              
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-white px-4 py-2"
              >
                Login
              </Link>
              
              <button 
                onClick={() => setIsRegisterOpen(true)}
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

      {/* Register Modal */}
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </>
  );
}