'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Box, Info, Tag, DollarSign, Check, ChevronRight, Layout, Loader2 } from 'lucide-react';
import FileUploader from '@/features/upload/components/FileUploader';
import MultiFileUploader from '@/features/upload/components/MultiFileUploader';
import { api } from '@/lib/api';
import axios from 'axios';
import { USD_TO_IDR } from '@/lib/utils/price';

type Step = 'files' | 'details' | 'pricing';

export default function UploadPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('files');
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currency, setCurrency] = useState<'idr' | 'usd'>('idr');

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'architecture',
        tags: '',
        price: '0',
        isFree: true,
        license: 'royalty-free',
        isNsfw: false
    });

    const isStep1Valid = modelFile !== null && galleryFiles.length > 0;
    const isStep2Valid = formData.title.length >= 5 && formData.description.length >= 10;

    const steps = [
        { id: 'files', label: 'Upload Files', icon: Box },
        { id: 'details', label: 'Asset Details', icon: Info },
        { id: 'pricing', label: 'Pricing & Publish', icon: DollarSign },
    ];

    const getPresignedUrl = async (file: File) => {
        const { data } = await api.post('/models/upload-url', {
            filename: file.name,
            content_type: file.type || (file.name.endsWith('.glb') ? 'model/gltf-binary' : 'image/jpeg')
        });
        return data; // { upload_url, key }
    };

    const uploadFileToMinIO = async (file: File, url: string, onProgress?: (p: number) => void) => {
        await axios.put(url, file, {
            headers: {
                'Content-Type': file.type || (file.name.endsWith('.glb') ? 'model/gltf-binary' : 'image/jpeg')
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            }
        });
    };

    const handlePublish = async () => {
        if (!modelFile) return;

        try {
            setIsLoading(true);

            // 1. Upload Model
            const modelUpload = await getPresignedUrl(modelFile);
            await uploadFileToMinIO(modelFile, modelUpload.upload_url, (p) => setUploadProgress(p));

            // 2. Upload Thumbnail & Gallery Images
            let previewKey = '';
            const galleryKeys: string[] = [];

            for (let i = 0; i < galleryFiles.length; i++) {
                const file = galleryFiles[i];
                const upload = await getPresignedUrl(file);
                await uploadFileToMinIO(file, upload.upload_url);

                if (i === 0) {
                    previewKey = upload.key;
                } else {
                    galleryKeys.push(upload.key);
                }
            }

            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user || !user.id) {
                alert("You must be logged in!");
                setIsLoading(false);
                return;
            }

            await api.post('/models', {
                title: formData.title,
                description: formData.description,
                price: formData.isFree ? 0 : (currency === 'idr' ? Number(formData.price) : Number(formData.price) * USD_TO_IDR),
                file_url: modelUpload.key, // Store KEY, not signed URL
                preview_url: previewKey,
                gallery_urls: galleryKeys,
                artist_id: user.id, // Explicitly sending artist_id as required by backend
                category: formData.category,
                tags: formData.tags.split(',').map(t => t.trim()),
                license: formData.license,
                is_nsfw: formData.isNsfw
            });

            // Success
            router.push('/profile');

        } catch (error: any) {
            console.error(error);
            alert(`Upload failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/20 sticky top-0 z-30 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Upload New Asset</h1>
                            <p className="text-xs text-gray-500">Artist Dashboard</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-8">
                {/* Stepper */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2 z-0"></div>
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isPast = steps.findIndex(s => s.id === currentStep) > index;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-yellow-400 text-black scale-110 shadow-[0_0_20px_rgba(250,204,21,0.3)]' :
                                    isPast ? 'bg-green-500 text-white' : 'bg-gray-900 text-gray-500 border border-gray-800'
                                    }`}>
                                    {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isActive ? 'text-yellow-400' : 'text-gray-500'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 shadow-2xl">

                    {currentStep === 'files' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Source Files</h2>
                                <p className="text-gray-400 text-sm">Upload your 3D model and its primary thumbnail.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-gray-300 block">3D Model (Required)</label>
                                    <FileUploader onFileSelect={setModelFile} accept=".glb,.gltf" maxSizeMB={100} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-gray-300 block">Preview Images (Required)</label>
                                    <MultiFileUploader
                                        onFilesSelect={setGalleryFiles}
                                        accept=".jpg,.jpeg,.png,.webp"
                                        label="Upload Previews"
                                        description="JPG, PNG or WEBP (Max 5MB each)"
                                        maxFiles={5}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={() => setCurrentStep('details')}
                                    disabled={!isStep1Valid}
                                    className="px-8 py-3 bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                                >
                                    Continue to Details <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'details' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Asset Information</h2>
                                <p className="text-gray-400 text-sm">Tell buyers about your amazing creation.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300">Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Cyberpunk Hovercar Concept"
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300">Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe the features, usage, and any requirements..."
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300">Category</label>
                                        <select
                                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors appearance-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="architecture">Architecture</option>
                                            <option value="characters">Characters</option>
                                            <option value="vehicles">Vehicles</option>
                                            <option value="weapons">Weapons</option>
                                            <option value="nature">Nature</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300">Tags (Comma separated)</label>
                                        <input
                                            type="text"
                                            placeholder="sci-fi, low-poly, vfx"
                                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="nsfw-checkbox"
                                        checked={formData.isNsfw}
                                        onChange={(e) => setFormData({ ...formData, isNsfw: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-700 bg-black text-red-500 focus:ring-red-500 focus:ring-offset-gray-900 cursor-pointer"
                                    />
                                    <label htmlFor="nsfw-checkbox" className="text-sm font-medium text-gray-300 flex items-center cursor-pointer">
                                        Mature Content (NSFW)
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded ml-2">Applies blur filter</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <button
                                    onClick={() => setCurrentStep('files')}
                                    className="px-6 py-3 border border-gray-800 text-gray-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setCurrentStep('pricing')}
                                    disabled={!isStep2Valid}
                                    className="px-8 py-3 bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                                >
                                    Set Pricing <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'pricing' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Final Step</h2>
                                <p className="text-gray-400 text-sm">Decide how much your work is worth.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setFormData({ ...formData, isFree: true })}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${formData.isFree ? 'border-yellow-400 bg-yellow-400/5' : 'border-gray-800 hover:border-gray-700'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-full ${formData.isFree ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-500'}`}>
                                            <Layout className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Free Item</p>
                                            <p className="text-xs text-gray-500 mt-1">Gives you more exposure</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, isFree: false })}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${!formData.isFree ? 'border-yellow-400 bg-yellow-400/5' : 'border-gray-800 hover:border-gray-700'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-full ${!formData.isFree ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-500'}`}>
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Premium Item</p>
                                            <p className="text-xs text-gray-500 mt-1">Earn from your creativity</p>
                                        </div>
                                    </button>
                                </div>

                                {!formData.isFree && (
                                    <div className="space-y-4 p-6 bg-gray-900/30 rounded-2xl border border-gray-800 animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-bold text-gray-300">Set Price</label>
                                            <div className="flex gap-1 bg-gray-900 rounded-lg p-0.5">
                                                <button
                                                    onClick={() => setCurrency('idr')}
                                                    className={`px-2 py-1 text-xs font-medium rounded transition-all duration-300 ${currency === 'idr'
                                                        ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                                        : 'text-gray-400 hover:text-white'
                                                        }`}
                                                >
                                                    IDR
                                                </button>
                                                <button
                                                    onClick={() => setCurrency('usd')}
                                                    className={`px-2 py-1 text-xs font-medium rounded transition-all duration-300 ${currency === 'usd'
                                                        ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                                        : 'text-gray-400 hover:text-white'
                                                        }`}
                                                >
                                                    USD
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{currency === 'idr' ? 'Rp' : '$'}</span>
                                            <input
                                                type="number"
                                                className="w-full bg-black border border-gray-800 rounded-xl pl-10 pr-4 py-4 outline-none focus:border-yellow-400 transition-colors text-2xl font-bold"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 px-1 mt-2">
                                            <span>Min: {currency === 'idr' ? 'Rp 15.000' : '$1.00'}</span>
                                            <span>Max: {currency === 'idr' ? 'Rp 75.000.000' : '$5,000.00'}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-blue-400/5 group border border-blue-400/10 p-4 rounded-xl flex gap-4">
                                    <div className="shrink-0 w-10 h-10 bg-blue-400/10 rounded-full flex items-center justify-center text-blue-400">
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        By publishing, you agree to our <span className="text-blue-400 underline cursor-pointer">Artist Terms of Service</span>. You retain full copyright while granting users a royalty-free license.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <button
                                    onClick={() => setCurrentStep('details')}
                                    className="px-6 py-3 border border-gray-800 text-gray-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handlePublish}
                                    disabled={isLoading}
                                    className="relative px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black rounded-xl shadow-[0_10px_40px_rgba(250,204,21,0.2)] flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                                >
                                    {isLoading && (
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-black/20 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    )}
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Publishing {uploadProgress > 0 ? `${uploadProgress}%` : ''}</span>
                                        </>
                                    ) : (
                                        'Publish Asset'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

