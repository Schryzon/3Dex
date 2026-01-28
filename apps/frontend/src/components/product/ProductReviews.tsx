'use client';

import { useEffect, useState } from 'react';

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  images?: string[];
}

interface Props {
  productId: string;
}

export default function ProductReviews({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    images: [] as File[],
  });

  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, [productId, sortBy, filterRating]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        productId,
        sortBy,
        ...(filterRating && { rating: filterRating.toString() }),
      });
      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`/api/reviews/stats?productId=${productId}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', newReview.rating.toString());
      formData.append('comment', newReview.comment);
      newReview.images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowReviewForm(false);
        setNewReview({ rating: 5, comment: '', images: [] });
        fetchReviews();
        fetchReviewStats();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  return (
    <div className="bg-[#141414] rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Write a Review
        </button>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 border-b border-gray-800">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">{stats.averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-6 h-6 ${
                  i < Math.round(stats.averageRating) ? 'text-yellow-500' : 'text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-400">Based on {stats.totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

            return (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`flex items-center gap-3 w-full hover:bg-gray-800/50 p-2 rounded transition-all ${
                  filterRating === rating ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm">{rating}</span>
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="bg-gray-900/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Write Your Review</h3>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating })}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 transition-colors ${
                      rating <= newReview.rating ? 'text-yellow-500' : 'text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience with this product..."
              required
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Add Images (Optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setNewReview({ ...newReview, images: Array.from(e.target.files) });
                }
              }}
              className="w-full"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-all"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sort Controls */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-400">Sort by:</span>
        <button
          onClick={() => setSortBy('recent')}
          className={`px-3 py-1 rounded-lg transition-all ${
            sortBy === 'recent' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          Most Recent
        </button>
        <button
          onClick={() => setSortBy('helpful')}
          className={`px-3 py-1 rounded-lg transition-all ${
            sortBy === 'helpful' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          Most Helpful
        </button>
        <button
          onClick={() => setSortBy('rating')}
          className={`px-3 py-1 rounded-lg transition-all ${
            sortBy === 'rating' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          Highest Rating
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-800 pb-6 last:border-0">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{review.user.name}</h4>
                      <p className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-yellow-500' : 'text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-300 mb-3">{review.comment}</p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </div>
                  )}

                  {/* Helpful Button */}
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}