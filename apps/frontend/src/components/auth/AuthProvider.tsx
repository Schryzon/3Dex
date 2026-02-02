'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { authService, User, LoginCredentials, RegisterData } from '@/lib/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showLogin: () => void;
  showRegister: () => void;
  hideModals: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const storedToken = authService.getStoredToken();

    // Debug logging
    console.log(' AuthProvider - Checking stored auth:', {
      hasUser: !!storedUser,
      hasToken: !!storedToken,
      user: storedUser,
      tokenPreview: storedToken ? storedToken.substring(0, 20) + '...' : null
    });

    if (storedUser && storedToken) {
      setUser(storedUser);
      console.log(' User restored from localStorage:', storedUser.username);
    } else {
      console.log(' No stored auth found');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log('🔐 Login attempt:', credentials.email);
    const { token, user: userData } = await authService.login(credentials);
    authService.storeAuth(token, userData);
    setUser(userData);
    console.log(' Login successful:', userData.username, 'Token stored:', !!token);
  };

  const register = async (data: RegisterData) => {
    await authService.register(data);
    // After registration, auto-login
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

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
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      showLogin,
      showRegister,
      hideModals,
      login,
      register,
      logout
    }}>
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