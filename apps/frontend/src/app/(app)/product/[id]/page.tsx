'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProduct, useProductReviews } from '@/lib/hooks/useProducts';
import { useCart } from '@/lib/hooks/useCart';
import { ArrowLeft, ShoppingCart, Heart, Download, Share2, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button, Badge } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Suspense, lazy, useState } from 'react';

// Lazy load 3D viewer for better performance
const ProductViewer3D = lazy(() => import('@/components/product/ProductViewer3D'));

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const { data: product, isLoading, error } = useProduct(productId);
    const { data: reviews } = useProductReviews(productId);
    const { addToCart, isAddingToCart } = useCart();

    const [selectedImage, setSelectedImage] = useState(0);
    const [isInWishlist, setIsInWishlist] = useState(false);

    const handleAddToCart = async () => {
        try {
            await addToCart({ modelId: productId });
            // Could add toast notification here
            alert('Added to cart!');
        } catch (error) {
            alert('Failed to add to cart. Please try again.');
        }
    };

    const handleBuyNow = async () => {
        try {
            await addToCart({ modelId: productId });
            router.push('/cart');
        } catch (error) {
            alert('Failed to proceed. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
                    <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push('/catalog')}>
                        Back to Catalog
                    </Button>
                </div>
            </div>
        );
    }

    const averageRating = reviews?.length
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
            {/* Header */}
            <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                <Share2 className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Left: 3D Viewer & Images */}
                    <div className="space-y-4">
                        {/* Main Viewer */}
                        <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                            <Suspense fallback={
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-gray-400 text-sm">Loading 3D viewer...</p>
                                    </div>
                                </div>
                            }>
                                <ProductViewer3D modelUrl={product.modelFileUrl} />
                            </Suspense>
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.thumbnails && product.thumbnails.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.thumbnails.map((thumb, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                                            ? 'border-yellow-400 scale-105'
                                            : 'border-gray-800 hover:border-gray-700'
                                            }`}
                                    >
                                        <img
                                            src={thumb}
                                            alt={`Preview ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-6">
                        {/* Title & Price */}
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <h1 className="text-3xl md:text-4xl font-bold text-white pr-4">
                                    {product.title}
                                </h1>
                                <button
                                    onClick={() => setIsInWishlist(!isInWishlist)}
                                    className="p-3 hover:bg-gray-800 rounded-lg transition-colors shrink-0"
                                >
                                    <Heart
                                        className={`w-6 h-6 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-400 text-sm">
                                    {averageRating.toFixed(1)} ({reviews?.length || 0} reviews)
                                </span>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-bold text-white">
                                    {formatPrice(product.price)}
                                </span>
                                {product.status === 'APPROVED' && (
                                    <Badge variant="success">Verified</Badge>
                                )}
                            </div>
                        </div>

                        {/* Artist Info */}
                        <Link
                            href={`/artist/${product.artistId}`}
                            className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-colors border border-gray-700"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-lg">
                                {product.artist.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Created by</p>
                                <p className="font-semibold text-white">{product.artist.username}</p>
                            </div>
                            <Eye className="w-5 h-5 text-gray-400" />
                        </Link>

                        {/* Specifications */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">Poly Count</p>
                                <p className="font-semibold text-white">{product.polyCount || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">File Formats</p>
                                <p className="font-semibold text-white">{product.fileFormat.join(', ')}</p>
                            </div>
                            <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">Category</p>
                                <p className="font-semibold text-white capitalize">{product.category}</p>
                            </div>
                            <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">Printable</p>
                                <p className="font-semibold text-white">{product.isPrintable ? 'Yes' : 'No'}</p>
                            </div>
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="default">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                className="flex-1 gap-2"
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                            >
                                {isAddingToCart ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        Add to Cart
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="gap-2"
                                onClick={handleBuyNow}
                                disabled={isAddingToCart}
                            >
                                <Download className="w-5 h-5" />
                                Buy Now
                            </Button>
                        </div>

                        {/* Description */}
                        <div className="pt-6 border-t border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-3">Description</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-gray-800 pt-12">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Reviews ({reviews?.length || 0})
                    </h2>

                    {reviews && reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="p-6 bg-gray-800/40 rounded-xl border border-gray-700"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {review.user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{review.user.username}</p>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-300">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-800/20 rounded-xl border border-gray-800">
                            <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
