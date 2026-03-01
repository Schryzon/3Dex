import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCart } from '@/lib/hooks/useCart';
import { reviewService, Review } from '@/lib/api/services/review.service';
import { purchaseService } from '@/lib/api/services/purchase.service';

// Minimal product shape required by this hook.
// Only the fields actually used in state/handlers are included here;
// display-only fields live in each child component's own props interface.
interface UseProductDetailsProduct {
    id: string;
    price: number;
    isFree?: boolean;
    modelFileUrl?: string;
    images: string[];
}

export function useProductDetails(
    product: UseProductDetailsProduct,
    isOpen: boolean
) {
    const router = useRouter();

    // Auth and cart
    const { user, showLogin } = useAuth();
    const { addToCart, items } = useCart();

    // Derived: whether this product is already in the cart
    const isInCart = items.some(item => item.model_id === product.id);

    // Image gallery state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isViewMode3D, setIsViewMode3D] = useState(false);

    // Wishlist / save state
    const [isSaved, setIsSaved] = useState(false);

    // Active tab identifier
    const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'files'>('description');

    // Review list state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Load reviews whenever the modal opens with the reviews tab active,
    // or when the user switches to the reviews tab while the modal is open.
    useEffect(() => {
        if (isOpen && activeTab === 'reviews') {
            loadReviews();
        }
    }, [isOpen, activeTab, product.id]);

    // Fetch the review list for the current product from the API
    const loadReviews = async () => {
        setIsLoadingReviews(true);
        try {
            const data = await reviewService.getReviews(product.id);
            setReviews(data);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    // Submit a new review, then refresh the list on success
    const handleReviewSubmit = async (rating: number, comment: string) => {
        setIsSubmittingReview(true);
        try {
            await reviewService.createReview(product.id, { rating, comment });
            await loadReviews();
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            alert(error.response?.data?.message || 'Failed to submit review. Make sure you have purchased this model.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Trigger the file download for free or already-purchased products.
    // Prompts login if the user is not authenticated.
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

    // Image carousel navigation: advance to the next image (wraps around)
    const nextImage = () => {
        setCurrentImageIndex(prev => (prev + 1) % product.images.length);
    };

    // Image carousel navigation: go back to the previous image (wraps around)
    const prevImage = () => {
        setCurrentImageIndex(prev => (prev - 1 + product.images.length) % product.images.length);
    };

    // Human-readable price string used by multiple child components
    const displayPrice = product.isFree ? 'Free' : `$${product.price.toFixed(2)}`;

    return {
        // Auth
        user,
        // Cart
        isInCart,
        addToCart,
        // Navigation
        router,
        // Image gallery
        currentImageIndex,
        setCurrentImageIndex,
        isViewMode3D,
        setIsViewMode3D,
        nextImage,
        prevImage,
        // Wishlist
        isSaved,
        setIsSaved,
        // Tabs
        activeTab,
        setActiveTab,
        // Reviews
        reviews,
        isLoadingReviews,
        isSubmittingReview,
        handleReviewSubmit,
        // Download
        handleDownload,
        // Computed
        displayPrice,
    };
}
