'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

interface AuthContextType {
  showLogin: () => void;
  showRegister: () => void;
  hideModals: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const showLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const showRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const hideModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  return (
    <AuthContext.Provider value={{ showLogin, showRegister, hideModals }}>
      {children}

      {/* Global Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={hideModals}
        onSwitchToRegister={showRegister}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={hideModals}
        onSwitchToLogin={showLogin}
      />
    </AuthContext.Provider>
  );
}