'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
    Wrench,
    User,
    Sparkles,
    Shield,
    X,
    Bug,
    Terminal,
    Database,
    Printer
} from 'lucide-react';

const ReactQueryDevtoolsProduction = React.lazy(() =>
    import('@tanstack/react-query-devtools/build/modern/production.js').then((d) => ({
        default: d.ReactQueryDevtools,
    }))
);

export const ENABLE_DEVTOOLS = process.env.NODE_ENV !== 'production';

export default function DevTools() {
    const { user, setUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    
    // React Query DevTools toggle state
    const [showQueryDevtools, setShowQueryDevtools] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (localStorage.getItem('showQueryDevtools') === 'true') {
            setShowQueryDevtools(true);
        }
    }, []);

    const toggleQueryDevtools = () => {
        setShowQueryDevtools((prev) => {
            const next = !prev;
            if (next) localStorage.setItem('showQueryDevtools', 'true');
            else localStorage.removeItem('showQueryDevtools');
            return next;
        });
    };

    const roles = [
        { id: 'CUSTOMER', label: 'Customer', icon: User, color: 'text-blue-400' },
        { id: 'ARTIST', label: 'Artist', icon: Sparkles, color: 'text-yellow-400' },
        { id: 'PROVIDER', label: '3D Provider', icon: Printer, color: 'text-green-400' },
        { id: 'ADMIN', label: 'Admin', icon: Shield, color: 'text-red-400' }
    ];

    const switchRole = (role: string) => {
        if (!user) return;
        setUser({
            ...user,
            role: role as any
        });
        setIsOpen(false);
    };

    if (!ENABLE_DEVTOOLS) return null;
    if (!mounted) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-yellow-400 text-black'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6 text-white" /> : <Wrench className="w-6 h-6" />}
            </button>

            {/* Menu */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-72 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-10 duration-300 backdrop-blur-xl bg-opacity-90">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                            <Bug className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">3Dēx Dev Tools</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Debug & Mocking</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Role Switcher */}
                        <div>
                            <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3 px-1">
                                Switch Active Role
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {roles.map((r) => {
                                    const Icon = r.icon;
                                    const isActive = user?.role === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            onClick={() => switchRole(r.id)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${isActive
                                                ? 'bg-gray-800 border-gray-700 text-white'
                                                : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={`w-4 h-4 ${isActive ? r.color : ''}`} />
                                                <span className="text-xs font-medium">{r.label}</span>
                                            </div>
                                            {isActive && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* System Stats */}
                        <div className="pt-4 border-t border-gray-800 space-y-3">
                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-3 h-3" />
                                    <span>Environment</span>
                                </div>
                                <span className="text-yellow-400 font-mono">development</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Database className="w-3 h-3" />
                                    <span>Auth Status</span>
                                </div>
                                <span className={user ? 'text-green-400' : 'text-red-400'}>
                                    {user ? 'Logged In' : 'Logged Out'}
                                </span>
                            </div>

                            {/* React Query DevTools Toggle */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-800 mt-2">
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    <Database className="w-3 h-3 text-yellow-400" />
                                    <span>Query DevTools</span>
                                </div>
                                <button
                                    onClick={toggleQueryDevtools}
                                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${showQueryDevtools ? 'bg-yellow-400' : 'bg-gray-700'}`}
                                    aria-pressed={showQueryDevtools}
                                >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showQueryDevtools ? 'translate-x-4' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Conditionally mount DevTools to avoid double-rendering overlap */}
            {showQueryDevtools && (
                process.env.NODE_ENV === 'production' ? (
                    <React.Suspense fallback={null}>
                        <ReactQueryDevtoolsProduction initialIsOpen={false} />
                    </React.Suspense>
                ) : (
                    <ReactQueryDevtools initialIsOpen={false} />
                )
            )}
        </div>
    );
}
