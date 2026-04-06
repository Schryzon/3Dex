'use client';

import { useState, useEffect } from 'react';
import { 
    Search, Upload, Box, Check, Loader2, X, Archive, 
    ShoppingCart, FileCode, CheckCircle2, AlertCircle
} from 'lucide-react';
import { productService } from '@/lib/api/services/product.service';
import { Model } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelLibrarySelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (model: Model | { id: string; title: string; thumbnails: string[]; file_url: string; is_custom: boolean }) => void;
}

type Tab = 'library' | 'upload';

export default function ModelLibrarySelector({ isOpen, onClose, onSelect }: ModelLibrarySelectorProps) {
    const [activeTab, setActiveTab] = useState<Tab>('library');
    const [library, setLibrary] = useState<Model[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Fetch Library
    useEffect(() => {
        if (isOpen && activeTab === 'library') {
            fetchLibrary();
        }
    }, [isOpen, activeTab]);

    const fetchLibrary = async () => {
        setLoading(true);
        try {
            const data = await productService.getUserLibrary();
            setLibrary(data);
        } catch (error) {
            console.error('Failed to fetch library', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLibrary = library.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.glb')) {
            setUploadError('Only .glb files are supported for direct printing.');
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            // Using a simplified mock/direct upload flow for order-specific files
            // In a real app, this would use a dedicated "order-assets" S3 bucket
            // For now, we'll prefix it as a custom item
            // We use the same signed upload logic as models but don't create a Catalog entry
            
            // Getting signed URL from backend
            const response = await fetch('/api/models/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, content_type: 'model/gltf-binary' })
            });

            if (!response.ok) throw new Error('Failed to get upload URL');
            const { upload_url, key } = await response.json();

            // Direct upload to S3
            const uploadRes = await fetch(upload_url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': 'model/gltf-binary' }
            });

            if (!uploadRes.ok) throw new Error('Upload to storage failed');

            // Pass the temporary s3 key/url back
            onSelect({
                id: `custom-${Date.now()}`,
                title: file.name,
                thumbnails: [], // No thumbnail for direct upload yet
                file_url: key,
                is_custom: true
            });
            onClose();
        } catch (err: any) {
            setUploadError(err.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-[#111] border border-white/10 w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Select Model for Printing
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Choose from your collection or upload a new file.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-2 bg-[#0d0d0d]">
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'library' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        <Archive className="w-4 h-4" />
                        My Library
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'upload' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        <Upload className="w-4 h-4" />
                        Direct Upload
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {activeTab === 'library' && (
                        <div className="flex-1 flex flex-col p-6 overflow-hidden">
                            {/* Search */}
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text"
                                    placeholder="Search your library..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400/50 transition-all"
                                />
                            </div>

                            {/* Library Grid */}
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                                        <p className="text-gray-500 text-sm animate-pulse">Loading models...</p>
                                    </div>
                                ) : filteredLibrary.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {filteredLibrary.map(model => (
                                            <div 
                                                key={model.id}
                                                onClick={() => onSelect(model)}
                                                className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-yellow-400/50 transition-all"
                                            >
                                                <div className="aspect-square bg-gray-900 overflow-hidden relative">
                                                    <img 
                                                        src={model.thumbnails[0] || '/placeholder-model.jpg'} 
                                                        alt={model.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                                                        <span className="text-[10px] font-bold text-black bg-yellow-400 px-3 py-1 rounded-full shadow-lg">SELECT</span>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <p className="text-xs font-bold text-white truncate">{model.title}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {model.isPurchased ? (
                                                            <ShoppingCart className="w-3 h-3 text-blue-400" />
                                                        ) : (
                                                            <Box className="w-3 h-3 text-purple-400" />
                                                        )}
                                                        <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500">
                                                            {model.isPurchased ? 'Purchased' : 'Uploaded'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="p-4 bg-white/5 rounded-full mb-4">
                                            <Box className="w-10 h-10 text-gray-700" />
                                        </div>
                                        <h3 className="text-white font-bold mb-1">No models found</h3>
                                        <p className="text-sm text-gray-500 max-w-xs">
                                            Your library is empty or matches no results. Try uploading a model first.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="flex-1 flex flex-col p-10 items-center justify-center">
                            <div className="w-full max-w-md">
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/10 rounded-3xl hover:border-yellow-400/50 hover:bg-yellow-400/5 transition-all cursor-pointer group relative overflow-hidden">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-6 text-center">
                                        <div className={`p-4 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform ${uploading ? 'animate-pulse' : ''}`}>
                                            {uploading ? <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" /> : <Plus className="w-10 h-10 text-yellow-400" />}
                                        </div>
                                        <p className="mb-2 text-sm text-white font-bold">
                                            {uploading ? 'Uploading your model...' : 'Click to upload your .glb file'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Maximum size: 50MB. Only GLB format supported for direct prints.
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".glb" 
                                        onChange={handleFileUpload} 
                                        disabled={uploading}
                                    />
                                </label>

                                {uploadError && (
                                    <div className="mt-4 p-4 bg-red-400/10 border border-red-400/20 rounded-2xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span className="text-xs font-medium">{uploadError}</span>
                                    </div>
                                )}

                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-xs">Instant preview for providers</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-xs">Secure order-specific storage</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-xs">Private content review</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-[#0a0a0a]/50 text-center border-t border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                        Verified 3Dex Model Selection System
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

function Plus(props: any) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
    );
}
