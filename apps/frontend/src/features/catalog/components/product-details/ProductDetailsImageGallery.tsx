'use client';

import { ChevronLeft, ChevronRight, Box, Image as ImageIcon } from 'lucide-react';
import { ModelViewer3D } from '@/features/catalog/components/viewer';

interface ProductDetailsImageGalleryProps {
    images: string[];
    modelFileUrl?: string;
    title: string;
    // Index of the currently displayed main image
    currentImageIndex: number;
    // Whether the 3D viewer is active instead of the image
    isViewMode3D: boolean;
    onPrev: () => void;
    onNext: () => void;
    // Called when a thumbnail is clicked; receives the target index
    onThumbnailClick: (index: number) => void;
    // Switch between image view (false) and 3D view (true)
    onSetViewMode3D: (value: boolean) => void;
}

export default function ProductDetailsImageGallery({
    images,
    modelFileUrl,
    title,
    currentImageIndex,
    isViewMode3D,
    onPrev,
    onNext,
    onThumbnailClick,
    onSetViewMode3D,
}: ProductDetailsImageGalleryProps) {
    return (
        <div className="space-y-4">
            {/* Main preview area: shows either the 3D viewer or the current image */}
            <div className="relative aspect-[4/3] bg-[#141414] rounded-xl overflow-hidden">
                {isViewMode3D ? (
                    <ModelViewer3D modelUrl={modelFileUrl} />
                ) : (
                    <>
                        <img
                            src={images[currentImageIndex]}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                        {/* Prev / Next arrows — only rendered when there are multiple images */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={onPrev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* View mode toggle: image icon vs. 3D box icon */}
                <div className="absolute top-3 right-3 flex bg-black/50 backdrop-blur-sm rounded-lg p-1">
                    <button
                        onClick={() => onSetViewMode3D(false)}
                        className={`p-2 rounded-md transition-colors cursor-pointer ${!isViewMode3D ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                            }`}
                        title="Image View"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onSetViewMode3D(true)}
                        className={`p-2 rounded-md transition-colors cursor-pointer ${isViewMode3D ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                            }`}
                        title="3D View"
                    >
                        <Box className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Thumbnail strip — clicking a thumbnail switches the main image and resets 3D view */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            onThumbnailClick(index);
                            onSetViewMode3D(false);
                        }}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors cursor-pointer ${currentImageIndex === index && !isViewMode3D
                            ? 'border-yellow-400'
                            : 'border-transparent hover:border-gray-600'
                            }`}
                    >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
