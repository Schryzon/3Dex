// app/(app)/layout.tsx
'use client';

import { useState } from 'react';
import AppSidebar from '@/components/layout/app/AppSidebar';
import AppTopbar from '@/components/layout/app/AppTopbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Topbar */}
      <AppTopbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Content with Sidebar */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <AppSidebar isOpen={sidebarOpen} />
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}