'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, X, LogOut, Settings, FolderOpen, Heart, Upload, BarChart3, Users, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedLink from '@/components/common/ProtectedLink';
import CategoryMegaMenu from '@/components/common/CategoryMegaMenu';
import { useState, useCallback, useEffect } from 'react';
import { useCart } from '@/lib/hooks/useCart';

export default function LandingNavbar() {
  const router = useRouter();
  const { showLogin, showRegister, isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<'3d-models' | 'cg-models' | 'textures' | null>(null);
  const [megaMenuCloseTimeout, setMegaMenuCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const { items } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = mounted ? items.length : 0;


  const handleLogout = useCallback(() => {
    logout();
    setUserMenuOpen(false);
  }, [logout]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const handleMegaMenuClick = useCallback((type: '3d-models' | 'cg-models' | 'textures') => {
    setMegaMenuOpen(prev => prev === type ? null : type);
  }, []);


  const handleProfileClick = useCallback(() => {
    router.push('/profile');
    setUserMenuOpen(false);
  }, [router]);

  // Role-based menu items
  const getRoleMenuItems = () => {
    const role = user?.role || 'CUSTOMER';

    if (role === 'ADMIN') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: Users, label: 'Users', href: '/admin/users' },
        { icon: FileText, label: 'Models', href: '/admin/models' },
        { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
      ];
    }

    if (role === 'ARTIST') {
      return [
        { icon: Upload, label: 'Upload Asset', href: '/upload' },
        { icon: FolderOpen, label: 'Collections', href: '/profile?tab=collections' },
        { icon: Heart, label: 'Saved Assets', href: '/saved' },
        { icon: LayoutDashboard, label: 'My Uploads', href: '/profile?tab=uploads' },
        { icon: BarChart3, label: 'Analytics', href: '/artist/analytics' },
      ];
    }

    // CUSTOMER (default)
    return [
      { icon: FolderOpen, label: 'Collections', href: '/profile?tab=collections' },
      { icon: Heart, label: 'Saved Assets', href: '/saved' },
      { icon: ShoppingCart, label: 'My Orders', href: '/orders' },
    ];
  };

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close mega menu if clicking outside
      if (megaMenuOpen && !target.closest('.mega-menu-container')) {
        setMegaMenuOpen(null);
      }

      // Close user menu if clicking outside
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [megaMenuOpen, userMenuOpen]);

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

          {/* Desktop Nav Items with Mega Menu */}
          <div className="hidden lg:flex items-center gap-6 mega-menu-container">
            <button
              onClick={() => handleMegaMenuClick('3d-models')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <span className="text-gray-500">○</span>
              <span>3D Models</span>
            </button>

            <button
              onClick={() => handleMegaMenuClick('cg-models')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <span className="text-gray-500">○</span>
              <span>CG Models</span>
              <span className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded">
                NEW
              </span>
            </button>

            <button
              onClick={() => handleMegaMenuClick('textures')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <span className="text-gray-500">○</span>
              <span>Textures</span>
            </button>
            {/* Mega Menu - Inside the same container */}
            {megaMenuOpen && (
              <CategoryMegaMenu
                isOpen={true}
                onClose={() => setMegaMenuOpen(null)}
                type={megaMenuOpen}
              />
            )}
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
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Cart - Protected */}
            <ProtectedLink href="/cart" className="text-gray-300 hover:text-white transition-colors p-2 cursor-pointer relative group">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform">
                  {cartItemCount}
                </span>
              )}
            </ProtectedLink>

            {/* Auth Buttons or User Menu */}
            {!isAuthenticated ? (
              <>
                <button
                  onClick={showLogin}
                  className="hidden sm:block text-white hover:text-gray-300 px-4 py-2 transition-colors cursor-pointer"
                >
                  Login
                </button>

                <button
                  onClick={showRegister}
                  className="hidden sm:flex relative px-4 md:px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base cursor-pointer"
                >
                  Register
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-yellow-400 text-black text-xs font-bold rounded">
                    Freebie
                  </span>
                </button>
              </>
            ) : (
              /* User Menu */
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer z-50 relative"
                >
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-white text-sm">{user?.username}</span>
                </button>

                {/* Backdrop Overlay */}
                {userMenuOpen && (
                  <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setUserMenuOpen(false)}
                  />
                )}

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="fixed md:absolute right-4 md:right-0 top-20 md:top-auto md:mt-2 w-64 md:w-56 bg-gray-900 md:bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-lg shadow-2xl py-2 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-3 border-b border-gray-800 hover:bg-gray-800/60 transition-colors cursor-pointer"
                    >
                      <p className="text-white font-semibold text-sm">{user?.username}</p>
                      <p className="text-gray-400 text-xs">{user?.email}</p>
                      <p className="text-yellow-400 text-xs mt-1 font-medium">{user?.role}</p>
                      <p className="text-gray-500 text-xs mt-2">View Profile →</p>
                    </Link>

                    {getRoleMenuItems().map((item) => (
                      <ProtectedLink
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors cursor-pointer"
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </ProtectedLink>
                    ))}

                    <div className="border-t border-gray-800 mt-1 pt-1">
                      <ProtectedLink
                        href="/profile/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </ProtectedLink>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-300 hover:text-white cursor-pointer active:bg-gray-800 transition-colors"
              style={{ touchAction: 'manipulation' }}
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
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer">
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

            {/* Collections & Bookmarks - Mobile */}
            {isAuthenticated && (
              <div className="border-t border-gray-800 pt-3 space-y-2">
                <Link
                  href="/collections"
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FolderOpen className="w-5 h-5" />
                  Collections
                </Link>
                <Link
                  href="/saved"
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5 text-red-500" />
                  Saved
                </Link>
              </div>
            )}

            {/* Auth Buttons - Mobile Only */}
            {!isAuthenticated && (
              <div className="sm:hidden space-y-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => {
                    showLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors text-left cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    showRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
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