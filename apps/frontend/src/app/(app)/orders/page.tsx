'use client';

import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/lib/api/services';
import { formatPrice, formatDate } from '@/lib/utils';
import { getStorageUrl } from '@/lib/utils/storage';
import { ShoppingBag, ChevronRight, Clock, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['orders'],
        queryFn: () => orderService.getOrders(),
        enabled: !!user,
    });

    if (authLoading) return null;
    if (!user) {
        router.push('/');
        return null;
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-yellow-500 transition-colors group mb-6"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-yellow-500" />
                        <h1 className="text-3xl font-bold">My Orders</h1>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <div key={order.id} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-800">
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Order ID</p>
                                            <p className="text-sm font-mono">{order.id.slice(0, 8)}...</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                                            <p className="text-sm">{formatDate(order.created_at)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(order.status)}
                                                <span className="text-sm font-medium">{order.status}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                                            <p className="text-lg font-bold text-yellow-500">{formatPrice(order.total_amount).idr}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.model.preview_url ? (
                                                            <img src={getStorageUrl(item.model.preview_url)} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">3D</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-white truncate max-w-[200px]">{item.model.title}</p>
                                                        <p className="text-xs text-gray-500">by {item.model.artist.username}</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium text-gray-300">
                                                    {formatPrice(item.price).idr}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {order.status === 'PAID' && (
                                        <div className="mt-6">
                                            <Link
                                                href="/downloads"
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-black bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Download Files
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl">
                        <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No orders found</h2>
                        <p className="text-gray-500 max-w-xs mx-auto mb-6">You haven't made any purchases yet. Start exploring our catalog to find amazing 3D models.</p>
                        <Link href="/catalog" className="text-yellow-500 font-semibold hover:text-yellow-400 transition-colors">
                            Explore Catalog
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
