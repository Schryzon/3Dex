import React, { useState } from 'react';
import { Star, X, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/lib/api/services/review.service';
import { toast } from 'react-hot-toast';

interface WriteUserReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: string;
    targetUsername: string;
}

const WriteUserReviewModal: React.FC<WriteUserReviewModalProps> = ({
    isOpen,
    onClose,
    targetUserId,
    targetUsername
}) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            if (rating === 0) throw new Error('Please select a rating');
            return reviewService.createUserReview(targetUserId, { rating, comment });
        },
        onSuccess: () => {
            toast.success('Review submitted successfully!');
            queryClient.invalidateQueries({ queryKey: ['user-reviews', targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['user', targetUsername] });
            queryClient.invalidateQueries({ queryKey: ['review-eligibility', targetUserId] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || 'Failed to submit review');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Write a Review</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Reviewing @{targetUsername}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-8 space-y-8">
                    {/* Rating Selector */}
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-widest">How was your experience?</p>
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="relative transition-transform active:scale-95 group focus:outline-none"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <Star
                                        className={`w-10 h-10 transition-all duration-200 ${
                                            (hover || rating) >= star 
                                                ? 'text-yellow-400 fill-yellow-400 scale-110' 
                                                : 'text-gray-700'
                                        }`}
                                    />
                                    {rating === star && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 text-xs font-black uppercase tracking-tighter text-yellow-500/80">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent!"}
                            {rating === 0 && <span className="opacity-0">Select</span>}
                        </p>
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Your Feedback (Optional)
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell others about your experience..."
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400 transition-colors resize-none text-sm leading-relaxed"
                        />
                    </div>

                    {/* Guidelines */}
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[11px] text-emerald-500/80 leading-relaxed">
                            <strong>Verified Review:</strong> Your purchase/order history with this user has been verified. 
                            Reviews help maintain quality in the 3Dēx community.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={rating === 0 || mutation.isPending}
                        className="flex-[2] py-3 px-4 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-800 disabled:text-gray-600 text-black font-black rounded-2xl transition-all shadow-lg shadow-yellow-400/10 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Submit Review"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WriteUserReviewModal;
