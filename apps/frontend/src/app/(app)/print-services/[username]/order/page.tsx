'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { printService } from '@/lib/api/services/print.service';
import { api } from '@/lib/api';
import { User, Model, PrintConfig } from '@/lib/types';
import UserAvatar from '@/components/common/UserAvatar';
import { Loader2, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

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
        model: Model;
        print_config: PrintConfig;
        quantity: number;
    }[]>([]);

    // Model Selection Modal
    const [isModelSelectorOpen, setModelSelectorOpen] = useState(false);
    const [myModels, setMyModels] = useState<Model[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);

    // Shipping
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Provider
    useEffect(() => {
        if (!username) return;
        setProviderLoading(true);
        // We can reuse the public endpoint or create a specific one if needed
        // Assuming public profile endpoint exists and returns role
        api.get<User>(`/users/${username}`).then((res) => {
            if (res.data.role !== 'PROVIDER') {
                alert('This user is not a provider');
                router.push('/print-services');
            }
            setProvider(res.data);
        }).catch(() => {
            alert('Provider not found');
            router.push('/print-services');
        }).finally(() => {
            setProviderLoading(false);
        });
    }, [username]);

    // Fetch User's Models (Purchased or Uploaded) 
    const fetchMyModels = async () => {
        setModelsLoading(true);
        try {
            // Fetching catalog models for demo purposes
            // In a real scenario, this should fetch current user's library
            const res = await api.get('/catalog');
            setMyModels(res.data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setModelsLoading(false);
        }
    };

    const addModelToOrder = (model: Model) => {
        if (!provider) return;
        const config = provider.provider_config;

        setSelectedModels(prev => [...prev, {
            model_id: model.id,
            model: model,
            quantity: 1,
            print_config: {
                material: config?.materials[0] || 'PLA',
                color: config?.colors[0] || 'White',
                scale: 1.0
            }
        }]);
        setModelSelectorOpen(false);
    };

    const updateModelConfig = (index: number, field: keyof PrintConfig | 'quantity', value: any) => {
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
        if (!provider || selectedModels.length === 0 || !user?.addresses[selectedAddressIndex]) return;

        setSubmitting(true);
        try {
            // Expand quantity to individual items as per current backend implementation assumption
            const finalItems = [];
            for (const item of selectedModels) {
                for (let i = 0; i < item.quantity; i++) {
                    finalItems.push({
                        model_id: item.model_id,
                        print_config: item.print_config
                    });
                }
            }

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

    if (providerLoading) return <div className="p-10 text-center text-white"><Loader2 className="animate-spin inline mr-2" /> Loading Provider...</div>;
    if (!provider) return <div className="p-10 text-center text-white">Provider not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Start Print Order</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Configuration */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Provider Info */}
                    <div className="bg-[#141414] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                        <UserAvatar user={provider} size="lg" />
                        <div>
                            <h3 className="text-lg font-semibold text-white">Provider: {provider.display_name}</h3>
                            <p className="text-gray-400 text-sm">{provider.location}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-[#141414] border border-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-white">Models to Print</h3>
                            <button
                                onClick={() => { setModelSelectorOpen(true); fetchMyModels(); }}
                                className="flex items-center gap-1.5 text-xs bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Model
                            </button>
                        </div>

                        {selectedModels.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800 rounded-lg">
                                No models added yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedModels.map((item, idx) => (
                                    <div key={idx} className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-3">
                                        <div className="flex gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden shrink-0">
                                                <img src={item.model.thumbnails[0]} alt="" className="w-full h-full object-cover" />
                                            </div>

                                            {/* Config */}
                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="font-medium text-white line-clamp-1">{item.model.title}</p>
                                                    <p className="text-xs text-gray-500 mb-2">Quantity:
                                                        <input
                                                            type="number" min="1" max="10"
                                                            className="ml-2 w-12 bg-gray-900 border border-gray-700 rounded px-1 py-0.5 text-white"
                                                            value={item.quantity}
                                                            onChange={(e) => updateModelConfig(idx, 'quantity', e.target.value)}
                                                        />
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <select
                                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                                                        value={item.print_config.material}
                                                        onChange={(e) => updateModelConfig(idx, 'material', e.target.value)}
                                                    >
                                                        {provider.provider_config?.materials.map(m => (
                                                            <option key={m} value={m}>{m}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                                                        value={item.print_config.color}
                                                        onChange={(e) => updateModelConfig(idx, 'color', e.target.value)}
                                                    >
                                                        {provider.provider_config?.colors.map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeModel(idx)}
                                                className="text-gray-500 hover:text-red-500 self-start"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Summary & Shipping */}
                <div className="space-y-6">
                    <div className="bg-[#141414] border border-gray-800 rounded-xl p-5 sticky top-20">
                        <h3 className="font-semibold text-white mb-4">Shipping Address</h3>

                        {user?.addresses && user.addresses.length > 0 ? (
                            <div className="space-y-2 mb-6">
                                {user.addresses.map((addr, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedAddressIndex(idx)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedAddressIndex === idx ? 'border-yellow-400 bg-yellow-400/5' : 'border-gray-800 hover:border-gray-600'}`}
                                    >
                                        <p className="font-medium text-white text-sm">{addr.label}</p>
                                        <p className="text-gray-400 text-xs truncate">{addr.city}, {addr.country}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-red-400 mb-6 bg-red-400/10 p-3 rounded-lg">
                                Please add an address in your profile settings first.
                            </div>
                        )}

                        <div className="border-t border-gray-800 pt-4 mb-4">
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                <span>Items</span>
                                <span>{selectedModels.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
                            </div>
                            <div className="flex justify-between text-white font-semibold">
                                <span>Estimated Total</span>
                                <span>Quote Pending</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                * The provider will review your order and send a final quote including shipping.
                            </p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || selectedModels.length === 0 || !user?.addresses?.length}
                            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors"
                        >
                            {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    <span>Submit Order</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Model Selector Modal */}
            {isModelSelectorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Select Model</h3>
                            <button onClick={() => setModelSelectorOpen(false)} className="text-gray-400 hover:text-white">Close</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {modelsLoading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-yellow-400" /></div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {myModels.map(model => (
                                        <div
                                            key={model.id}
                                            onClick={() => addModelToOrder(model)}
                                            className="bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:border-yellow-400 transition-colors"
                                        >
                                            <div className="aspect-square bg-gray-800">
                                                <img src={model.thumbnails[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-2">
                                                <p className="text-sm text-white font-medium truncate">{model.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
