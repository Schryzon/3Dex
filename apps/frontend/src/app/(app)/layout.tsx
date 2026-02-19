'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/components/auth/AuthProvider';
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
  Package,
  Heart,
  Boxes,
  ChevronDown,
  Bell,
  User,
  Upload,
  BarChart3,
  Users,
  FileText,
  LayoutDashboard,
  FolderOpen,
  Printer,
  Box,
  Settings2
} from 'lucide-react';
import DevTools from '@/components/common/DevTools';
import UserAvatar from '@/components/common/UserAvatar';

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

const SIDEBAR_ARTIST = [
  { id: 'upload', label: 'Upload Asset', icon: Upload, href: '/upload' },
  { id: 'my-uploads', label: 'My Uploads', icon: LayoutDashboard, href: '/profile?tab=uploads' },
  { id: 'collections', label: 'Collections', icon: FolderOpen, href: '/profile?tab=collections' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/artist/analytics' },
];

const SIDEBAR_ADMIN = [
  { id: 'admin-dash', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'models', label: 'Models', icon: FileText, href: '/admin/models' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/admin/reports' },
];

const SIDEBAR_PROVIDER = [
  { id: 'service-mgmt', label: 'My Printing Service', icon: Printer, href: '/profile?tab=service' },
  { id: 'print-jobs', label: 'Active Jobs', icon: Box, href: '/profile?tab=jobs' },
  { id: 'workshop', label: 'Workshop Setup', icon: Settings2, href: '/profile?tab=workshop' },
];

const SIDEBAR_BOTTOM = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/profile?tab=settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isAvatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { items } = useCart();
  const { user, isAuthenticated: isLoggedIn, isLoading: isAuthLoading, logout, showLogin, showRegister } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  // Auth guard: redirect unauthenticated users to landing page
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace('/');
    }
  }, [isAuthLoading, isLoggedIn, router]);

  useEffect(() => {
    setMounted(true);
    setMobileOpen(false);
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
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <img src="/icon.png" alt="3Dex" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-bold text-lg">3Dēx</span>
            </Link>
          ) : (
            <div className="w-full flex justify-center" />
          )}

          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className={`hidden lg:flex items-center justify-center transition-colors cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg p-2 ${!isSidebarOpen ? 'absolute left-1/2 -translate-x-1/2' : ''}`}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>

          <button
            className="lg:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 space-y-6 scrollbar-hide ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
          <div>
            {isSidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Main Menu</div>}
            <div className="space-y-1">
              {SIDEBAR_MENU.map((item) => {
                const Icon = item.icon;
                // Dynamic href for Home
                const href = item.id === 'home' ? (isLoggedIn ? '/dashboard' : '/') : item.href;
                const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href + '/')) || (href === '/' && pathname === '/');

                return (
                  <Link
                    key={item.id}
                    href={href}
                    title={!isSidebarOpen ? item.label : undefined}
                    className={`relative flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center px-2'} py-2.5 rounded-lg transition-all group overflow-hidden whitespace-nowrap ${isActive ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className={`font-medium transition-opacity duration-300 ${!isSidebarOpen ? 'hidden w-0' : 'opacity-100 ml-3'}`}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Conditional "My Stuff" Section */}
          {isLoggedIn && (
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
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {/* Conditional Artist Section */}
          {isLoggedIn && user?.role === 'ARTIST' && (
            <div>
              {isSidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Artist Tools</div>}
              <div className="space-y-1">
                {SIDEBAR_ARTIST.map((item) => {
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
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conditional Provider Section */}
          {isLoggedIn && user?.role === 'PROVIDER' && (
            <div>
              {isSidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Provider Tools</div>}
              <div className="space-y-1">
                {SIDEBAR_PROVIDER.map((item) => {
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
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conditional Admin Section */}
          {isLoggedIn && user?.role === 'ADMIN' && (
            <div>
              {isSidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Administration</div>}
              <div className="space-y-1">
                {SIDEBAR_ADMIN.map((item) => {
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
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-800 bg-[#141414]">
          <div className="space-y-1">
            {isLoggedIn && SIDEBAR_BOTTOM.map((item) => {
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
              );
            })}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                title={!isSidebarOpen ? "Log Out" : undefined}
                className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center px-2'} py-2.5 rounded-lg text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all overflow-hidden whitespace-nowrap cursor-pointer`}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className={`font-medium transition-opacity duration-300 ${!isSidebarOpen ? 'hidden w-0' : 'opacity-100 ml-3'}`}>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <header className="sticky top-0 z-30 h-14 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800">
          <div className="h-full flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 -ml-2 text-gray-400 hover:text-white cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src="/icon.png" alt="3Dex" className="w-full h-full object-contain" />
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
              <Link href="/cart" className="p-2 text-gray-400 hover:text-white relative transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {mounted && items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setAvatarDropdownOpen(!isAvatarDropdownOpen)}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <UserAvatar user={user} size="sm" className="border-2 border-gray-700" />
                    <ChevronDown className={`w-3 h-3 text-gray-400 hidden md:block transition-transform ${isAvatarDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isAvatarDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setAvatarDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-800">
                          <p className="text-white text-sm font-medium">{user?.username}</p>
                          <p className="text-gray-500 text-xs">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/notifications" className="flex items-center justify-between px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                            <div className="flex items-center gap-3">
                              <Bell className="w-4 h-4" />
                              <span className="text-sm">Notifications</span>
                            </div>
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">3</span>
                          </Link>
                          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                            <User className="w-4 h-4" />
                            <span className="text-sm">My Profile</span>
                          </Link>
                          <Link href="/downloads" className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                            <span className="text-sm">My Downloads</span>
                          </Link>
                          <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                            <Package className="w-4 h-4" />
                            <span className="text-sm">My Orders</span>
                          </Link>
                          <Link href="/saved" className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">Saved</span>
                          </Link>
                          <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                            <span className="text-sm">Settings</span>
                          </Link>
                        </div>
                        <div className="border-t border-gray-800 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors w-full text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Log Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={showLogin} className="hidden md:block px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Log In</button>
                  <button onClick={showRegister} className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-medium rounded-lg transition-colors cursor-pointer">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        </header>
        {children}
      </main>
      {/* Developer Tools */}
      <DevTools />
    </div>
  );
}