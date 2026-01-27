'use client';

import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedLink from '@/components/common/ProtectedLink';
import { useState } from 'react';

export default function LandingNavbar() {
  const { showLogin, showRegister, isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-yellow-400 text-black flex items-center justify-center font-black text-xl rounded">
              R
            </div>
            <span className="text-white font-bold text-xl md:text-2xl">3Dēx</span>
          </Link>

          {/* Desktop Nav Items */}
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

          {/* Search Dropdown - Desktop */}
          <div className="hidden md:block">
            <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 outline-none focus:border-yellow-400 cursor-pointer text-sm">
              <option>3D Models</option>
              <option>Textures</option>
              <option>CG Models</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
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
          <div className="flex items-center gap-2 md:gap-4">
            {/* Cart - Protected */}
            <ProtectedLink href="/cart" className="text-gray-300 hover:text-white transition-colors p-2">
              <ShoppingCart className="w-6 h-6" />
            </ProtectedLink>

            {/* Auth Buttons or User Menu */}
            {!isAuthenticated ? (
              <>
                <button
                  onClick={showLogin}
                  className="hidden sm:block text-white hover:text-gray-300 px-4 py-2 transition-colors"
                >
                  Login
                </button>

                <button
                  onClick={showRegister}
                  className="hidden sm:flex relative px-4 md:px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
                >
                  Register
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-yellow-400 text-black text-xs font-bold rounded">
                    Freebie
                  </span>
                </button>
              </>
            ) : (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-white text-sm">{user?.username}</span>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-white font-semibold text-sm">{user?.username}</p>
                      <p className="text-gray-400 text-xs">{user?.email}</p>
                    </div>
                    <ProtectedLink
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span className="text-sm">My Orders</span>
                    </ProtectedLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4">
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
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-4 space-y-3">
            {/* Search Category - Mobile */}
            <select className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 outline-none focus:border-yellow-400 cursor-pointer">
              <option>3D Models</option>
              <option>Textures</option>
              <option>CG Models</option>
            </select>

            {/* Nav Links */}
            <Link
              href="/catalog"
              className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              3D Models
            </Link>

            <Link
              href="/cg-models"
              className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                CG Models
                <span className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded">NEW</span>
              </div>
            </Link>

            <Link
              href="/textures"
              className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Textures
            </Link>

            {/* Auth Buttons - Mobile Only */}
            {!isAuthenticated && (
              <div className="sm:hidden space-y-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => {
                    showLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    showRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}