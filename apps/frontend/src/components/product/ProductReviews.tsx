'use client';

import React, { useEffect, useState } from 'react';
import { reviewApi, Review, ReviewStats } from '@/lib/api/reviews';
import { Star, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import ProductReviewList from '../catalog/ProductReviewList';
import ProductReviewForm from '../catalog/ProductReviewForm';
import { useAuth } from '@/lib/hooks/useAuth';

interface Props {
  productId: string;
  isPurchased: boolean;
}

export default function ProductReviews({ productId, isPurchased }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    loadData();
  }, [productId]);

  // Hapus bagian cek hasReviewed dari loadData
  const loadData = async () => {
      setLoading(true);
      try {
        const [reviewsData, statsData] = await Promise.all([
          reviewApi.getReviews(productId),
          reviewApi.getReviewStats(productId)
        ]);
        setReviews(reviewsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching review data:', error);
      } finally {
        setLoading(false);
      }
  };

  // Tambah useEffect baru khusus cek hasReviewed
  useEffect(() => {
      if (user && reviews.length > 0) {
          console.log('Current user ID:', user.id);
          console.log('Review user_ids:', reviews.map((r: Review) => r.user_id));
          const alreadyReviewed = reviews.some((r: Review) => r.user_id === user.id);
          console.log('Has reviewed:', alreadyReviewed);
          setHasReviewed(alreadyReviewed);
      } else {
          setHasReviewed(false);
      }
  }, [user, reviews]);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    setIsSubmittingReview(true);
    try {
      await reviewApi.createReview(productId, { rating, comment });
      const [reviewsData, statsData] = await Promise.all([
        reviewApi.getReviews(productId),
        reviewApi.getReviewStats(productId)
      ]);
      setReviews(reviewsData);
      setStats(statsData);
      setHasReviewed(true); 
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      if (error.response?.status === 409) {
        setHasReviewed(true);
      }
      alert(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Review Stats Summary */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Customer Reviews</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= (stats?.averageRating || 0)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-700'
                      }`}
                  />
                ))}
              </div>
              <span className="text-gray-400">
                {stats?.averageRating.toFixed(1)} out of 5 ({stats?.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {isPurchased && (
        <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800/50">
          {hasReviewed ? (
            // Sudah review → tampilkan pesan
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">You have already reviewed this product. Thank you for your feedback!</p>
            </div>
          ) : (
            // Belum review → tampilkan form
            <>
              <h4 className="text-lg font-semibold text-white mb-4">Write a Review</h4>
              <ProductReviewForm
                onSubmit={handleReviewSubmit}
                isSubmitting={isSubmittingReview}
              />
            </>
          )}
        </div>
      )}

      {!isPurchased && (
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">You must purchase this model to leave a review.</p>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          All Reviews
        </h4>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          <ProductReviewList reviews={reviews} isLoading={loading} />
        ) : (
          <div className="text-center py-12 bg-gray-900/20 rounded-xl border border-dashed border-gray-800">
            <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}