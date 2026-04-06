"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { printService } from '@/lib/api/services/print.service';
import { api } from '@/lib/api';
import { User, Model, PrintConfig } from '@/types';
import UserAvatar from '@/components/common/UserAvatar';
import { 
    Loader2, Plus, Trash2, ArrowRight, Package, 
    Palette, Layers, Maximize, AlertCircle, Upload
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import ModelLibrarySelector from '@/features/print/components/ModelLibrarySelector';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlaceOrderPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    // Provider Info
    const username = params?.username as string;
    const [provider, setProvider] = useState<User | null>(null);
    const [providerLoading, setProviderLoading] = useState(true);

    // Order State
    const [selectedModels, setSelectedModels] = useState<{
        model_id: string;
        model: Partial<Model>;
        print_config: PrintConfig;
        quantity: number;
        is_custom?: boolean;
    }[]>([]);

    // Model Selection Modal
    const [isModelSelectorOpen, setModelSelectorOpen] = useState(false);

    // Shipping
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Provider
    useEffect(() => {
        if (!username) return;
        setProviderLoading(true);
        api.get<User>(`/users/${username}`).then((res) => {
            if (res.data.role !== 'PROVIDER') {
                router.push('/print-services');
            }
            setProvider(res.data);
        }).catch(() => {
            router.push('/print-services');
        }).finally(() => {
            setProviderLoading(false);
        });
    }, [username]);

    const addModelToOrder = (model: any) => {
        if (!provider) return;
        const config = provider.provider_config;

        const is_custom = !!model.is_custom;

        setSelectedModels(prev => [...prev, {
            model_id: is_custom ? '' : model.id,
            model: model,
            quantity: 1,
            is_custom,
            print_config: {
                material: config?.materials?.[0] || 'PLA',
                color: config?.colors?.[0] || 'White',
                scale: 1.0,
                // Add custom file url for reference if custom
                ...(is_custom && { custom_file_url: model.file_url })
            }
        }]);
    };

    const updateModelConfig = (index: number, field: string, value: any) => {
        setSelectedModels(prev => {
            const next = [...prev];
            if (field === 'quantity') {
                next[index] = { ...next[index], quantity: Number(value) };
            } else {
                next[index] = {
                    ...next[index],
                    print_config: { ...next[index].print_config, [field]: value }
                };
            }
            return next;
        });
    };

    const removeModel = (index: number) => {
        setSelectedModels(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!provider || selectedModels.length === 0 || !user?.addresses?.[selectedAddressIndex]) return;

        setSubmitting(true);
        try {
            const finalItems = selectedModels.map(item => ({
                model_id: item.model_id || undefined, // undefined for custom uploads
                quantity: item.quantity,
                print_config: item.print_config
            }));

            await printService.createOrder({
                provider_id: provider.id,
                items: finalItems,
                shipping_address: user.addresses[selectedAddressIndex]
            });

            router.push('/orders');
        } catch (error) {
            alert('Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    if (providerLoading) return (
        <div className="flex items-center justify-center min-h-[60vh] text-white gap-3">
            <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
            <span className="text-sm font-bold tracking-widest uppercase opacity-50">Initializing Order Engine...</span>
        </div>
    );
    
    if (!provider) return <div className="p-10 text-center text-white font-bold opacity-50">PROVIDER NOT FOUND</div>;

    return (
        <div className="min-h-screen bg-[#070707] py-12 px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
                            Configure Print Order
                        </h1>
                        <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Finalize your specifications for the provider review.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Provider Context Card */}
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-yellow-400/10 transition-colors" />
                            <UserAvatar user={provider} size="xl" className="border-2 border-white/10" />
                            <div className="text-center sm:text-left flex-1">
                                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-3 py-1 rounded-full mb-3 inline-block">Service Provider</span>
                                <h3 className="text-2xl font-bold text-white mb-1">{provider.display_name}</h3>
                                <p className="text-gray-500 text-sm">{provider.location || 'Remote Service'}</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                {provider.provider_config?.materials?.slice(0, 3).map(m => (
                                    <span key={m} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">{m}</span>
                                ))}
                            </div>
                        </div>

                        {/* Models Section */}
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 md:p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Project Meshes</h3>
                                <button
                                    onClick={() => setModelSelectorOpen(true)}
                                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-yellow-400/20 active:scale-95 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Model
                                </button>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {selectedModels.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-center py-16 text-gray-600 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]"
                                    >
                                        <Box className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-sm font-medium uppercase tracking-widest">No models selected for the project.</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedModels.map((item, idx) => (
                                            <motion.div 
                                                key={idx}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: 20, opacity: 0 }}
                                                className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 sm:p-5 group hover:border-white/10 transition-all"
                                            >
                                                <div className="flex flex-col sm:flex-row gap-6">
                                                    {/* Preview Container */}
                                                    <div className="w-full sm:w-24 h-24 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/5 relative">
                                                        <img 
                                                            src={item.model.thumbnails?.[0] || '/placeholder-model.jpg'} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        {item.is_custom && (
                                                            <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1 shadow-lg">
                                                                <Upload className="w-2.5 h-2.5 text-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Config Stack */}
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-white text-lg uppercase tracking-tight">{item.model.title}</h4>
                                                                <span className="text-[10px] text-gray-500 font-mono uppercase">
                                                                    {item.is_custom ? 'Custom Upload (GLB)' : `ID: ${item.model_id}`}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => removeModel(idx)}
                                                                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                            {/* Material Select */}
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Material</label>
                                                                <div className="relative">
                                                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                                                    <select
                                                                        className="w-full bg-[#151515] border border-white/10 rounded-xl pl-9 pr-2 py-2 text-[11px] font-bold text-white focus:border-yellow-400/50 outline-none transition-all appearance-none cursor-pointer"
                                                                        value={item.print_config.material}
                                                                        onChange={(e) => updateModelConfig(idx, 'material', e.target.value)}
                                                                    >
                                                                        {provider.provider_config?.materials?.map(m => (
                                                                            <option key={m} value={m}>{m}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            {/* Color Select */}
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Color</label>
                                                                <div className="relative">
                                                                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                                                    <select
                                                                        className="w-full bg-[#151515] border border-white/10 rounded-xl pl-9 pr-2 py-2 text-[11px] font-bold text-white focus:border-yellow-400/50 outline-none transition-all appearance-none cursor-pointer"
                                                                        value={item.print_config.color}
                                                                        onChange={(e) => updateModelConfig(idx, 'color', e.target.value)}
                                                                    >
                                                                        {provider.provider_config?.colors?.map(c => (
                                                                            <option key={c} value={c}>{c}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            {/* Scale Input */}
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Scale</label>
                                                                <div className="relative">
                                                                    <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                                                    <input
                                                                        type="number" step="0.1" min="0.1" max="5.0"
                                                                        className="w-full bg-[#151515] border border-white/10 rounded-xl pl-9 pr-2 py-2 text-[11px] font-bold text-white focus:border-yellow-400/50 outline-none transition-all"
                                                                        value={item.print_config.scale}
                                                                        onChange={(e) => updateModelConfig(idx, 'scale', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Quantity Input */}
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Quantity</label>
                                                                <input
                                                                    type="number" min="1" max="100"
                                                                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2 text-[11px] font-bold text-white focus:border-yellow-400/50 outline-none transition-all text-center"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateModelConfig(idx, 'quantity', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Split: Shipping & Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 sticky top-24">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Order Logistics</h3>

                            <div className="space-y-4 mb-8">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 block">Shipping Destination</label>
                                {user?.addresses && user.addresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.addresses.map((addr: any, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedAddressIndex(idx)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressIndex === idx ? 'border-yellow-400 bg-yellow-400/5 shadow-lg shadow-yellow-400/5' : 'border-white/5 bg-white/[0.01] hover:border-white/10'}`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className={`text-xs font-black uppercase tracking-wide ${selectedAddressIndex === idx ? 'text-yellow-400' : 'text-white'}`}>{addr.label}</p>
                                                    {selectedAddressIndex === idx && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate leading-relaxed line-clamp-1">{addr.street}, {addr.city}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Link href="/profile" className="flex flex-col items-center justify-center py-6 px-4 bg-red-400/5 border border-red-400/20 rounded-2xl text-center group cursor-pointer">
                                        <AlertCircle className="w-5 h-5 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">No address found</p>
                                        <p className="text-[9px] text-red-400/50 uppercase mt-1">Configure in profile settings</p>
                                    </Link>
                                )}
                            </div>

                            {/* Summary Detail */}
                            <div className="bg-[#0a0a0a] rounded-2xl p-5 border border-white/5 space-y-4 mb-6">
                                <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Total Mesh Volume</span>
                                    <span className="text-white">{selectedModels.reduce((acc, curr) => acc + curr.quantity, 0)} Units</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Estimated Cost</span>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-white uppercase italic">Quote Pending</span>
                                        <p className="text-[9px] text-gray-600 font-bold uppercase mt-1 tracking-tighter">Subject to provider review</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || selectedModels.length === 0 || !user?.addresses?.length}
                                className="w-full group py-4 bg-white hover:bg-yellow-100 disabled:opacity-20 disabled:cursor-not-allowed text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden relative"
                            >
                                {submitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <span className="relative z-10">Send Request</span>
                                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                        <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Model Selector Modal */}
            <AnimatePresence>
                {isModelSelectorOpen && (
                    <ModelLibrarySelector 
                        isOpen={isModelSelectorOpen}
                        onClose={() => setModelSelectorOpen(false)}
                        onSelect={addModelToOrder}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function Box(props: any) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
    );
}

import Link from 'next/link';
