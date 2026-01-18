'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

      <Hero 
        backgroundImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
        stats="1.8M"
        subtitle="Trusted by over"
        title="The grandest 3D asset collection"
        description="Manage and distribute your 3D Models and Textures assets. Elevate your CG art to a higher level with our top-notch quality content!"
        ctaText="Join for free"
        ctaHref="/register"
      />

      <Footer />

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
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