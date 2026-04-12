'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Filter, ChevronLeft, ChevronRight, AlertTriangle, Trash2, UserX, UserCheck, UserMinus, X, RefreshCw, ClipboardList } from 'lucide-react';
import { adminService } from '@/lib/api/services/admin.service';
import { getStorageUrl } from '@/lib/utils/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AuditLog = {
    id: string;
    action: string;
    target_id: string;
    target_type: string;
    reason: string;
    metadata: any;
    created_at: string;
    admin: { id: string; username: string; display_name: string | null; avatar_url: string | null };
};

const ACTION_LABELS: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
    DELETE_MODEL:   { label: 'Delete Model',       color: 'text-red-400 bg-red-500/10 border-red-500/20',         icon: Trash2 },
    DELETE_POST:    { label: 'Delete Post',        color: 'text-red-400 bg-red-500/10 border-red-500/20',         icon: Trash2 },
    DELETE_COMMENT: { label: 'Delete Comment',     color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: Trash2 },
    BAN_USER:       { label: 'Ban User',           color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: UserX },
    REJECT_MODEL:   { label: 'Reject Model',       color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: AlertTriangle },
    REJECT_USER:    { label: 'Reject Application', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',       icon: UserX },
    APPROVE_USER:   { label: 'Approve User',       color: 'text-green-400 bg-green-500/10 border-green-500/20',   icon: UserCheck },
    USER_STEP_DOWN: { label: 'User Step-Down',     color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',         icon: UserMinus },
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);
const PAGE_SIZE = 25;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(iso));
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <tr className="border-t border-white/[0.04] animate-pulse">
            <td className="px-4 py-3"><div className="h-4 w-28 bg-white/5 rounded-lg" /></td>
            <td className="px-4 py-3"><div className="h-5 w-24 bg-white/5 rounded-full" /></td>
            <td className="px-4 py-3"><div className="h-4 w-32 bg-white/5 rounded-lg" /></td>
            <td className="px-4 py-3"><div className="h-4 w-full bg-white/5 rounded-lg" /></td>
            <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-6 h-6 bg-white/5 rounded-full" /><div className="h-4 w-20 bg-white/5 rounded-lg" /></div></td>
        </tr>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata popup
// ─────────────────────────────────────────────────────────────────────────────

function MetadataTag({ data }: { data: any }) {
    const [open, setOpen] = useState(false);
    if (!data || Object.keys(data).length === 0) return null;
    return (
        <div className="relative inline-block">
            <button
                onClick={() => setOpen((o) => !o)}
                className="text-[10px] font-mono text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 border border-white/[0.06] px-1.5 py-0.5 rounded transition-colors cursor-pointer"
            >
                meta
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1 z-30 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-3 text-xs font-mono text-gray-400 whitespace-pre-wrap break-all">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 font-semibold text-[11px]">Metadata</span>
                        <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                    </div>
                    {Object.entries(data).map(([k, v]) => (
                        <div key={k} className="flex gap-2 leading-relaxed">
                            <span className="text-yellow-500/70 shrink-0">{k}:</span>
                            <span>{String(v)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminAuditLogsPage() {
    const [logs, setLogs]       = useState<AuditLog[]>([]);
    const [meta, setMeta]       = useState({ total: 0, pages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    // Filters
    const [filterAction, setFilterAction] = useState('');
    const [filterFrom,   setFilterFrom]   = useState('');
    const [filterTo,     setFilterTo]     = useState('');
    const [page,         setPage]         = useState(1);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const result = await adminService.getAuditLogs({
                action:  filterAction || undefined,
                from:    filterFrom   || undefined,
                to:      filterTo     || undefined,
                page,
                limit:   PAGE_SIZE,
            });
            setLogs(result.data);
            setMeta(result.meta);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to load audit logs.');
        } finally {
            setLoading(false);
        }
    }, [filterAction, filterFrom, filterTo, page]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const clearFilters = () => {
        setFilterAction('');
        setFilterFrom('');
        setFilterTo('');
        setPage(1);
    };

    const hasActiveFilters = filterAction || filterFrom || filterTo;

    return (
        <div className="min-h-screen bg-[#080808] text-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Shield className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Admin Audit Log</h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                Permanent record of all dangerous administrative actions
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        title="Refresh"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] text-gray-400 hover:text-white text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats strip — two labelled groups */}
                <div className="space-y-3">
                    {/* Group 1: Moderation Actions */}
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 px-0.5">Moderation Actions</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(['DELETE_MODEL', 'REJECT_MODEL', 'REJECT_USER', 'BAN_USER'] as const).map((a) => {
                                const cfg = ACTION_LABELS[a];
                                const Icon = cfg.icon;
                                return (
                                    <button
                                        key={a}
                                        onClick={() => { setFilterAction(filterAction === a ? '' : a); setPage(1); }}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                                            filterAction === a
                                                ? cfg.color + ' border-opacity-50'
                                                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <Icon className={`w-3.5 h-3.5 shrink-0 ${filterAction === a ? '' : 'text-gray-600'}`} />
                                        <p className={`text-xs font-medium ${filterAction === a ? '' : 'text-gray-500'}`}>{cfg.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Group 2: User Status / Role Updates */}
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 px-0.5">User Status &amp; Role Updates</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(['APPROVE_USER', 'USER_STEP_DOWN'] as const).map((a) => {
                                const cfg = ACTION_LABELS[a];
                                const Icon = cfg.icon;
                                return (
                                    <button
                                        key={a}
                                        onClick={() => { setFilterAction(filterAction === a ? '' : a); setPage(1); }}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                                            filterAction === a
                                                ? cfg.color + ' border-opacity-50'
                                                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <Icon className={`w-3.5 h-3.5 shrink-0 ${filterAction === a ? '' : 'text-gray-600'}`} />
                                        <p className={`text-xs font-medium ${filterAction === a ? '' : 'text-gray-500'}`}>{cfg.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filters</span>
                    </div>

                    {/* Action filter */}
                    <select
                        value={filterAction}
                        onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                        className="bg-[#1a1a1a] border border-white/[0.07] text-sm text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/40 cursor-pointer"
                    >
                        <option value="">All Actions</option>
                        {ALL_ACTIONS.map((a) => (
                            <option key={a} value={a}>{ACTION_LABELS[a].label}</option>
                        ))}
                    </select>

                    {/* Date range */}
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={filterFrom}
                            onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
                            className="bg-[#1a1a1a] border border-white/[0.07] text-sm text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/40 cursor-pointer"
                        />
                        <span className="text-gray-600 text-xs">to</span>
                        <input
                            type="date"
                            value={filterTo}
                            onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
                            className="bg-[#1a1a1a] border border-white/[0.07] text-sm text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/40 cursor-pointer"
                        />
                    </div>

                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors cursor-pointer">
                            <X className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}

                    <span className="ml-auto text-xs text-gray-600">
                        {meta.total.toLocaleString()} total {meta.total === 1 ? 'entry' : 'entries'}
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2.5 p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0d0d0d]">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">When</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

                            {!loading && logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-gray-600">
                                        <div className="flex flex-col items-center gap-3">
                                            <ClipboardList className="w-10 h-10 text-gray-700" />
                                            <p>No audit log entries found</p>
                                            {hasActiveFilters && (
                                                <button onClick={clearFilters} className="text-xs text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
                                                    Clear filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && logs.map((log) => {
                                const cfg = ACTION_LABELS[log.action] || { label: log.action, color: 'text-gray-400 bg-white/5 border-white/10', icon: Shield };
                                const Icon = cfg.icon;
                                return (
                                    <tr key={log.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                                        {/* When */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="text-gray-300 text-xs">{timeAgo(log.created_at)}</p>
                                            <p className="text-gray-600 text-[10px] mt-0.5">{formatDate(log.created_at)}</p>
                                        </td>

                                        {/* Action badge */}
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
                                                <Icon className="w-3 h-3 shrink-0" />
                                                {cfg.label}
                                            </span>
                                        </td>

                                        {/* Target */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="text-gray-400 text-xs">
                                                        {log.metadata?.title || log.metadata?.username || log.target_id.slice(0, 12) + '…'}
                                                    </p>
                                                    {log.metadata?.artist_username && (
                                                        <p className="text-gray-600 text-[10px]">by @{log.metadata.artist_username}</p>
                                                    )}
                                                    {log.metadata?.deleted_by && (
                                                        <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                                                            log.metadata.deleted_by === 'ADMIN'
                                                                ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                                                : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                                                        }`}>{log.metadata.deleted_by === 'ADMIN' ? 'Admin action' : 'Owner deleted'}</span>
                                                    )}
                                                </div>
                                                <MetadataTag data={log.metadata} />
                                            </div>
                                        </td>

                                        {/* Reason */}
                                        <td className="px-4 py-3 max-w-xs">
                                            <p className="text-gray-300 text-xs line-clamp-2" title={log.reason}>{log.reason}</p>
                                        </td>

                                        {/* Actor — admin for most, user themselves for USER_STEP_DOWN */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {log.admin.avatar_url ? (
                                                    <img
                                                        src={getStorageUrl(log.admin.avatar_url)}
                                                        alt={log.admin.username}
                                                        className="w-6 h-6 rounded-full border border-white/10 object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                        log.action === 'USER_STEP_DOWN'
                                                            ? 'bg-sky-500/20 border border-sky-500/30 text-sky-300'
                                                            : 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                                                    }`}>
                                                        {log.admin.username.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                                <div>
                                                    <p className="text-gray-300 text-xs font-medium">
                                                        {log.admin.display_name || log.admin.username}
                                                    </p>
                                                    <p className="text-gray-600 text-[10px]">
                                                        {log.action === 'USER_STEP_DOWN' ? 'self' : '@'}{log.admin.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.pages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-xs">
                            Page {meta.page} of {meta.pages} &mdash; {meta.total.toLocaleString()} entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.06] text-gray-400 hover:text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" /> Prev
                            </button>

                            {/* Page number pills */}
                            {Array.from({ length: Math.min(meta.pages, 7) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                            p === page
                                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                                disabled={page === meta.pages}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.06] text-gray-400 hover:text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Next <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
