'use client';

import { useState, useEffect } from 'react';
import { printService } from '@/lib/services/print.service';
import { Order } from '@/lib/types';
import { Loader2, Package, Check, X, Truck, Box } from 'lucide-react';
import Link from 'next/link';

export default function JobsTab() {
    const [jobs, setJobs] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await printService.getIncomingJobs();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleAction = async (orderId: string, action: 'ACCEPT' | 'REJECT' | 'SHIP' | 'COMPLETE') => {
        try {
            let tracking = undefined;
            if (action === 'SHIP') {
                tracking = prompt("Enter tracking number:");
                if (!tracking) return;
            }

            await printService.manageJob(orderId, action, tracking);
            fetchJobs(); // Refresh
        } catch (error) {
            alert('Action failed');
        }
    };

    if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-yellow-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Incoming Jobs</h3>
                <button onClick={fetchJobs} className="text-sm text-yellow-400 hover:text-yellow-300">Refresh</button>
            </div>

            {jobs.length === 0 ? (
                <div className="bg-[#141414] border border-gray-800 rounded-xl p-10 text-center">
                    <Box className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">No print jobs found yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-[#141414] border border-gray-800 rounded-xl p-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-semibold text-white">Order #{job.id.slice(0, 8)}</h4>
                                        <span className={`px-2 py-0.5 rounded textxs font-bold uppercase ${job.status === 'PENDING' ? 'bg-yellow-400/10 text-yellow-400' :
                                                job.status === 'PROCESSING' ? 'bg-blue-400/10 text-blue-400' :
                                                    job.status === 'SHIPPED' ? 'bg-purple-400/10 text-purple-400' :
                                                        job.status === 'DELIVERED' ? 'bg-green-400/10 text-green-400' :
                                                            'bg-red-400/10 text-red-400'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Requested by <span className="text-white">User #{job.user_id.slice(0, 6)}</span> • {new Date(job.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {job.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(job.id, 'ACCEPT')}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-colors"
                                            >
                                                <Check className="w-4 h-4" /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleAction(job.id, 'REJECT')}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" /> Reject
                                            </button>
                                        </>
                                    )}
                                    {job.status === 'PROCESSING' && (
                                        <button
                                            onClick={() => handleAction(job.id, 'SHIP')}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg transition-colors"
                                        >
                                            <Truck className="w-4 h-4" /> Ship Order
                                        </button>
                                    )}
                                    {job.status === 'SHIPPED' && (
                                        <button
                                            disabled
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 font-bold rounded-lg cursor-not-allowed"
                                        >
                                            In Transit
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 bg-[#0a0a0a] rounded-lg p-4">
                                {job.items.map((item, i) => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-gray-800 rounded shrink-0">
                                            {/* We might not have model details eager loaded depending on backend. 
                                                If backend implementation of getJobs doesn't include 'model', we can't show image.
                                                Assuming backend include: { model: true }
                                            */}
                                            {item.model?.thumbnails?.[0] && (
                                                <img src={item.model.thumbnails[0]} alt="" className="w-full h-full object-cover rounded" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{item.model?.title || 'Unknown Model'}</p>
                                            {item.print_config && (
                                                <p className="text-xs text-gray-500">
                                                    {item.print_config.material} • {item.print_config.color} • x{item.quantity}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {job.shipping_address && (
                                <div className="mt-4 text-sm text-gray-400 border-t border-gray-800 pt-3">
                                    <p className="font-semibold text-gray-300 mb-1">Shipping to:</p>
                                    <p>{job.shipping_address.label}</p>
                                    <p>{job.shipping_address.city}, {job.shipping_address.country}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
