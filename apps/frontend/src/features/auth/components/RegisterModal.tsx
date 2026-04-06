'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

  // State untuk menampung pesan error dari proses input form
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    agreeToTerms: ''
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
            // Close the register modal; AuthProvider will show UsernameSetupModal
            // for new users or leave them authenticated for existing users.
            onClose();
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
        shape: 'pill',
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

  // form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: '', email: '', password: '', agreeToTerms: '' };

    // username validation
    if (!formData.username) {
      newErrors.username = 'Username cannot be empty';
      isValid = false;
    } else if (formData.username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email cannot be empty';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // password validation
    if (!formData.password) {
      newErrors.password = 'Password cannot be empty';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Terms of Use validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Use and Privacy Policy';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Run frontend validation before calling API
    if (!validateForm()) {
      return;
    }

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
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                if (formErrors.username) setFormErrors({ ...formErrors, username: '' });
              }}
              error={formErrors.username}
              disabled={isLoading}
              fullWidth
            />

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="50 characters or less"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
              }}
              error={formErrors.email}
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
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                }}
                error={formErrors.password}
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
                <div className="w-full border-t border-gray-700/60"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-transparent text-gray-500">or sign in with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="flex justify-center">
              <div
                ref={googleBtnRef}
                className="overflow-hidden rounded-md w-full max-w-[400px]"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => {
                      setFormData({ ...formData, agreeToTerms: e.target.checked });
                      if (formErrors.agreeToTerms) setFormErrors({ ...formErrors, agreeToTerms: '' });
                    }}
                    className={`mt-1 w-4 h-4 rounded bg-gray-800 text-yellow-400 cursor-pointer focus:ring-yellow-400 ${formErrors.agreeToTerms ? 'border-red-500' : 'border-gray-600'}`}
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
                {formErrors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-500 ml-7">{formErrors.agreeToTerms}</p>
                )}
              </div>

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
