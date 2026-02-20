'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { printService } from '@/lib/api/services';
import { formatPrice, formatDate } from '@/lib/utils';
import { LayoutDashboard, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui';

export default function ProviderDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [trackingInput, setTrackingInput] = useState<{ [key: string]: string }>({});

    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['provider-jobs'],
        queryFn: () => printService.getProviderJobs(),
        enabled: !!user && user.role === 'PROVIDER',
    });

    const manageMutation = useMutation({
        mutationFn: ({ id, action, tracking }: { id: string, action: any, tracking?: string }) =>
            printService.manageOrder(id, action, tracking),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['provider-jobs'] });
        },
    });

    if (authLoading) return null;
    if (!user || user.role !== 'PROVIDER') {
        router.push('/');
        return null;
    }

    const handleAction = (id: string, action: 'ACCEPT' | 'REJECT' | 'SHIP' | 'COMPLETE') => {
        if (action === 'SHIP' && !trackingInput[id]) {
            alert('Tracking number is required to ship!');
            return;
        }
        manageMutation.mutate({ id, action, tracking: trackingInput[id] });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'SHIPPED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'DELIVERED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 lg:p-12">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <LayoutDashboard className="w-8 h-8 text-yellow-500" />
                            <h1 className="text-3xl font-bold font-outfit">Provider Dashboard</h1>
                        </div>
                        <p className="text-gray-400">Manage your incoming 3D printing jobs and orders</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Pending</p>
                                <p className="text-xl font-bold">{jobs?.filter(j => j.status === 'PENDING').length || 0}</p>
                            </div>
                        </div>
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Truck className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Active</p>
                                <p className="text-xl font-bold">{jobs?.filter(j => ['ACCEPTED', 'SHIPPED'].includes(j.status)).length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : jobs && jobs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300">
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                                                {job.user.avatar_url ? (
                                                    <img src={job.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">{job.user.username[0].toUpperCase()}</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Customer</p>
                                                <p className="font-bold text-white">{job.user.username}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-6">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Order Date</p>
                                                <p className="text-sm">{formatDate(job.created_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(job.status)}`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Payout</p>
                                                <p className="text-lg font-bold text-yellow-500">{formatPrice(job.total_amount).idr}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Items */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                                                <Package className="w-4 h-4 text-yellow-500" />
                                                Print Items ({job.items.length})
                                            </h3>
                                            {job.items.map((item) => (
                                                <div key={item.id} className="flex gap-4 p-3 bg-black/40 rounded-xl border border-gray-800">
                                                    <div className="w-16 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img src={item.model.preview_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-white truncate">{item.model.title}</p>
                                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                            <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">Material: {item.print_config?.material || 'PLA'}</span>
                                                            <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">Color: {item.print_config?.color || 'White'}</span>
                                                            <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">Scale: {item.print_config?.scale || '1:1'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions & Shipping */}
                                        <div className="space-y-6">
                                            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4">
                                                <h4 className="text-xs font-bold text-yellow-500 uppercase mb-3 flex items-center gap-2">
                                                    <Info className="w-3.5 h-3.5" />
                                                    Shipping Details
                                                </h4>
                                                <p className="text-sm text-gray-300 leading-relaxed">
                                                    {job.shipping_address ? (
                                                        <>
                                                            {job.shipping_address.street}, {job.shipping_address.city}<br />
                                                            {job.shipping_address.state}, {job.shipping_address.zipCode}<br />
                                                            {job.shipping_address.country}
                                                        </>
                                                    ) : (
                                                        'No address provided'
                                                    )}
                                                </p>
                                                {job.tracking_number && (
                                                    <div className="mt-3 pt-3 border-t border-yellow-500/10">
                                                        <p className="text-xs text-gray-500">Tracking Number:</p>
                                                        <p className="text-sm font-mono text-white mt-0.5">{job.tracking_number}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                {job.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-500 text-white"
                                                            onClick={() => handleAction(job.id, 'ACCEPT')}
                                                            disabled={manageMutation.isPending}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Accept Job
                                                        </Button>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                                                            onClick={() => handleAction(job.id, 'REJECT')}
                                                            disabled={manageMutation.isPending}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}

                                                {job.status === 'ACCEPTED' && (
                                                    <div className="w-full space-y-3">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                placeholder="Enter tracking number..."
                                                                value={trackingInput[job.id] || ''}
                                                                onChange={(e) => setTrackingInput({ ...trackingInput, [job.id]: e.target.value })}
                                                                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-yellow-500 transition-colors"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="primary"
                                                            className="w-full"
                                                            onClick={() => handleAction(job.id, 'SHIP')}
                                                            disabled={manageMutation.isPending}
                                                        >
                                                            <Truck className="w-4 h-4 mr-2" />
                                                            Mark as Shipped
                                                        </Button>
                                                    </div>
                                                )}

                                                {job.status === 'SHIPPED' && (
                                                    <Button
                                                        variant="primary"
                                                        className="w-full bg-yellow-500 text-black"
                                                        onClick={() => handleAction(job.id, 'COMPLETE')}
                                                        disabled={manageMutation.isPending}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Mark as Completed
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl">
                        <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No jobs available</h2>
                        <p className="text-gray-500 max-w-xs mx-auto mb-6">You don't have any print jobs at the moment. New requests will appear here once customers order your services.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
