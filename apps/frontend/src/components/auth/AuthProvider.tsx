'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { authService } from '@/lib/services/auth.service';
import { User, LoginRequest, RegisterRequest } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showLogin: () => void;
  showRegister: () => void;
  hideModals: () => void;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (user: User) => void;
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
  const [user, setUserState] = useState<User | null>(null);
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
      setUserState(storedUser);
      console.log(' User restored from localStorage:', storedUser.username);
    } else {
      console.log(' No stored auth found');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    console.log('Login attempt:', credentials.email);
    const { token, user: userData } = await authService.login(credentials);
    authService.storeAuth(token, userData);
    setUserState(userData);
    console.log(' Login successful:', userData.username, 'Token stored:', !!token);
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
    // After registration, auto-login
    await login({ email: data.email, password: data.password });
  };

  const googleLoginHandler = async (credential: string) => {
    console.log('Google login attempt');
    const { token, user: userData } = await authService.googleLogin(credential);
    authService.storeAuth(token, userData);
    setUserState(userData);
    console.log(' Google login successful:', userData.username);
  };

  const logout = async () => {
    await authService.logout();
    setUserState(null);
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
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
      googleLogin: googleLoginHandler,
      logout,
      setUser,
      updateUser: setUser
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
