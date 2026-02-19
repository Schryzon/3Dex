'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register, googleLogin } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    agreeToTerms: false,
    receiveNewsletter: false
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
            onClose();
            router.push('/dashboard');
          } catch (err: any) {
            setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
      });

      googleBtnRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'signup_with',
        shape: 'rectangular',
        width: 400,
      });

      googleInitialized.current = true;
    };

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
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      onClose();
      setFormData({
        username: '',
        email: '',
        password: '',
        agreeToTerms: false,
        receiveNewsletter: false
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
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
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="cursor-pointer w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <h2 className="text-2xl font-bold text-white mb-1">Register</h2>
          <p className="text-gray-400 mb-4">
            Already a user?{' '}
            <button onClick={onSwitchToLogin} className="text-yellow-400 cursor-pointer hover:text-yellow-300">
              Login
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

            {/* Username */}
            <Input
              label="Username"
              type="text"
              placeholder="50 characters or less"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              maxLength={50}
              disabled={isLoading}
              fullWidth
            />

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="50 characters or less"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              maxLength={50}
              disabled={isLoading}
              fullWidth
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum of 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                disabled={isLoading}
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5 cursor-pointer" /> : <Eye className="w-5 h-5 cursor-pointer" />}
              </button>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold cursor-pointer"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">or sign in with</span>
              </div>
            </div>

            {/* Google Sign In - rendered by Google's SDK */}
            <div className="flex justify-center">
              <div ref={googleBtnRef} />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-400 cursor-pointer focus:ring-yellow-400"
                  required
                />
                <span className="text-sm text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-white hover:text-yellow-400 cursor-pointer ">
                    Terms of Use
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-white hover:text-yellow-400 cursor-pointer">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.receiveNewsletter}
                  onChange={(e) => setFormData({ ...formData, receiveNewsletter: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-400 cursor-pointer focus:ring-yellow-400"
                />
                <span className="text-sm text-gray-400 ">
                  Receive tips, news, and community content in newsletter
                </span>
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
