'use client';

import '@/app/globals.css';
import LandingNavbar from '@/components/layout/landing/LandingNavbar';
import LandingFooter from '@/components/layout/landing/LandingFooter';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <LandingNavbar />
      <main className="pt-20">{children}</main>
      <LandingFooter />
    </div>
  );
}
