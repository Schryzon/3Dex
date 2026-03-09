'use client';

import { Heart, Share2, ShoppingCart, Download, Check, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Only the product fields required for CTA button logic
interface CTAProduct {
    id: string;
    price: number;
    isFree?: boolean;
}

interface ProductDetailsCTAButtonsProps {
    product: CTAProduct;
    isInCart: boolean;
    isSaved: boolean;
    // Called when the primary action button is clicked (add to cart or download)
    onPrimaryClick: () => void;
    // Called when "Buy Now" is clicked
    onBuyNow: () => void;
    // Toggles the saved/wishlist state
    onToggleSave: () => void;
}

export default function ProductDetailsCTAButtons({
    product,
    isInCart,
    isSaved,
    onPrimaryClick,
    onBuyNow,
    onToggleSave,
}: ProductDetailsCTAButtonsProps) {
    const isFreeProduct = product.isFree || product.price === 0;

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Primary action: "Download Free" for free products, "Add to Cart" / "In Cart" for paid */}
            <button
                onClick={onPrimaryClick}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 font-bold rounded-xl transition-all cursor-pointer ${isInCart && !isFreeProduct
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_20px_rgba(234,179,8,0.2)]'
                    } hover:scale-[1.02] active:scale-[0.98]`}
            >
                {isFreeProduct ? (
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

            {/* "Buy Now" shortcut — only shown for paid products */}
            {!isFreeProduct && (
                <button
                    onClick={onBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all cursor-pointer border border-gray-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Buy Now
                </button>
            )}

            {/* Secondary actions: Save to wishlist and Share */}
            <div className="flex gap-3 sm:gap-2">
                {/* Save / wishlist toggle */}
                <button
                    onClick={onToggleSave}
                    className={`flex-1 sm:flex-none p-4 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center hover:scale-[1.05] active:scale-[0.95] ${isSaved
                            ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_4px_15px_rgba(239,68,68,0.1)]'
                            : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                        }`}
                    title="Save to Collection"
                >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>

                {/* Share button (functionality not yet implemented) */}
                <button className="flex-1 sm:flex-none p-4 sm:p-3.5 border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center hover:scale-[1.05] active:scale-[0.95]">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
