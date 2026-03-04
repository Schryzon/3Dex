'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCart } from '@/lib/hooks/useCart';
import AppSidebar from '@/components/layout/app/AppSidebar';
import AppTopbar from '@/components/layout/app/AppTopbar';
import DevTools from '@/components/common/DevTools';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated: isLoggedIn, isLoading: isAuthLoading, logout, showLogin, showRegister } = useAuth();
  const { items: cartItems } = useCart();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isAvatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();

  // Routes accessible without login
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/catalog') ||
    pathname.startsWith('/print-services') ||
    pathname.startsWith('/community') ||
    pathname.startsWith('/u/');

  // Auth guard: redirect unauthenticated users only for private pages
  useEffect(() => {
    // Only redirect if: loading is done, NOT logged in, AND path is NOT public
    if (!isAuthLoading && !isLoggedIn && !isPublicRoute) {
      router.replace('/');
    }
  }, [isAuthLoading, isLoggedIn, isPublicRoute, router]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <AppSidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
        user={user}
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>

        {/* Topbar Component */}
        <AppTopbar
          user={user}
          isLoggedIn={isLoggedIn}
          mounted={mounted}
          cartItemsCount={cartItems.length}
          isAvatarDropdownOpen={isAvatarDropdownOpen}
          setAvatarDropdownOpen={setAvatarDropdownOpen}
          setMobileOpen={setMobileOpen}
          handleLogout={handleLogout}
          showLogin={showLogin}
          showRegister={showRegister}
        />

        {/* Content Wrapper */}
        <div className="relative">
          {children}
        </div>
      </main>

      <DevTools />
    </div>
  );
}