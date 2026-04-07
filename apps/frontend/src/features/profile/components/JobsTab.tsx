'use client';

import { useState, useEffect } from 'react';
import { printService, PrintJob } from '@/lib/api/services/print.service';
import { Loader2, Package, Check, X, Truck, Box, Camera, Image as ImageIcon, Upload, Plus } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

export default function JobsTab() {
    const [jobs, setJobs] = useState<PrintJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingForJob, setUploadingForJob] = useState<string | null>(null);
    const [proofs, setProofs] = useState<Record<string, string[]>>({});

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

            const currentProofs = proofs[orderId] || [];
            await printService.manageJob(orderId, action, tracking, currentProofs);
            
            // Clear proofs for this job after submission
            setProofs(prev => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });
            
            fetchJobs(); // Refresh
        } catch (error) {
            alert('Action failed');
        }
    };

    const handleUploadProof = async (jobId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingForJob(jobId);
        try {
            // 1. Get Signed URL
            const { upload_url, key } = await apiClient.post<{ upload_url: string; key: string }>('/models/upload-url', {
                filename: `proof-${jobId}-${Date.now()}-${file.name}`,
                content_type: file.type
            });

            // 2. Upload to S3
            const res = await fetch(upload_url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!res.ok) throw new Error('Upload failed');

            // 3. Add to local state
            setProofs(prev => ({
                ...prev,
                [jobId]: [...(prev[jobId] || []), key]
            }));
        } catch (error) {
            console.error('Proof upload failed', error);
            alert('Failed to upload proof photo');
        } finally {
            setUploadingForJob(null);
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
                                        Requested by <span className="text-white">@{job.user?.username || job.user_id.slice(0, 6)}</span> • {new Date(job.created_at).toLocaleDateString()}
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
                                                If backend implementation of getJobs doesn't include 'model', we fallback to print_config metadata.
                                            */}
                                            {(item.model?.thumbnails?.[0] || item.print_config?.model_thumbnail) && (
                                                <img src={item.model?.thumbnails?.[0] || item.print_config?.model_thumbnail} alt="" className="w-full h-full object-cover rounded" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{item.model?.title || item.print_config?.model_title || 'Unknown Model'}</p>
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
                                    <p>{job.shipping_address.label || job.shipping_address.location}</p>
                                    {(job.shipping_address.city || job.shipping_address.country) && (
                                        <p>
                                            {job.shipping_address.city}{job.shipping_address.city && job.shipping_address.country ? ', ' : ''}{job.shipping_address.country}
                                        </p>
                                    )}
                                    {job.shipping_address.notes && (
                                        <p className="mt-1 italic text-xs text-gray-500">Note: {job.shipping_address.notes}</p>
                                    )}
                                </div>
                            )}

                            {/* Photo Proof Section */}
                            <div className="mt-6 border-t border-gray-800 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                                        <Camera className="w-3.5 h-3.5" /> Photo Proof
                                    </h5>
                                    
                                    {(job.status === 'PROCESSING' || job.status === 'SHIPPED') && (
                                        <label className="cursor-pointer group flex items-center gap-1.5 text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add Photo</span>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={(e) => handleUploadProof(job.id, e)}
                                                disabled={uploadingForJob === job.id}
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {/* Existing Proofs */}
                                    {job.proof_urls?.map((url, idx) => (
                                        <div key={`existing-${idx}`} className="w-16 h-16 rounded-lg bg-gray-900 border border-white/5 overflow-hidden group relative">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <ImageIcon className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    ))}

                                    {/* New (unsaved) Proofs */}
                                    {proofs[job.id]?.map((url, idx) => (
                                        <div key={`new-${idx}`} className="w-16 h-16 rounded-lg bg-yellow-400/10 border border-yellow-400/20 overflow-hidden relative group">
                                            <img src={url} alt="" className="w-full h-full object-cover opacity-60" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Upload className="w-4 h-4 text-yellow-400 animate-pulse" />
                                            </div>
                                            <div className="absolute top-0 right-0 p-1 bg-yellow-400 text-black text-[8px] font-bold">NEW</div>
                                        </div>
                                    ))}

                                    {uploadingForJob === job.id && (
                                        <div className="w-16 h-16 rounded-lg bg-gray-900 border border-dashed border-gray-700 flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                                        </div>
                                    )}

                                    {(!job.proof_urls || job.proof_urls.length === 0) && (!proofs[job.id] || proofs[job.id].length === 0) && !uploadingForJob && (
                                        <p className="text-[10px] text-gray-600 italic">No photos uploaded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
