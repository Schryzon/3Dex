import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';

interface ProductReviewFormProps {
    onSubmit: (rating: number, comment: string) => Promise<void>;
    isSubmitting: boolean;
}

export default function ProductReviewForm({ onSubmit, isSubmitting }: ProductReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        await onSubmit(rating, comment);
        setComment('');
        setRating(5);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#141414] border border-gray-800 rounded-2xl p-5 mb-8">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                Write a Review
            </h3>

            <div className="space-y-4">
                {/* Star Rating Selector */}
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Rating</label>
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform active:scale-90 cursor-pointer"
                            >
                                <Star
                                    className={`w-7 h-7 transition-colors ${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-700 hover:text-gray-600'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment Textarea */}
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Review Comment</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What do you think about this model? Quality, textures, etc..."
                        className="w-full bg-[#0a0a0a] text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/5 transition-all resize-none h-28 text-sm"
                        required
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-yellow-400/10 hover:shadow-yellow-400/20 active:scale-[0.98] flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Submit Review
                    </button>
                </div>
            </div>
        </form>
    );
}
