'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useUpdateProduct } from '@/features/catalog/hooks/useProducts';
import type { Model } from '@/types';

interface EditModelModalProps {
    model: Model;
    onClose: () => void;
}

export default function EditModelModal({ model, onClose }: EditModelModalProps) {
    const updateMutation = useUpdateProduct();

    const [form, setForm] = useState({
        title: model.title || '',
        description: model.description || '',
        price: model.price ?? 0,
        category: typeof model.category === 'string' ? model.category : '',
        is_nsfw: !!model.is_nsfw,
        is_printable: !!model.isPrintable,
        license: model.license || 'PERSONAL_USE',
        tags: model.tags?.join(', ') || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({
                id: model.id,
                data: {
                    title: form.title,
                    description: form.description,
                    price: Number(form.price),
                    category: form.category,
                    is_nsfw: form.is_nsfw,
                    is_printable: form.is_printable,
                    license: form.license,
                    tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                },
            });
            onClose();
        } catch (err) {
            console.error('Failed to update model:', err);
        }
    };

    const isSaving = updateMutation.isPending;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
                <div
                    className="pointer-events-auto w-full max-w-lg bg-[#111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">Edit Asset</h3>
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{model.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                                className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/10 transition-all text-sm"
                                placeholder="Model title"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/10 transition-all text-sm resize-none"
                                placeholder="Describe your 3D model..."
                            />
                        </div>

                        {/* Price & Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                                    Price (IDR) <span className="text-gray-600">(0 = Free)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">Rp</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                                        className="w-full bg-black/50 text-white pl-9 pr-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/10 transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                                <input
                                    type="text"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/10 transition-all text-sm"
                                    placeholder="e.g. Characters"
                                />
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-6 pt-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={form.is_printable}
                                        onChange={(e) => setForm({ ...form, is_printable: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${form.is_printable ? 'bg-yellow-400' : 'bg-gray-700'}`} />
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${form.is_printable ? 'translate-x-5' : ''}`} />
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">3D Printable</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={form.is_nsfw}
                                        onChange={(e) => setForm({ ...form, is_nsfw: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${form.is_nsfw ? 'bg-red-500' : 'bg-gray-700'}`} />
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${form.is_nsfw ? 'translate-x-5' : ''}`} />
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">NSFW Content</span>
                            </label>
                        </div>

                        {/* License */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">License Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['PERSONAL_USE', 'COMMERCIAL_USE'].map((l) => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => setForm({ ...form, license: l as any })}
                                        className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${form.license === l
                                            ? 'bg-yellow-400 border-yellow-400 text-black'
                                            : 'bg-black/50 border-gray-800 text-gray-400 hover:border-gray-700'
                                            }`}
                                    >
                                        {l.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/10 transition-all text-sm"
                                placeholder="e.g. dragon, fantasy, dragonball"
                            />
                        </div>

                        {/* Error */}
                        {updateMutation.isError && (
                            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl font-medium">
                                Failed to save changes. Please try again.
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2 sticky bottom-0 bg-[#111] pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="flex-1 py-3 rounded-xl border border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-bold disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-yellow-400/10"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Save Changes</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
