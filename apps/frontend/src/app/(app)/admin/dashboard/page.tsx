'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileText, Users, ArrowRight, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user?.role !== 'ADMIN') {
            router.replace('/dashboard');
        }
    }, [user, isLoading, router]);

    const { data: pendingModels } = useQuery({
        queryKey: ['admin-pending-models'],
        queryFn: async () => {
            const res = await api.get('/admin/pending');
            return res.data;
        },
        enabled: user?.role === 'ADMIN',
    });

    const { data: pendingUsers } = useQuery({
        queryKey: ['admin-pending-users'],
        queryFn: async () => {
            const res = await api.get('/admin/users/status?status=PENDING');
            return res.data;
        },
        enabled: user?.role === 'ADMIN',
    });

    const { data: aggregatedReports } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: async () => {
            const res = await api.get('/admin/reports');
            return res.data.data;
        },
        enabled: user?.role === 'ADMIN',
    });

    if (isLoading || user?.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const stats = [
        {
            label: 'Pending Models',
            value: pendingModels?.length ?? '—',
            icon: FileText,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
            href: '/admin/models',
            description: 'Models waiting for review'
        },
        {
            label: 'Pending Users',
            value: pendingUsers?.length ?? '—',
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            href: '/admin/users',
            description: 'User applications to review'
        },
        {
            label: 'Content Reports',
            value: aggregatedReports?.length ?? '—',
            icon: AlertCircle,
            color: 'text-red-400',
            bg: 'bg-red-400/10',
            href: '/admin/reports',
            description: 'User-flagged content awaiting moderation'
        },
    ];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-500/10 to-transparent p-8 rounded-2xl border border-red-500/20">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <p className="text-gray-400">Manage content and users for the 3Dex platform.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-[#141414] border border-gray-800 p-6 rounded-2xl hover:border-gray-600 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-white font-semibold">{stat.label}</p>
                        <p className="text-gray-500 text-sm mt-1">{stat.description}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold text-white">Quick Actions</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href="/admin/models"
                        className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-gray-800 hover:border-yellow-400/30 hover:bg-yellow-400/5 transition-all group"
                    >
                        <div className="p-2 bg-yellow-400/10 rounded-lg">
                            <FileText className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">Review Models</p>
                            <p className="text-gray-500 text-xs">Approve or reject uploaded 3D models</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 ml-auto transition-colors" />
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-gray-800 hover:border-blue-400/30 hover:bg-blue-400/5 transition-all group"
                    >
                        <div className="p-2 bg-blue-400/10 rounded-lg">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">Manage Users</p>
                            <p className="text-gray-500 text-xs">Approve or reject user applications</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 ml-auto transition-colors" />
                    </Link>
                    <Link
                        href="/admin/reports"
                        className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-gray-800 hover:border-red-400/30 hover:bg-red-400/5 transition-all group"
                    >
                        <div className="p-2 bg-red-400/10 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">Moderate Content</p>
                            <p className="text-gray-500 text-xs">Review user reports and remove violations</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 ml-auto transition-colors" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
