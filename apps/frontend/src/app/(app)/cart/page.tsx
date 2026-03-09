'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ShoppingCartPage from '@/components/cart/Cart';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-yellow-400 animate-spin" />
      </div>
    );
  }

  return <ShoppingCartPage />;
}