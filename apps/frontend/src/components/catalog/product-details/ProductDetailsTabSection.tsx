'use client';

import { ProductReviewForm } from '@/components/catalog/reviews';
import { ProductReviewList } from '@/components/catalog/reviews';
import type { Review } from '@/lib/api/services/review.service';

// The three available tab identifiers
type TabId = 'description' | 'reviews' | 'files';

interface ProductDetailsTabSectionProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    // Description tab content
    description: string;
    // Reviews tab data
    reviews: Review[];
    isLoadingReviews: boolean;
    isSubmittingReview: boolean;
    // Authenticated user — controls whether the review form is shown
    user: { id: string } | null;
    onReviewSubmit: (rating: number, comment: string) => Promise<void>;
}

export default function ProductDetailsTabSection({
    activeTab,
    onTabChange,
    description,
    reviews,
    isLoadingReviews,
    isSubmittingReview,
    user,
    onReviewSubmit,
}: ProductDetailsTabSectionProps) {
    return (
        <div className="border-t border-gray-800 mt-4">
            {/* Tab header buttons */}
            <div className="flex gap-1 px-4 md:px-6 pt-4">
                {(['description', 'reviews', 'files'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer capitalize ${activeTab === tab
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab content area */}
            <div className="px-4 md:px-6 py-4">
                {/* Description tab: renders the product description as prose */}
                {activeTab === 'description' && (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-gray-300 leading-relaxed">{description}</p>
                    </div>
                )}

                {/* Reviews tab: form for authenticated users + the full review list */}
                {activeTab === 'reviews' && (
                    <div className="space-y-6">
                        {/* Only authenticated users can submit a review */}
                        {user && (
                            <ProductReviewForm
                                onSubmit={onReviewSubmit}
                                isSubmitting={isSubmittingReview}
                            />
                        )}
                        <ProductReviewList
                            reviews={reviews}
                            isLoading={isLoadingReviews}
                        />
                    </div>
                )}

                {/* Files tab: placeholder until file list feature is implemented */}
                {activeTab === 'files' && (
                    <div className="text-gray-500 text-sm">
                        <p>File list coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
