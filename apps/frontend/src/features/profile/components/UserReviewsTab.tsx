import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/lib/api/services/review.service';
import UserReviewCard from './UserReviewCard';
import { Loader2, MessageSquareOff } from 'lucide-react';

interface UserReviewsTabProps {
    userId: string;
}

const UserReviewsTab: React.FC<UserReviewsTabProps> = ({ userId }) => {
    const { data: reviews, isLoading, error } = useQuery({
        queryKey: ['user-reviews', userId],
        queryFn: async () => {
            const res = await reviewService.getUserReviews(userId);
            return Array.isArray(res) ? res : [];
        },
        enabled: !!userId
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-20 bg-[#111111]/20 rounded-[2.5rem] border border-gray-800/40">
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
        );
    }

    if (error || !reviews || reviews.length === 0) {
        return (
            <div className="text-center py-20 bg-[#111111]/20 rounded-[2.5rem] border border-gray-800/40 border-dashed">
                <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <MessageSquareOff className="w-8 h-8 text-gray-700" />
                </div>
                <p className="text-white/40 font-medium">No reviews yet.</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Be the first to review after a transaction!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review: any) => (
                <UserReviewCard key={review.id} review={review} />
            ))}
        </div>
    );
};

export default UserReviewsTab;
