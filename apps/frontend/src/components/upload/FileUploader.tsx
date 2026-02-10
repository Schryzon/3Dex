'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, File, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSizeMB?: number;
    label?: string;
    description?: string;
}

export default function FileUploader({
    onFileSelect,
    accept = '.glb,.gltf',
    maxSizeMB = 50,
    label = 'Upload 3D Model',
    description = 'GLB or GLTF files (Max 50MB)'
}: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File) => {
        setError(null);

        // Extension check
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!accept.includes(extension)) {
            setError(`Invalid file type. Accepted: ${accept}`);
            return false;
        }

        // Size check
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File too large. Max size: ${maxSizeMB}MB`);
            return false;
        }

        return true;
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
                onFileSelect(droppedFile);
            }
        }
    }, [onFileSelect]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                onFileSelect(selectedFile);
            }
        }
    };

    return (
        <div className="w-full">
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center ${dragActive
                        ? 'border-yellow-400 bg-yellow-400/5'
                        : error
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-gray-800 bg-gray-900/20 hover:border-gray-700'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept={accept}
                    onChange={handleFileChange}
                />

                {!file ? (
                    <>
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <Upload className={`w-8 h-8 ${error ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <h3 className="text-white font-bold mb-1">{label}</h3>
                        <p className="text-gray-500 text-sm">{description}</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-white font-bold mb-1 truncate max-w-[200px]">{file.name}</h3>
                        <p className="text-gray-500 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFile(null);
                            }}
                            className="mt-4 text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1 z-20 cursor-pointer"
                        >
                            <X className="w-3 h-3" /> Remove File
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
}
