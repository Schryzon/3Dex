'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, ShoppingCart, Menu, X, LogOut, Settings,
  FolderOpen, Heart, Upload, BarChart3, Users, FileText,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import ProtectedLink from '@/components/common/ProtectedLink';
import { useState, useCallback, useEffect } from 'react';
import { useCart } from '@/features/cart';
import UserAvatar from '@/components/common/UserAvatar';
import Image from 'next/image';
import { ROUTES } from '@/lib/constants/routes';

const ROLE_MENU_ITEMS = {
  ADMIN: [
    { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD },
    { icon: Users, label: 'Users', href: ROUTES.ADMIN.USERS },
    { icon: FileText, label: 'Models', href: ROUTES.ADMIN.MODELS },
    { icon: BarChart3, label: 'Reports', href: ROUTES.ADMIN.REPORTS },
  ],
  ARTIST: [
    { icon: Upload, label: 'Upload Asset', href: ROUTES.ARTIST.UPLOAD },
    { icon: FolderOpen, label: 'Collections', href: ROUTES.USER.PROFILE_COLLECTIONS },
    { icon: Heart, label: 'Saved Assets', href: ROUTES.USER.SAVED },
    { icon: LayoutDashboard, label: 'My Uploads', href: ROUTES.USER.PROFILE_UPLOADS },
    { icon: BarChart3, label: 'Analytics', href: ROUTES.ARTIST.ANALYTICS },
  ],
  PROVIDER: [
    { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.PROVIDER.DASHBOARD },
    { icon: FolderOpen, label: 'Print Jobs', href: ROUTES.PROVIDER.JOBS },
    { icon: Heart, label: 'Saved Assets', href: ROUTES.USER.SAVED },
  ],
  CUSTOMER: [
    { icon: FolderOpen, label: 'Collections', href: ROUTES.USER.PROFILE_COLLECTIONS },
    { icon: Heart, label: 'Saved Assets', href: ROUTES.USER.SAVED },
    { icon: ShoppingCart, label: 'My Orders', href: ROUTES.USER.ORDERS },
  ],
};

type MegaMenuType = '3d-models' | 'cg-models' | 'textures';

const NAV_LABELS: Record<MegaMenuType, string> = {
  '3d-models': '3D Models',
  'cg-models': '3D Printer',
  'textures': 'Textures',
};

const MOBILE_NAV = [
  { label: '3D Models', href: ROUTES.PUBLIC.CATALOG },
  { label: '3D Printer', href: ROUTES.PUBLIC.PRINT_SERVICES },
  { label: 'Textures', href: ROUTES.PUBLIC.TEXTURES },
];

export default function LandingNavbar() {
  const router = useRouter();
  const { showLogin, showRegister, isAuthenticated, user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const { items } = useCart();
  const cartItemCount = mounted ? items.length : 0;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (userMenuOpen && !target.closest('.user-menu-container')) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = useCallback(() => {
    logout();
    setUserMenuOpen(false);
  }, [logout]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (q) router.push(`/catalog?search=${encodeURIComponent(q)}`);
  }, [searchQuery, router]);

  const roleMenuItems = ROLE_MENU_ITEMS[(user?.role as keyof typeof ROLE_MENU_ITEMS) || 'CUSTOMER'] || [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href={ROUTES.PUBLIC.LANDING} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 flex items-center justify-center">
              <Image src="/3Dex.svg" alt="3Dex" width={32} height={32} />
            </div>
            <span className="text-white font-bold text-xl md:text-2xl">3Dēx</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href={ROUTES.PUBLIC.CATALOG}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-gray-500">○</span>
              <span>3D Models</span>
            </Link>
            <Link
              href={ROUTES.PUBLIC.PRINT_SERVICES}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-gray-500">○</span>
              <span>3D Printer</span>
            </Link>
            <Link
              href={ROUTES.PUBLIC.TEXTURES}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-gray-500">○</span>
              <span>Textures</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search 3D models, textures..."
                className="w-full bg-[#111111] text-white px-4 py-2.5 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 border border-gray-800 placeholder-gray-400"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Cart */}
            <ProtectedLink href={ROUTES.USER.CART} className="text-gray-300 hover:text-white transition-colors p-2 cursor-pointer relative group">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform">
                  {cartItemCount}
                </span>
              )}
            </ProtectedLink>

            {/* Auth */}
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
                  className="hidden sm:flex px-4 md:px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base cursor-pointer"
                >
                  Register
                </button>
              </>
            ) : (
              /* User Menu */
              <div
                className="relative user-menu-container"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  onMouseEnter={() => setUserMenuOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer z-50 relative outline-none"
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="hidden md:block text-white text-sm">{user?.username}</span>
                </button>

                {userMenuOpen && (
                  <div className="fixed md:absolute right-4 md:right-0 top-20 md:top-auto md:mt-0 w-64 md:w-56 pt-3 z-50">
                    <div className="bg-[#111111] backdrop-blur-md border border-gray-800 rounded-lg shadow-2xl py-2">

                      <Link
                        href={ROUTES.USER.PROFILE}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-3 border-b border-gray-800 hover:bg-gray-800/60 transition-colors"
                      >
                        <p className="text-white font-semibold text-sm">{user?.username}</p>
                        <p className="text-gray-400 text-xs">{user?.email}</p>
                        <p className="text-yellow-400 text-xs mt-1 font-medium">{user?.role}</p>
                        <p className="text-gray-500 text-xs mt-2">View Profile →</p>
                      </Link>

                      {roleMenuItems.map((item) => (
                        <ProtectedLink
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors cursor-pointer"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm">{item.label}</span>
                        </ProtectedLink>
                      ))}

                      <div className="border-t border-gray-800 mt-1 pt-1">

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-500">Logout</span>
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-300 hover:text-white cursor-pointer active:bg-gray-800 transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search 3D models, textures..."
              className="w-full bg-[#111111] text-white px-4 py-2.5 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 border border-gray-800 placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#111111] border-t border-gray-800 absolute w-full max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-3">

            {MOBILE_NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}

            {isAuthenticated && (
              <div className="border-t border-gray-800 pt-3 space-y-2">
                <Link
                  href={ROUTES.USER.DASHBOARD}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-semibold">Dashboard</span>
                </Link>
                <Link
                  href={ROUTES.USER.PROFILE}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserAvatar user={user} size="sm" className="border-2 border-gray-700" />
                  <span className="text-sm font-semibold">{user?.username}</span>
                </Link>
                <Link
                  href={ROUTES.USER.PROFILE_COLLECTIONS}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FolderOpen className="w-5 h-5" />
                  Collections
                </Link>
                <Link
                  href={ROUTES.USER.SAVED}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5 text-red-500" />
                  Saved
                </Link>
              </div>
            )}

            {!isAuthenticated && (
              <div className="sm:hidden space-y-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => { showLogin(); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors text-center cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  Login
                </button>
                <button
                  onClick={() => { showRegister(); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
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