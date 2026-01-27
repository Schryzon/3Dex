'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  ShoppingCart, 
  Heart, 
  Package, 
  Settings,
  Home
} from 'lucide-react';

interface AppSidebarProps {
  isOpen: boolean;
}
export default function AppSidebar({ isOpen }: AppSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutGrid, label: 'Catalog', href: '/catalog' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart' },
    { icon: Heart, label: 'Collections', href: '/collections' },
    { icon: Package, label: 'Orders', href: '/orders' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#111] border-r border-gray-800 transition-all duration-300 z-40 ${
      isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20'
    }`}>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}