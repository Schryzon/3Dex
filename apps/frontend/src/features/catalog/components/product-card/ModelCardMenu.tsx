'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Flag, Trash2, Pencil, X, AlertTriangle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { reportService } from '@/lib/api/services/report.service';
import { api } from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ModelCardMenuProps {
    modelId: string;
    modelTitle?: string;
    artistId: string;
    onDeleted?: () => void;
}

const REPORT_REASONS = [
    'Inappropriate content',
    'Copyright infringement',
    'Spam or misleading',
    'Hate speech or harassment',
    'Stolen / counterfeit asset',
    'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// Modal helpers
// ─────────────────────────────────────────────────────────────────────────────

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Modal
// ─────────────────────────────────────────────────────────────────────────────

function ReportModal({ modelId, modelTitle, onClose }: { modelId: string; modelTitle?: string; onClose: () => void }) {
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const submittedReason = reason === 'Other' ? customReason.trim() : reason;

    const handleSubmit = async () => {
        if (!submittedReason) { setError('Please select or enter a reason.'); return; }
        setLoading(true);
        setError('');
        try {
            await reportService.createReport({ target_type: 'MODEL', model_id: modelId, reason: submittedReason });
            setSuccess(true);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to send report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-red-500/10">
                            <Flag className="w-4 h-4 text-red-400" />
                        </div>
                        <h2 className="text-white font-semibold text-sm">Report Model</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {success ? (
                    <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-white font-semibold">Report submitted</p>
                        <p className="text-gray-500 text-sm">Thank you for helping keep the community safe. Our team will review it shortly.</p>
                        <button onClick={onClose} className="mt-4 px-5 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg border border-white/10 transition-colors cursor-pointer">
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="px-6 py-5 space-y-4">
                        {modelTitle && (
                            <p className="text-gray-400 text-sm">
                                Reporting: <span className="text-white font-medium">{modelTitle}</span>
                            </p>
                        )}

                        {/* Reason selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Reason</label>
                            <div className="grid grid-cols-1 gap-1.5">
                                {REPORT_REASONS.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setReason(r)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer border ${
                                            reason === r
                                                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                                : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {reason === 'Other' && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Describe the issue</label>
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Please describe the issue..."
                                    maxLength={500}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/40 resize-none"
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-red-400 text-xs flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
                            </p>
                        )}

                        <div className="flex gap-2 pt-1">
                            <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !submittedReason}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
                            >
                                {loading ? 'Submitting…' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ModalBackdrop>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteModal({
    modelId,
    modelTitle,
    isAdmin,
    onClose,
    onDeleted,
}: {
    modelId: string;
    modelTitle?: string;
    isAdmin: boolean;
    onClose: () => void;
    onDeleted?: () => void;
}) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (isAdmin && !reason.trim()) { setError('Please provide a reason for the deletion.'); return; }
        setLoading(true);
        setError('');
        try {
            await api.delete(`/models/${modelId}`, isAdmin ? { data: { reason: reason.trim() } } : undefined);
            onDeleted?.();
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to delete the model. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-orange-500/10">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                        </div>
                        <h2 className="text-white font-semibold text-sm">Delete Model</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/15">
                        <p className="text-orange-300 text-sm font-medium mb-1">This action is permanent</p>
                        <p className="text-gray-500 text-sm">
                            Deleting <span className="text-white">{modelTitle || 'this model'}</span> will remove it and all associated data (reviews, purchase records) permanently.
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Admin Reason <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="State the reason for this administrative deletion…"
                                maxLength={1000}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/40 resize-none"
                            />
                            <p className="text-xs text-gray-600">This will be permanently recorded in the audit log.</p>
                        </div>
                    )}

                    {error && (
                        <p className="text-red-400 text-xs flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
                        </p>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading || (isAdmin && !reason.trim())}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><Trash2 className="w-3.5 h-3.5" /> Delete Permanently</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </ModalBackdrop>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Menu Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ModelCardMenu({ modelId, modelTitle, artistId, onDeleted }: ModelCardMenuProps) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [modal, setModal] = useState<'report' | 'delete' | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const isAdmin   = user?.role === 'ADMIN';
    const isOwner   = isAuthenticated && user?.id === artistId;
    const canReport = isAuthenticated && !isAdmin;
    const canDelete = isOwner || isAdmin;
    const canEdit   = isOwner && !isAdmin;

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Nothing to show for unauthenticated users
    if (!isAuthenticated) return null;

    return (
        <>
            <div ref={menuRef} className="relative z-30">
                {/* Trigger Button */}
                <button
                    type="button"
                    id={`model-menu-${modelId}`}
                    aria-label="More options"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen((o) => !o);
                    }}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 cursor-pointer
                        ${open
                            ? 'bg-white/15 text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                >
                    <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Dropdown */}
                {open && (
                    <div
                        className="absolute top-full right-0 mt-1.5 w-44 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {canEdit && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpen(false);
                                    router.push(`/upload?edit=${modelId}`);
                                }}
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <Pencil className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                Edit Model
                            </button>
                        )}

                        {canDelete && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpen(false);
                                    setModal('delete');
                                }}
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-gray-300 hover:text-red-300 hover:bg-red-500/5 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                Delete{isAdmin ? ' (Admin)' : ''}
                            </button>
                        )}

                        {(canEdit || canDelete) && canReport && (
                            <div className="h-px bg-white/[0.06] mx-3" />
                        )}

                        {canReport && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpen(false);
                                    setModal('report');
                                }}
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-gray-400 hover:text-orange-300 hover:bg-orange-500/5 transition-colors cursor-pointer"
                            >
                                <Flag className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                Report
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {modal === 'report' && (
                <ReportModal
                    modelId={modelId}
                    modelTitle={modelTitle}
                    onClose={() => setModal(null)}
                />
            )}

            {modal === 'delete' && (
                <DeleteModal
                    modelId={modelId}
                    modelTitle={modelTitle}
                    isAdmin={isAdmin}
                    onDeleted={onDeleted}
                    onClose={() => setModal(null)}
                />
            )}
        </>
    );
}
