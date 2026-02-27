'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    X,
    Heart,
    Share2,
    ShoppingCart,
    Star,
    Download,
    ChevronLeft,
    ChevronRight,
    Box,
    Image as ImageIcon,
    Check,
    ExternalLink,
    ShoppingBag
} from 'lucide-react';
import ModelViewer3D from './ModelViewer3D';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/components/auth/AuthProvider';
import { reviewApi, Review } from '@/lib/api/reviews';
import { purchaseService } from '@/lib/api/services/purchase.service';
import ProductReviewList from './ProductReviewList';
import ProductReviewForm from './ProductReviewForm';

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        title: string;
        author: string;
        images: string[];
        modelFileUrl?: string;
        price: number;
        originalPrice?: number;
        isFree?: boolean;
        isPremium?: boolean;
        rating: number;
        reviewCount: number;
        formats: string[];
        polyCount: string;
        hasTextures: boolean;
        isRigged: boolean;
        isAnimated: boolean;
        description: string;
        tags: string[];
    };
    relatedProducts?: Array<{
        id: string;
        title: string;
        image: string;
        price: number;
        author: string;
    }>;
}

const FORMAT_COLORS: Record<string, string> = {
    blend: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    fbx: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    obj: 'bg-green-500/20 text-green-400 border-green-500/30',
    max: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    stl: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    gltf: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export default function ProductDetailsModal({
    isOpen,
    onClose,
    product,
    relatedProducts = [],
}: ProductDetailsModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'files'>('description');
    const [isViewMode3D, setIsViewMode3D] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const router = useRouter();

    // Auth & Cart logic
    const { user, showLogin } = useAuth();
    const { addToCart, items } = useCart();
    const isInCart = items.some(item => item.model_id === product.id);

    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'reviews') {
            loadReviews();
        }
    }, [isOpen, activeTab, product.id]);

    const loadReviews = async () => {
        setIsLoadingReviews(true);
        try {
            const data = await reviewApi.getReviews(product.id);
            setReviews(data);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const handleReviewSubmit = async (rating: number, comment: string) => {
        setIsSubmittingReview(true);
        try {
            await reviewApi.createReview(product.id, { rating, comment });
            await loadReviews();
            // Optional: Show success toast
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            alert(error.response?.data?.message || 'Failed to submit review. Make sure you have purchased this model.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDownload = async () => {
        if (!user) {
            showLogin?.();
            return;
        }
        try {
            const { download_url } = await purchaseService.getDownloadUrl(product.id);
            if (!download_url) {
                alert('Download URL not available');
                return;
            }
            window.open(download_url, '_blank');
        } catch (error: any) {
            console.error('Download failed:', error);
            alert(error.response?.data?.message || error.message || 'Failed to get download URL');
        }
    };

    if (!isOpen) return null;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    const displayPrice = product.isFree ? 'Free' : `$${product.price.toFixed(2)}`;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-4 md:inset-8 lg:inset-12 bg-[#0a0a0a] rounded-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-800">
                    <h2 className="text-white font-semibold text-lg truncate pr-4">{product.title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-6">
                        {/* Left: Image/3D Preview */}
                        <div className="space-y-4">
                            {/* Main Preview Area */}
                            <div className="relative aspect-[4/3] bg-[#141414] rounded-xl overflow-hidden">
                                {isViewMode3D ? (
                                    <ModelViewer3D modelUrl={product.modelFileUrl} />
                                ) : (
                                    <>
                                        <img
                                            src={product.images[currentImageIndex]}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Image Navigation */}
                                        {product.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* View Mode Toggle */}
                                <div className="absolute top-3 right-3 flex bg-black/50 backdrop-blur-sm rounded-lg p-1">
                                    <button
                                        onClick={() => setIsViewMode3D(false)}
                                        className={`p-2 rounded-md transition-colors cursor-pointer ${!isViewMode3D ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                                            }`}
                                        title="Image View"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsViewMode3D(true)}
                                        className={`p-2 rounded-md transition-colors cursor-pointer ${isViewMode3D ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                                            }`}
                                        title="3D View"
                                    >
                                        <Box className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentImageIndex(index);
                                            setIsViewMode3D(false);
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

                        {/* Right: Product Info */}
                        <div className="space-y-6">
                            {/* Author & Rating */}
                            <div>
                                <Link href={`/creator/${product.author}`} className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                                    by @{product.author}
                                </Link>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(product.rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white text-sm">{product.rating.toFixed(1)}</span>
                                    <span className="text-gray-500 text-sm">({product.reviewCount} reviews)</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className={`text-3xl font-bold ${product.isFree ? 'text-yellow-400' : 'text-white'}`}>
                                    {displayPrice}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-gray-500 line-through text-lg">
                                        ${product.originalPrice.toFixed(2)}
                                    </span>
                                )}
                                {product.isPremium && (
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded">
                                        PRO
                                    </span>
                                )}
                            </div>

                            {/* CTA Buttons - Mobile Optimized */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        if (product.price === 0 || product.isFree) {
                                            handleDownload();
                                        } else if (!isInCart) {
                                            addToCart({ modelId: product.id });
                                        }
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 font-bold rounded-xl transition-all cursor-pointer ${(isInCart && !product.isFree && product.price > 0)
                                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                        : (product.isFree || product.price === 0)
                                            ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_20px_rgba(234,179,8,0.2)]'
                                            : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_20px_rgba(234,179,8,0.2)]'
                                        } hover:scale-[1.02] active:scale-[0.98]`}
                                >
                                    {(product.isFree || product.price === 0) ? (
                                        <>
                                            <Download className="w-5 h-5" />
                                            Download Free
                                        </>
                                    ) : (
                                        <>
                                            {isInCart ? (
                                                <>
                                                    <Check className="w-5 h-5" />
                                                    In Cart
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-5 h-5" />
                                                    Add to Cart
                                                </>
                                            )}
                                        </>
                                    )}
                                </button>

                                {!product.isFree && (
                                    <button
                                        onClick={() => {
                                            if (!isInCart) {
                                                addToCart({ modelId: product.id });
                                            }
                                            router.push('/cart');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all cursor-pointer border border-gray-200 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        Buy Now
                                    </button>
                                )}

                                <div className="flex gap-3 sm:gap-2">
                                    <button
                                        onClick={() => setIsSaved(!isSaved)}
                                        className={`flex-1 sm:flex-none p-4 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center hover:scale-[1.05] active:scale-[0.95] ${isSaved
                                            ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_4px_15px_rgba(239,68,68,0.1)]'
                                            : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                                            }`}
                                        title="Save to Collection"
                                    >
                                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                                    </button>
                                    <button className="flex-1 sm:flex-none p-4 sm:p-3.5 border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center hover:scale-[1.05] active:scale-[0.95]">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Specs */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#141414] rounded-lg p-3">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Formats</p>
                                    <div className="flex flex-wrap gap-1">
                                        {product.formats.map((format) => (
                                            <span
                                                key={format}
                                                className={`text-xs font-semibold px-2 py-0.5 rounded border ${FORMAT_COLORS[format] || 'bg-gray-700 text-gray-300 border-gray-600'
                                                    }`}
                                            >
                                                {format.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-[#141414] rounded-lg p-3">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Polygons</p>
                                    <p className="text-white font-medium">{product.polyCount}</p>
                                </div>
                                <div className="bg-[#141414] rounded-lg p-3">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Features</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {product.hasTextures && (
                                            <span className="flex items-center gap-1 text-green-400">
                                                <Check className="w-3 h-3" /> Textures
                                            </span>
                                        )}
                                        {product.isRigged && (
                                            <span className="flex items-center gap-1 text-blue-400">
                                                <Check className="w-3 h-3" /> Rigged
                                            </span>
                                        )}
                                        {product.isAnimated && (
                                            <span className="flex items-center gap-1 text-purple-400">
                                                <Check className="w-3 h-3" /> Animated
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-[#141414] rounded-lg p-3">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">License</p>
                                    <p className="text-white font-medium text-sm">Royalty Free</p>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <Link
                                        key={tag}
                                        href={`/catalog?tag=${tag}`}
                                        className="px-3 py-1 bg-[#1a1a1a] text-gray-400 text-xs rounded-full hover:bg-[#252525] hover:text-white transition-colors"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="border-t border-gray-800 mt-4">
                        {/* Tab Headers */}
                        <div className="flex gap-1 px-4 md:px-6 pt-4">
                            {(['description', 'reviews', 'files'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer capitalize ${activeTab === tab
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="px-4 md:px-6 py-4">
                            {activeTab === 'description' && (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="text-gray-300 leading-relaxed">{product.description}</p>
                                </div>
                            )}
                            {activeTab === 'reviews' && (
                                <div className="space-y-6">
                                    {user && (
                                        <ProductReviewForm
                                            onSubmit={handleReviewSubmit}
                                            isSubmitting={isSubmittingReview}
                                        />
                                    )}
                                    <ProductReviewList
                                        reviews={reviews}
                                        isLoading={isLoadingReviews}
                                    />
                                </div>
                            )}
                            {activeTab === 'files' && (
                                <div className="text-gray-500 text-sm">
                                    <p>File list coming soon...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="border-t border-gray-800 px-4 md:px-6 py-6">
                            <h3 className="text-white font-semibold mb-4">Related Products</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {relatedProducts.slice(0, 4).map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/catalog/${item.id}`}
                                        className="group bg-[#141414] rounded-lg overflow-hidden hover:bg-[#1a1a1a] transition-colors"
                                    >
                                        <div className="aspect-square overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-white text-sm font-medium line-clamp-1">{item.title}</p>
                                            <p className="text-gray-500 text-xs">{item.author}</p>
                                            <p className="text-yellow-400 text-sm font-semibold mt-1">
                                                ${item.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - View Full Page */}
                <div className="border-t border-gray-800 px-4 md:px-6 py-3 flex justify-center">
                    <Link
                        href={`/catalog/${product.id}`}
                        onClick={onClose}
                        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold py-2 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-yellow-500" />
                        View Full Page
                    </Link>
                </div>
            </div>
        </>
    );
}
