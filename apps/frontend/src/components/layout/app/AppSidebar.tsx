'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
  LogOut
} from 'lucide-react';
import {
  SIDEBAR_MENU,
  SIDEBAR_MY_STUFF,
  SIDEBAR_ARTIST,
  SIDEBAR_PROVIDER,
  SIDEBAR_ADMIN,
  SIDEBAR_BOTTOM,
  NavItem
} from '@/lib/constants/navigation';
import { ROUTES } from '@/lib/constants/routes';
import SidebarNavItem from './sidebar/SidebarNavItem';
import SidebarSection from './sidebar/SidebarSection';

interface AppSidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  user: any;
  isLoggedIn: boolean;
  handleLogout: () => void;
  menuItems: NavItem[];
  myStuffItems: NavItem[];
  artistItems: NavItem[];
  providerItems: NavItem[];
  adminItems: NavItem[];
  bottomItems: NavItem[];
}

export default function AppSidebar({
  isSidebarOpen,
  setSidebarOpen,
  isMobileOpen,
  setMobileOpen,
  user,
  isLoggedIn,
  handleLogout,
  menuItems,
  myStuffItems,
  artistItems,
  providerItems,
  adminItems,
  bottomItems,
}: AppSidebarProps) {
  const pathname = usePathname();

  const renderNavItems = (items: NavItem[]) => (
    items.map((item) => {
      const href = item.href;

      const isActive = pathname === href ||
        (href !== '/' && pathname?.startsWith(href + '/')) ||
        (href === '/' && pathname === '/');

      return (
        <SidebarNavItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          href={href}
          isActive={isActive}
          isSidebarOpen={isSidebarOpen}
          title={!isSidebarOpen ? item.label : undefined}
          count={item.count}
          requiresAuth={item.requiresAuth}
        />
      );
    })
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#111] border-r border-white/[0.06] z-[80] transition-all duration-300 ease-in-out flex flex-col
                  ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
                  lg:translate-x-0 ${isSidebarOpen ? 'lg:w-64' : 'lg:w-16'}
              `}
    >
      {/* Logo Section */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06]">
        {isSidebarOpen ? (
          <Link href={ROUTES.PUBLIC.LANDING} className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img src="/3Dex.svg" alt="3Dex" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-bold text-lg">3Dēx</span>
          </Link>
        ) : (
          <div className="w-full flex justify-center" />
        )}

        {/* Toggle Sidebar (Desktop) */}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={isSidebarOpen}
          className={`hidden lg:flex items-center justify-center transition-colors cursor-pointer text-gray-500 hover:text-white hover:bg-white/[0.04] rounded-lg p-2 ${!isSidebarOpen ? 'absolute left-1/2 -translate-x-1/2' : ''}`}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" aria-hidden="true" /> : <PanelLeftOpen className="w-5 h-5" aria-hidden="true" />}
        </button>

        {/* Close Sidebar (Mobile) */}
        <button
          className="lg:hidden text-gray-500 hover:text-white p-2"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation Areas */}
      <nav aria-label="App navigation" className={`flex-1 overflow-y-auto py-4 space-y-6 scrollbar-hide ${isSidebarOpen ? 'px-3' : 'px-2'}`}>

        {/* Main Menu */}
        <SidebarSection label="Main Menu" isVisible={isSidebarOpen}>
          {renderNavItems(menuItems)}
        </SidebarSection>

        {/* My Stuff (General Auth) */}
        {isLoggedIn && (
          <SidebarSection label="My Stuff" isVisible={isSidebarOpen}>
            {renderNavItems(myStuffItems)}
          </SidebarSection>
        )}

        {/* Artist Tools */}
        {isLoggedIn && user?.role === 'ARTIST' && (
          <SidebarSection label="Artist Tools" isVisible={isSidebarOpen}>
            {renderNavItems(artistItems)}
          </SidebarSection>
        )}

        {/* Provider Tools */}
        {isLoggedIn && user?.role === 'PROVIDER' && (
          <SidebarSection label="Provider Tools" isVisible={isSidebarOpen}>
            {renderNavItems(providerItems)}
          </SidebarSection>
        )}

        {/* Administration */}
        {isLoggedIn && user?.role === 'ADMIN' && (
          <SidebarSection label="Administration" isVisible={isSidebarOpen}>
            {renderNavItems(adminItems)}
          </SidebarSection>
        )}

      </nav>

      {/* Bottom Actions (Settings, Logout) */}
      <div className="p-3 border-t border-white/[0.06] bg-[#111] mt-auto">
        <div className="space-y-1">
          {isLoggedIn && (
            <>
              {renderNavItems(bottomItems)}
              <button
                onClick={handleLogout}
                title={!isSidebarOpen ? "Log Out" : undefined}
                aria-label="Log out"
                className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center px-2'} py-2.5 rounded-lg text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all overflow-hidden whitespace-nowrap cursor-pointer font-medium`}
              >
                <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className={`transition-all duration-300 ${!isSidebarOpen ? 'hidden w-0 opacity-0' : 'opacity-100 ml-3'}`}>
                  Log Out
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}