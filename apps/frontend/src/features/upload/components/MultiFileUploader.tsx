'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface MultiFileUploaderProps {
    onFilesSelect: (files: File[]) => void;
    accept?: string;
    maxSizeMB?: number;
    maxFiles?: number;
    label?: string;
    description?: string;
}

export default function MultiFileUploader({
    onFilesSelect,
    accept = '.jpg,.jpeg,.png,.webp',
    maxSizeMB = 5,
    maxFiles = 5,
    label = 'Upload Previews',
    description = 'JPG, PNG or WEBP (Max 5MB each)'
}: MultiFileUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File) => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!accept.includes(extension)) return `Invalid file type: ${file.name}`;
        if (file.size > maxSizeMB * 1024 * 1024) return `File too large: ${file.name}`;
        return null;
    };

    const addFiles = (newFiles: File[]) => {
        setError(null);
        if (files.length + newFiles.length > maxFiles) {
            setError(`You can only upload up to ${maxFiles} files.`);
            return;
        }

        const validFiles: File[] = [];
        for (const file of newFiles) {
            const err = validateFile(file);
            if (err) {
                setError(err);
                return;
            }
            validFiles.push(file);
        }

        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        onFilesSelect(updatedFiles);
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onFilesSelect(updatedFiles);
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    }, [files, maxFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(Array.from(e.target.files));
        }
    };

    return (
        <div className="w-full space-y-4">
            <div
                className={`relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center ${dragActive
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
                    multiple
                    disabled={files.length >= maxFiles}
                />

                <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
                    <Upload className={`w-6 h-6 ${error ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <h3 className="text-white font-bold mb-1 text-sm">{label}</h3>
                <p className="text-gray-500 text-xs">{description}</p>
                <p className="text-yellow-400 text-[10px] mt-2 font-semibold">
                    The first image will be the primary cover.
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {files.map((f, i) => (
                        <div key={i} className="relative group bg-gray-900 border border-gray-800 rounded-xl p-2 flex flex-col items-center text-center hover:border-yellow-400 transition-colors">
                            {i === 0 && (
                                <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full z-20 shadow-lg">
                                    COVER
                                </div>
                            )}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeFile(i);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            <div className="w-full aspect-square bg-black rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-gray-800">
                                <ImageIcon className="w-8 h-8 text-gray-700" />
                            </div>
                            <span className="text-[10px] text-gray-400 truncate w-full px-1" title={f.name}>
                                {f.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
