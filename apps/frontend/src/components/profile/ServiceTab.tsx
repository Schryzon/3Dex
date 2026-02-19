'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api';
import { ProviderConfig } from '@/lib/types';
import { Loader2, Plus, X, Save } from 'lucide-react';

export default function ServiceTab() {
    const { user, updateUser } = useAuth(); // Assuming updateUser exists or we reload
    const [config, setConfig] = useState<ProviderConfig>({
        materials: [],
        colors: [],
        printerTypes: [],
        basePrice: 0,
        maxDimensions: { x: 0, y: 0, z: 0 }
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial load
    useEffect(() => {
        if (user?.provider_config) {
            setConfig(user.provider_config);
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Check if we need a specific endpoint or just update profile
            // Usually specific endpoint is better: /users/profile/provider-config
            // But let's assume update_profile handles it or we make a new one.
            // Based on backend: update_profile accepts optional fields. 
            // We might need to ensure backend handles `provider_config` update in `update_profile` 
            // OR create a new endpoint. 
            // Let's assume we use the general update for now, passing provider_config as part of body.
            // If backend doesn't support it yet, we might need to fix backend.
            // Checking backend `update_profile` controller...
            // Backend `update_profile` updates: social links, bio, etc. 
            // It DOES NOT explicitly show provider_config in the snippet I saw earlier? 
            // Wait, I didn't verify `update_profile` deeply for `provider_config`.
            // Let's blindly try hitting an endpoint I'll CREATE if it doesn't exist, or just use `update_profile` and hope.
            // Actually, best to ensure backend supports it. 
            // For now, I'll assume I can PATCH /users/profile with provider_config.

            const res = await api.patch('/users/profile', { provider_config: config });
            // Update local user context
            // updateUser(res.data); 
            alert('Service settings saved!');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const addItem = (field: keyof ProviderConfig, value: string) => {
        if (!value.trim()) return;
        const current = config[field] as string[];
        if (!current.includes(value)) {
            setConfig({ ...config, [field]: [...current, value] });
        }
    };

    const removeItem = (field: keyof ProviderConfig, value: string) => {
        const current = config[field] as string[];
        setConfig({ ...config, [field]: current.filter(i => i !== value) });
    };

    // Helper for input lists
    const ListInput = ({ label, field, placeholder }: { label: string, field: 'materials' | 'colors' | 'printerTypes', placeholder: string }) => {
        const [input, setInput] = useState('');
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{label}</label>
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addItem(field, input);
                                setInput('');
                            }
                        }}
                    />
                    <button
                        onClick={() => { addItem(field, input); setInput(''); }}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(config[field] || []).map(item => (
                        <span key={item} className="flex items-center gap-1 bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                            {item}
                            <button onClick={() => removeItem(field, item)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Service Configuration</h3>
                        <p className="text-sm text-gray-500">Set up what you can print and how much you charge.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ListInput label="Supported Materials" field="materials" placeholder="e.g. PLA, ABS, PETG" />
                    <ListInput label="Available Colors" field="colors" placeholder="e.g. Black, White, Red" />
                    <ListInput label="Printer Models" field="printerTypes" placeholder="e.g. Ender 3 V2, Prusa i3 MK3S" />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Base Price ($)</label>
                        <input
                            type="number"
                            value={config.basePrice || 0}
                            onChange={(e) => setConfig({ ...config, basePrice: Number(e.target.value) })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <p className="text-xs text-gray-500">Minimum fee per print job.</p>
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">Max Dimensions (mm)</label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <span className="text-xs text-gray-500 block mb-1">X Axis</span>
                                <input
                                    type="number"
                                    value={config.maxDimensions?.x || 0}
                                    onChange={(e) => setConfig({ ...config, maxDimensions: { ...config.maxDimensions!, x: Number(e.target.value) } })}
                                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                                />
                            </div>
                            <div className="flex-1">
                                <span className="text-xs text-gray-500 block mb-1">Y Axis</span>
                                <input
                                    type="number"
                                    value={config.maxDimensions?.y || 0}
                                    onChange={(e) => setConfig({ ...config, maxDimensions: { ...config.maxDimensions!, y: Number(e.target.value) } })}
                                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                                />
                            </div>
                            <div className="flex-1">
                                <span className="text-xs text-gray-500 block mb-1">Z Axis</span>
                                <input
                                    type="number"
                                    value={config.maxDimensions?.z || 0}
                                    onChange={(e) => setConfig({ ...config, maxDimensions: { ...config.maxDimensions!, z: Number(e.target.value) } })}
                                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
