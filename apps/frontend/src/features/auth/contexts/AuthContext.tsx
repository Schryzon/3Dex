'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import UsernameSetupModal from '../components/UsernameSetupModal';
import { authService } from '@/lib/api/services/auth.service';
import { User, LoginRequest, RegisterRequest } from '@/types';

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
  const [showUsernameSetupModal, setShowUsernameSetupModal] = useState(false);

  // On mount, validate the session by calling /auth/me.
  // The HTTP-only cookie is sent automatically by the browser.
  // We also show a cached user immediately from localStorage for instant UI,
  // then replace it with the fresh value from the server.
  useEffect(() => {
    const cachedUser = authService.getStoredUser();
    if (cachedUser) {
      // Optimistically restore the cached user so the UI is not blank
      setUserState(cachedUser);
    }

    authService.getCurrentUser()
      .then((freshUser) => {
        setUserState(freshUser);
        // Keep the cache in sync with the server value
        authService.storeUser(freshUser);
      })
      .catch(() => {
        // Cookie missing or expired — treat as logged out
        setUserState(null);
        authService.clearStoredUser();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (credentials: LoginRequest) => {
    // Server sets the HTTP-only cookie in the response
    const { user: userData } = await authService.login(credentials);
    // Cache user data in localStorage for instant UI on next load
    authService.storeUser(userData);
    setUserState(userData);
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
    // Auto-login after successful registration
    await login({ email: data.email, password: data.password });
  };

  const googleLoginHandler = async (credential: string) => {
    // Server sets the HTTP-only cookie in the response
    const response = await authService.googleLogin(credential);
    authService.storeUser(response.user);
    setUserState(response.user);

    // If this is a brand-new Google account, prompt for username before continuing
    if (response.needs_username) {
      setShowUsernameSetupModal(true);
    }
  };

  const logout = async () => {
    // Server clears the HTTP-only cookie
    await authService.logout();
    authService.clearStoredUser();
    setUserState(null);
  };

  // Allow direct user mutation (e.g. after profile update)
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      authService.storeUser(newUser);
    } else {
      authService.clearStoredUser();
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
      updateUser: setUser,
    }}>
      {children}

      {/* Global auth modals */}
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

      {/* Username setup modal — shown once after first Google sign-in */}
      <UsernameSetupModal
        isOpen={showUsernameSetupModal}
        onComplete={(updatedUser) => {
          authService.storeUser(updatedUser);
          setUserState(updatedUser);
          setShowUsernameSetupModal(false);
        }}
      />
    </AuthContext.Provider>
  );
}
