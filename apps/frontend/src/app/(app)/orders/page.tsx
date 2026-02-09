'use client';

import { Package, Search, ShoppingBag, Clock, CheckCircle, Truck } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    // Mock data - replace with actual orders data from API
    const orders: any[] = [];
    const hasOrders = orders.length > 0;

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        My <span className="text-yellow-400">Orders</span>
                    </h1>
                    <p className="text-gray-400">
                        Track and manage your purchase history
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <ShoppingBag className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">{orders.length}</span>
                        </div>
                        <p className="text-gray-500 text-sm">Total Orders</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-500 text-sm">Pending</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Truck className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-500 text-sm">Processing</p>
                    </div>
                    <div className="bg-[#141414] rounded-xl p-5 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-bold text-white">0</span>
                        </div>
                        <p className="text-gray-500 text-sm">Completed</p>
                    </div>
                </div>

                {/* Search & Filter */}
                {hasOrders && (
                    <div className="mb-8 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search orders by ID or product name..."
                                className="w-full bg-[#141414] text-white px-4 py-3 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500/50 border border-gray-800 placeholder-gray-500"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                        <select className="bg-[#141414] text-white px-4 py-3 rounded-lg border border-gray-800 outline-none focus:ring-2 focus:ring-yellow-500/50 cursor-pointer">
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                )}

                {/* Orders List or Empty State */}
                {hasOrders ? (
                    <div className="space-y-4">
                        {/* Order items would be mapped here */}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-[#141414] rounded-2xl p-12 md:p-16 border border-gray-800 text-center">
                        <div className="w-24 h-24 bg-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-12 h-12 text-gray-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No orders yet</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Your order history will appear here once you make a purchase from the catalog.
                        </p>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
