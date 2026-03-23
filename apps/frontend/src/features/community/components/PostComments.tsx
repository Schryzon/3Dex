'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService, postKeys } from '@/lib/api/services/post.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface PostCommentsProps {
    postId: string;
}

export default function PostComments({ postId }: PostCommentsProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');

    const { data: comments, isLoading } = useQuery({
        queryKey: postKeys.comments(postId),
        queryFn: () => postService.getComments(postId)
    });

    const addCommentMutation = useMutation({
        mutationFn: () => postService.addComment(postId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
            queryClient.invalidateQueries({ queryKey: postKeys.feed }); // Update comment count
            setContent('');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to post comment');
        }
    });

    return (
        <div className="pt-4 mt-4 border-t border-gray-800 space-y-4">
            {/* Comment List */}
            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {comments?.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0">
                                {comment.user.avatar_url ? (
                                    <img src={comment.user.avatar_url} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                        {comment.user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 bg-gray-900/50 rounded-2xl rounded-tl-none p-3 border border-gray-800/50">
                                <div className="flex items-baseline justify-between gap-2 mb-1">
                                    <Link href={`/u/${comment.user.username}`} className="text-sm font-bold text-white hover:underline">
                                        {comment.user.username}
                                    </Link>
                                    <span className="text-[10px] text-gray-500">
                                        {formatDistanceToNow(new Date(comment.created_at))} ago
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                    {comments?.length === 0 && (
                        <p className="text-center text-sm text-gray-500 p-2">No comments yet. Be the first to reply!</p>
                    )}
                </div>
            )}

            {/* Post Comment Input */}
            {user && (
                <div className="flex gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 mt-1">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                {user.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 resize-none h-[42px] custom-scrollbar focus:h-20 transition-all duration-200 pr-12"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (content.trim()) addCommentMutation.mutate();
                                }
                            }}
                        />
                        <button
                            onClick={() => addCommentMutation.mutate()}
                            disabled={!content.trim() || addCommentMutation.isPending}
                            className="absolute right-2 top-2 p-1.5 text-yellow-400 hover:text-yellow-300 disabled:opacity-30 disabled:hover:text-yellow-400 transition-colors bg-black/20 rounded-lg"
                        >
                            {addCommentMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 -ml-0.5" />
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
