import React from 'react';
import UserAvatar from '@/components/common/UserAvatar';
import { UserReview } from '@/types/catalog';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface UserReviewCardProps {
    review: UserReview;
}

const UserReviewCard: React.FC<UserReviewCardProps> = ({ review }) => {
    return (
        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-4">
            <Link href={`/u/${review.reviewer.username}`}>
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <UserAvatar user={review.reviewer} className="w-full h-full" />
                </div>
            </Link>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <Link href={`/u/${review.reviewer.username}`} className="font-bold text-white hover:text-yellow-400 transition-colors">
                        @{review.reviewer.username}
                    </Link>
                    <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(review.created_at).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
                        />
                    ))}
                </div>
                {review.comment && (
                    <p className="text-gray-400 text-sm leading-relaxed italic">
                        "{review.comment}"
                    </p>
                )}
            </div>
        </div>
    );
};

export default UserReviewCard;
