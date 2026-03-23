import { Star, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Review } from '@/types';
import UserAvatar from '@/components/common/UserAvatar';

interface ProductReviewListProps {
    reviews: Review[];
    isLoading: boolean;
}

export default function ProductReviewList({ reviews, isLoading }: ProductReviewListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-800 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-800 rounded w-1/4" />
                                <div className="h-3 bg-gray-800 rounded w-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-900/20 rounded-2xl border border-dashed border-gray-800">
                <Star className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
            </div>
        );
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="bg-gray-900/30 border border-gray-800/60 rounded-xl p-5 hover:border-gray-700 transition-colors">
                    <div className="flex gap-4">
                        <UserAvatar
                            user={review.user as any}
                            size="md"
                            className="shrink-0 border border-gray-800"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                                <div>
                                    <h4 className="font-bold text-white text-sm truncate">
                                        {review.user.username}
                                    </h4>
                                    <div className="mt-0.5">{renderStars(review.rating)}</div>
                                </div>
                                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                </span>
                            </div>
                            {review.comment && (
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
