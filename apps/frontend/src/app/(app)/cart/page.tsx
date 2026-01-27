'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/landing/LandingNavbar';
import Footer from '@/components/layout/landing/LandingFooter';
import ShoppingCartPage from '@/components/cart/Cart';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';

export default function CartPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    // Check localStorage or your auth state
    const userLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!userLoggedIn) {
      // Show login modal if not logged in
      setShowLoginModal(true);
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle login modal close - redirect to home if user closes without logging in
  const handleLoginClose = () => {
    if (!isLoggedIn) {
      router.push('/');
    } else {
      setShowLoginModal(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <Navbar 
        logo="3Dēx"
        navItems={[
          { label: "3D Models", href: "/models" },
          { label: "CG Models", href: "/cg-models", badge: "NEW" },
          { label: "Textures", href: "/textures" }
        ]}
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
      />

      {/* Only show cart if logged in */}
      {isLoggedIn ? (
        <ShoppingCartPage />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Please login to access your cart</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-lg transition-colors cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      )}

      <Footer />

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={handleLoginClose}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </main>
  );
}