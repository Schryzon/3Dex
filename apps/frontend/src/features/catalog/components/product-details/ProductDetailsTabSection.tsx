'use client';

import { ProductReviewForm } from '@/features/catalog/components/reviews';
import { ProductReviewList } from '@/features/catalog/components/reviews';
import type { Review } from '@/types';

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

                {/* Files tab: simulated file list placeholder */}
                {activeTab === 'files' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">ZIP</div>
                             <div>
                                <p className="text-sm font-bold text-gray-300">ProjectFiles.zip</p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Source Assets</p>
                             </div>
                           </div>
                           <span className="text-[10px] font-bold text-gray-700">1.2 GB</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">BLEND</div>
                             <div>
                                <p className="text-sm font-bold text-gray-300">Model_Scene.blend</p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">3D Source</p>
                             </div>
                           </div>
                           <span className="text-[10px] font-bold text-gray-700">450 MB</span>
                        </div>
                        <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest pt-4">
                           Full file access available upon purchase
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
