'use client';

import Link from 'next/link';
import { X, Star, ExternalLink } from 'lucide-react';
import { useProductDetails } from '@/lib/hooks/useProductDetails';
import ProductDetailsImageGallery from './ProductDetailsImageGallery';
import ProductDetailsCTAButtons from './ProductDetailsCTAButtons';
import ProductDetailsSpecGrid from './ProductDetailsSpecGrid';
import ProductDetailsTabSection from './ProductDetailsTabSection';
import ProductDetailsRelatedGrid from './ProductDetailsRelatedGrid';

// Full product shape accepted by the modal
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

export default function ProductDetailsModal({
    isOpen,
    onClose,
    product,
    relatedProducts = [],
}: ProductDetailsModalProps) {
    // All state, effects, and handlers live in the hook
    const {
        user,
        isInCart,
        addToCart,
        router,
        currentImageIndex,
        setCurrentImageIndex,
        isViewMode3D,
        setIsViewMode3D,
        nextImage,
        prevImage,
        isSaved,
        setIsSaved,
        activeTab,
        setActiveTab,
        reviews,
        isLoadingReviews,
        isSubmittingReview,
        handleReviewSubmit,
        handleDownload,
        displayPrice,
        showLogin,
    } = useProductDetails(product, isOpen);

    // Early return after all hooks — hooks must not be conditional
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop — clicking it closes the modal */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal shell */}
            <div className="fixed inset-4 md:inset-8 lg:inset-12 bg-[#0a0a0a] rounded-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header: product title + close button */}
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-800">
                    <h2 className="text-white font-semibold text-lg truncate pr-4">{product.title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-6">

                        {/* Left column: image gallery / 3D preview */}
                        <ProductDetailsImageGallery
                            images={product.images}
                            modelFileUrl={product.modelFileUrl}
                            title={product.title}
                            currentImageIndex={currentImageIndex}
                            isViewMode3D={isViewMode3D}
                            onPrev={prevImage}
                            onNext={nextImage}
                            onThumbnailClick={setCurrentImageIndex}
                            onSetViewMode3D={setIsViewMode3D}
                        />

                        {/* Right column: product info, CTA buttons, specs */}
                        <div className="space-y-6">

                            {/* Author link and star rating */}
                            <div>
                                <Link href={`/creator/${product.author}`} className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                                    by @{product.author}
                                </Link>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white text-sm">{product.rating.toFixed(1)}</span>
                                    <span className="text-gray-500 text-sm">({product.reviewCount} reviews)</span>
                                </div>
                            </div>

                            {/* Price display with optional original price and PRO badge */}
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

                            {/* CTA buttons: Add to Cart / Download, Buy Now, Save, Share */}
                            <ProductDetailsCTAButtons
                                product={product}
                                isInCart={isInCart}
                                isSaved={isSaved}
                                onPrimaryClick={() => {
                                    if (!user) { showLogin?.(); return; }
                                    if (product.price === 0 || product.isFree) {
                                        handleDownload();
                                    } else if (!isInCart) {
                                        addToCart({ modelId: product.id });
                                    }
                                }}
                                onBuyNow={() => {
                                    if (!user) { showLogin?.(); return; }
                                    if (!isInCart) addToCart({ modelId: product.id });
                                    router.push('/cart');
                                }}
                                onToggleSave={() => {
                                    if (!user) { showLogin?.(); return; }
                                    setIsSaved(!isSaved);
                                }}
                            />

                            {/* Spec grid: formats, polygon count, features, license, tags */}
                            <ProductDetailsSpecGrid
                                formats={product.formats}
                                polyCount={product.polyCount}
                                hasTextures={product.hasTextures}
                                isRigged={product.isRigged}
                                isAnimated={product.isAnimated}
                                tags={product.tags}
                            />
                        </div>
                    </div>

                    {/* Tabs: description, reviews, files */}
                    <ProductDetailsTabSection
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        description={product.description}
                        reviews={reviews}
                        isLoadingReviews={isLoadingReviews}
                        isSubmittingReview={isSubmittingReview}
                        user={user}
                        onReviewSubmit={handleReviewSubmit}
                    />

                    {/* Related products grid (hidden when empty) */}
                    <ProductDetailsRelatedGrid relatedProducts={relatedProducts} />
                </div>

                {/* Footer: link to the full catalog detail page */}
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
