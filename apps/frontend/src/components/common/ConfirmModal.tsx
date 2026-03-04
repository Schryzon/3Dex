'use client';

import { ReactNode, useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'default';
    isLoading?: boolean;
}

const variantConfig = {
    danger: {
        icon: Trash2,
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-500',
        accentBar: 'bg-red-500',
        border: 'border-red-500/30',
        confirmBtn: 'bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white',
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-yellow-500/10',
        iconColor: 'text-yellow-400',
        accentBar: 'bg-yellow-400',
        border: 'border-yellow-500/30',
        confirmBtn: 'bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500 text-black',
    },
    default: {
        icon: HelpCircle,
        iconBg: 'bg-gray-700/50',
        iconColor: 'text-gray-300',
        accentBar: 'bg-gray-600',
        border: 'border-gray-700',
        confirmBtn: 'bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500 text-black',
    },
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    isLoading = false,
}: ConfirmModalProps) {
    const cfg = variantConfig[variant];
    const Icon = cfg.icon;

    // Close on Escape key — only attach listener when open
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => { if (!isLoading) onClose(); }} />

            {/* Modal */}
            <div
                className={`relative bg-[#141414] rounded-2xl shadow-2xl w-full max-w-md border ${cfg.border} overflow-hidden animate-in zoom-in-95 duration-200`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Accent bar top */}
                <div className={`h-1 w-full ${cfg.accentBar}`} />

                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${cfg.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${cfg.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>

                    {/* Message */}
                    <div className="text-gray-400 text-sm mb-6">{message}</div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${cfg.confirmBtn}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                </>
                            ) : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
