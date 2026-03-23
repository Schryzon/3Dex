'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleInitialized = useRef(false);

  // Initialize Google Sign-In button when modal opens
  useEffect(() => {
    if (!isOpen) {
      googleInitialized.current = false;
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') return;

    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current || googleInitialized.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          setIsLoading(true);
          setError('');
          try {
            await googleLogin(response.credential);
            // Close the login modal; AuthProvider will show UsernameSetupModal
            // for new users or leave them authenticated for existing users.
            onClose();
          } catch (err: any) {
            setError(err.response?.data?.message || 'Google login failed. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
      });

      // Clear previous button content
      googleBtnRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 400,
      });

      googleInitialized.current = true;
    };

    // Try immediately, and retry if Google script hasn't loaded yet
    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initGoogle();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isOpen, googleLogin, onClose, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email: formData.email, password: formData.password });
      onClose();
      setFormData({ email: '', password: '', rememberMe: false });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/50 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-md border border-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="cursor-pointer w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <h2 className="text-2xl font-bold text-white mb-1">Login</h2>
          <p className="text-gray-400 mb-4">
            New to 3Dēx?{' '}
            <button onClick={onSwitchToRegister} className="text-yellow-400 cursor-pointer hover:text-yellow-300">
              Register
            </button>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              fullWidth
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[26px] bottom-0 my-auto h-fit text-gray-400 hover:text-white cursor-pointer"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-400 cursor-pointer focus:ring-yellow-400"
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-300">
                  Remember me
                </span>
              </label>

              <Link href="/forgot-password" className="text-sm text-yellow-400 hover:text-yellow-300">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold cursor-pointer"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/60"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-transparent text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="flex justify-center">
              <div
                ref={googleBtnRef}
                className="overflow-hidden rounded-md w-full max-w-[400px]"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
