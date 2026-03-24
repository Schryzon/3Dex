'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/features/catalog/hooks/useProducts';
import { useCart } from '@/features/cart';
import { useWishlist } from '@/features/catalog/hooks/useWishlist';
import { useAuth } from '@/features/auth';
import { Share2, Heart, Plus, Check, Download, Eye, ShoppingCart, FolderPlus, AlertTriangle, ChevronLeft } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Suspense, lazy, useState } from 'react';
import Link from 'next/link';
import { ProductDetails } from '@/features/catalog/components/product-details';
import { RelatedProducts } from '@/features/catalog/components/product-details';
import { ProductReviews } from '@/features/catalog/components/reviews';
import AddToCollectionModal from '@/features/collection/components/AddToCollectionModal';
import { formatPrice } from '@/lib/utils';
import { purchaseService } from '@/lib/api/services/purchase.service';
import { toast } from 'react-hot-toast';

// Lazy load 3D viewer for better performance
const ProductViewer3D = lazy(() => import('@/features/catalog/components/viewer').then(mod => ({ default: mod.ProductViewer3D })));

export default function CatalogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const { data: product, isLoading, error } = useProduct(productId);
    const { addToCart, isAddingToCart } = useCart();
    const { isAuthenticated, showLogin, user } = useAuth();
    const { isInWishlist, toggle: toggleWishlist, isToggling } = useWishlist();
    const [addedLocally, setAddedLocally] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [currency, setCurrency] = useState<'idr' | 'usd'>('idr');
    const [isClaiming, setIsClaiming] = useState(false);
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

    const handleAddToCart = async () => {
        if (!isAuthenticated) { showLogin?.(); return; }
        try {
            await addToCart({ modelId: productId });
            setAddedLocally(true);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) { showLogin?.(); return; }
        try {
            await addToCart({ modelId: productId });
            router.push('/cart');
        } catch (error) {
            console.error('Failed to buy now:', error);
        }
    };

    const handleClaimAndDownload = async () => {
        if (!isAuthenticated) {
            showLogin?.();
            return;
        }
        setIsClaiming(true);
        try {
            // Claim the model (create purchase record)
            await purchaseService.buyModel(productId);
            toast.success('Model added to your library!');

            // Open download
            await handleDownload();

        } catch (error: any) {
            // kalo (409), just download directly
            if (error?.response?.status === 409) {
                await handleDownload();
            } else {
                console.error('Failed to claim model:', error);
                toast.error(error.message || 'Failed to claim model');
            }
        } finally {
            setIsClaiming(false);
        }
    };

    const handleDownload = async () => {
        try {
            const { download_url } = await purchaseService.getDownloadUrl(productId);
            if (!download_url) {
                toast.error('Download URL not available');
                return;
            }
            const link = document.createElement('a');
            link.href = download_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error: any) {
            console.error('Download failed:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to get download URL');
        }
    };

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) { showLogin?.(); return; }
        try {
            await toggleWishlist(productId);
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-white">Asset Not Found</h2>
                    <p className="text-sm text-gray-400">The requested resource could not be located.</p>
                    <button
                        onClick={() => router.push('/catalog')}
                        className="px-6 py-2.5 bg-yellow-500 text-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
                    >
                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="border-b border-gray-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-3 sm:gap-4 overflow-hidden w-full">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors duration-300 group text-sm shrink-0"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                            <span>Back</span>
                        </button>
                        <div className="w-full sm:w-auto overflow-hidden">
                            <Breadcrumbs
                                items={[
                                    { label: 'Catalog', href: '/catalog' },
                                    { label: product.category, href: `/catalog?category=${product.category}` },
                                    { label: product.title, active: true }
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

                    {/* Left: Media Gallery - 2 cols */}
                    <div className="lg:col-span-2">
                        {/* Main Image/3D Viewer */}
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-900 mb-4 group">
                            {/* 2D/3D Toggle */}
                            <div className="absolute top-4 left-4 z-20">
                                <div className="bg-black/90 backdrop-blur-xl border border-gray-800 rounded-lg p-1 flex gap-1 shadow-xl">
                                    <button
                                        onClick={() => setSelectedImage(0)}
                                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 ${selectedImage !== -1
                                            ? 'bg-white text-black shadow-lg shadow-yellow-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        <Eye className="w-3.5 h-3.5 inline mr-1.5" />
                                        Image
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(-1)}
                                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 ${selectedImage === -1
                                            ? 'bg-white text-black shadow-lg shadow-yellow-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                        </svg>
                                        3D
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    className="p-2.5 bg-black/80 hover:bg-white hover:text-black backdrop-blur-xl border border-gray-800 hover:border-white rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-yellow-500/20"
                                    aria-label="Share"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (!isAuthenticated) return showLogin?.();
                                        setIsCollectionModalOpen(true);
                                    }}
                                    className="p-2.5 bg-black/80 hover:bg-yellow-400 hover:text-black backdrop-blur-xl border border-gray-800 hover:border-yellow-400 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-yellow-500/20"
                                    aria-label="Add to Collection"
                                >
                                    <FolderPlus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleToggleWishlist}
                                    disabled={isToggling}
                                    className={`p-2.5 backdrop-blur-xl border rounded-lg transition-all duration-300 hover:scale-110 ${isInWishlist(productId)
                                        ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
                                        : 'bg-black/80 border-gray-800 hover:bg-red-500 hover:border-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20'
                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                    aria-label="Save to Wishlist"
                                >
                                    <Heart className={`w-4 h-4 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="w-full h-full relative overflow-hidden">
                                {selectedImage === -1 ? (
                                    <Suspense fallback={
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                                        </div>
                                    }>
                                        <div className={`w-full h-full ${product.is_nsfw && !user?.show_nsfw ? 'blur-2xl pointer-events-none' : ''}`}>
                                            <ProductViewer3D modelUrl={product.modelFileUrl} />
                                        </div>
                                    </Suspense>
                                ) : (
                                    <img
                                        src={product.thumbnails?.[selectedImage] || product.thumbnails?.[0]}
                                        alt={product.title}
                                        className={`w-full h-full object-cover transition-transform duration-700 ${product.is_nsfw && !user?.show_nsfw ? 'blur-2xl scale-110' : 'group-hover:scale-105'}`}
                                    />
                                )}
                                {product.is_nsfw && !user?.show_nsfw && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white z-10 pointer-events-none backdrop-blur-sm">
                                        <AlertTriangle className="w-12 h-12 text-red-500 mb-2 opacity-80 shadow-black drop-shadow-lg" />
                                        <p className="font-bold tracking-wide shadow-black drop-shadow-md pb-1 text-lg">Mature Content</p>
                                        <p className="text-sm font-semibold text-gray-300 shadow-black drop-shadow-md">Show NSFW content in settings to view</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {product.thumbnails?.map((thumb: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${selectedImage === index
                                        ? 'border-yellow-500 shadow-lg shadow-yellow-500/20'
                                        : 'border-gray-900 hover:border-yellow-500/50'
                                        }`}
                                >
                                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info - 1 col (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-6 space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded border border-yellow-500/20">
                                        {product.status === 'APPROVED' ? 'Verified' : 'Pending'}
                                    </span>
                                    <span className="text-xs text-gray-500">{product.category}</span>
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    {product.title}
                                </h1>
                                <p className="text-xs text-gray-500">SKU: {product.id.slice(0, 8)}</p>
                            </div>

                            {/* Price */}
                            <div className="border-y border-gray-900 py-4">
                                <div className="flex items-end justify-between mb-2">
                                    <div className="text-3xl font-bold text-white">
                                        {currency === 'idr' ? formatPrice(product.price).idr : formatPrice(product.price).usd}
                                    </div>
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
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>✓ Royalty Free</span>
                                    <span>•</span>
                                    <span>Commercial Use</span>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-3">
                                {product.isPurchased ? (
                                    <button
                                        onClick={handleDownload}
                                        className="w-full cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Now
                                    </button>
                                ) : product.price === 0 ? (
                                    // Free model → Claim then download
                                    <button
                                        onClick={handleClaimAndDownload}
                                        disabled={isClaiming}
                                        className="w-full cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isClaiming ? (
                                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <Download className="w-5 h-5" />
                                        )}
                                        {isClaiming ? 'Claiming...' : 'Download Free'}
                                    </button>
                                ) : (
                                    // Paid model → Add to Cart / Buy Now
                                    <>
                                        {addedLocally ? (
                                            <button
                                                onClick={() => router.push('/cart')}
                                                className="w-full cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <Check className="w-5 h-5" />
                                                Go to Cart
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={isAddingToCart}
                                                className="w-full cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                {isAddingToCart ? (
                                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                ) : (
                                                    <ShoppingCart className="w-5 h-5" />
                                                )}
                                                Add to Cart
                                            </button>
                                        )}

                                        <button
                                            onClick={handleBuyNow}
                                            disabled={isAddingToCart}
                                            className="w-full cursor-pointer bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-yellow-500/50 text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            Buy Now
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Artist Info */}
                            <Link
                                href={`/u/${product.artist?.username || ''}`}
                                className="flex items-center gap-3 p-4 rounded-lg bg-gray-900 border border-gray-900 hover:border-gray-800 transition-all duration-300 group hover:shadow-lg hover:shadow-yellow-500/5"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-sm font-bold uppercase flex-shrink-0 border border-gray-800 group-hover:border-yellow-500/50 transition-all duration-300">
                                    {product.artist?.username?.[0] || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500">Created by</p>
                                    <p className="text-sm font-semibold text-white group-hover:text-yellow-500 transition-colors duration-300 truncate">
                                        {product.artist?.username || 'Anonymous'}
                                    </p>
                                </div>
                                <svg className="w-4 h-4 text-gray-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>

                            {/* Specs */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-white">Specifications</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b border-gray-900 hover:border-yellow-500/20 transition-colors duration-300 group">
                                        <span className="text-gray-400 group-hover:text-gray-300">Polygons</span>
                                        <span className="text-white font-medium">{product.polyCount?.toLocaleString() || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-900 hover:border-yellow-500/20 transition-colors duration-300 group">
                                        <span className="text-gray-400 group-hover:text-gray-300">Format</span>
                                        <span className="text-white font-medium">{product.fileFormat?.join(', ') || 'OBJ'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-900 hover:border-yellow-500/20 transition-colors duration-300 group">
                                        <span className="text-gray-400 group-hover:text-gray-300">License</span>
                                        <span className="text-yellow-500 font-medium">Standard</span>
                                    </div>
                                    <div className="flex justify-between py-2 hover:border-yellow-500/20 transition-colors duration-300 group">
                                        <span className="text-gray-400 group-hover:text-gray-300">3D Printable</span>
                                        <span className={`font-medium ${product.isPrintable ? 'text-yellow-500' : 'text-white'}`}>
                                            {product.isPrintable ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* License Info */}
                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <h4 className="text-sm font-semibold text-white">License Includes</h4>
                                </div>
                                <ul className="space-y-2 text-xs text-gray-300">
                                    <li className="flex items-start gap-2 hover:text-white transition-colors duration-300">
                                        <svg className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Commercial use</span>
                                    </li>
                                    <li className="flex items-start gap-2 hover:text-white transition-colors duration-300">
                                        <svg className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Unlimited renders</span>
                                    </li>
                                    <li className="flex items-start gap-2 hover:text-white transition-colors duration-300">
                                        <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>No resale of files</span>
                                    </li>
                                </ul>
                                <button className="text-xs text-yellow-500 hover:text-yellow-400 font-medium mt-3 transition-colors duration-300 flex items-center gap-1 group">
                                    Full license details
                                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extended Info Sections */}
                <div className="mt-12 space-y-12">
                    <ProductDetails product={product} />
                    <ProductReviews productId={product.id} isPurchased={!!product.isPurchased} />
                    <RelatedProducts productId={product.id} categories={[product.category]} />
                </div>
            </div>

            <AddToCollectionModal
                modelId={productId}
                isOpen={isCollectionModalOpen}
                onClose={() => setIsCollectionModalOpen(false)}
            />
        </div>
    );
}