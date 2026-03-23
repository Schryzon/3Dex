'use client';

import { useState } from 'react';
import { AtSign, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authService } from '@/lib/api/services/auth.service';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

interface UsernameSetupModalProps {
    isOpen: boolean;
    onComplete: (user: User) => void;
}

function validateUsername(value: string): string | null {
    if (value.length < 3) return 'At least 3 characters required';
    if (value.length > 30) return 'Maximum 30 characters';
    if (!/^[a-z0-9_]+$/.test(value)) return 'Only lowercase letters, numbers, and underscores';
    return null;
}

export default function UsernameSetupModal({ isOpen, onComplete }: UsernameSetupModalProps) {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const validationError = username ? validateUsername(username) : null;
    const isValid = username.length > 0 && validationError === null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Force lowercase and strip invalid characters as user types
        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setIsLoading(true);
        setError('');
        try {
            const updatedUser = await authService.completeProfile(username);
            onComplete(updatedUser);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Non-dismissible backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-gray-900/50 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-md border border-gray-800 overflow-hidden">
                {/* Decorative top gradient */}
                <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500" />

                <div className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                        <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-4">
                            <AtSign className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Choose your username</h2>
                        <p className="text-gray-400 text-sm">
                            This is how others will find and recognize you on 3Dēx. You can always change it later.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Server error */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                                <XCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Username input */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-300">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium select-none">
                                    @
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={handleChange}
                                    placeholder="your_username"
                                    maxLength={30}
                                    disabled={isLoading}
                                    autoFocus
                                    className={`w-full bg-black/40 text-white placeholder-gray-600 rounded-lg pl-8 pr-10 py-3 border transition-colors outline-none
                    ${validationError && username ? 'border-red-500/60 focus:border-red-500' : isValid ? 'border-green-500/60 focus:border-green-500' : 'border-gray-700 focus:border-yellow-400'}`}
                                />
                                {/* Inline validation icon */}
                                {username && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {isValid
                                            ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            : <XCircle className="w-4 h-4 text-red-400" />
                                        }
                                    </div>
                                )}
                            </div>

                            {/* Validation message */}
                            <div className="h-4">
                                {username && validationError && (
                                    <p className="text-xs text-red-400">{validationError}</p>
                                )}
                                {username && !validationError && (
                                    <p className="text-xs text-green-400">Looks good!</p>
                                )}
                                {!username && (
                                    <p className="text-xs text-gray-600">3–30 characters. Letters, numbers, and underscores only.</p>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!isValid || isLoading}
                            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-lg py-3 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
