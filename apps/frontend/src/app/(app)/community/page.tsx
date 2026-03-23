'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/lib/api/services';
import { useAuth } from '@/features/auth';
import UserAvatar from '@/components/common/UserAvatar';
import { Loader2, Heart, MessageSquare, Send, Image as ImageIcon, AlertTriangle, MoreVertical, Trash2, Flag } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import PostComments from '@/features/community/components/PostComments';

export default function CommunityPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // New Post State
    const [caption, setCaption] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [isNsfw, setIsNsfw] = useState(false);

    const { data: posts, isLoading } = useQuery({
        queryKey: ['community-feed'],
        queryFn: () => postService.getFeed()
    });

    const createPostMutation = useMutation({
        mutationFn: () => postService.createPost({
            caption,
            media_urls: [mediaUrl],
            is_nsfw: isNsfw
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            setCaption('');
            setMediaUrl('');
            setIsNsfw(false);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to post');
        }
    });

    const toggleLikeMutation = useMutation({
        mutationFn: (postId: string) => postService.toggleLike(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
        }
    });

    const deletePostMutation = useMutation({
        mutationFn: (postId: string) => postService.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            setOpenMenus({});
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete post');
        }
    });

    const reportPostMutation = useMutation({
        mutationFn: ({ postId, reason }: { postId: string, reason: string }) => postService.reportPost(postId, reason),
        onSuccess: () => {
            alert('Report submitted successfully!');
            setOpenMenus({});
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to report post');
        }
    });

    const canPost = user?.role === 'ARTIST' || user?.role === 'PROVIDER';

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Community Feed</h1>
                        <p className="text-gray-400">See what artists and providers are working on.</p>
                    </div>
                </div>

                {/* Create Post Widget */}
                {canPost && (
                    <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 shadow-xl">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0">
                                {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full" /> : <div className="w-full h-full flex items-center justify-center font-bold">{user?.username?.[0].toUpperCase()}</div>}
                            </div>
                            <div className="flex-1 space-y-4">
                                <textarea
                                    placeholder="What are you working on?"
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 resize-none h-20"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                                {mediaUrl && (
                                    <div className="relative rounded-lg overflow-hidden h-40 w-full bg-gray-900 border border-gray-800">
                                        <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setMediaUrl('')}
                                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                                    <div className="flex gap-4 items-center">
                                        <button
                                            onClick={() => {
                                                const url = prompt('Enter image URL:');
                                                if (url) setMediaUrl(url);
                                            }}
                                            className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-400/10 transition-colors"
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                        <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
                                            <input type="checkbox" checked={isNsfw} onChange={(e) => setIsNsfw(e.target.checked)} className="rounded border-gray-700 bg-gray-900 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900" />
                                            <span className="text-sm font-medium">NSFW Content</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => createPostMutation.mutate()}
                                        disabled={!caption.trim() || !mediaUrl || createPostMutation.isPending}
                                        className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition-all active:scale-[0.98] flex items-center gap-2"
                                    >
                                        {createPostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feed */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts?.map(post => (
                            <div key={post.id} className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-700 transition-colors">
                                {/* Post Header */}
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800">
                                        {post.user.avatar_url ? <img src={post.user.avatar_url} className="w-full h-full rounded-full" /> : <div className="w-full h-full flex items-center justify-center font-bold">{post.user.username[0].toUpperCase()}</div>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/u/${post.user.username}`} className="font-bold text-white hover:underline">
                                                {post.user.display_name || post.user.username}
                                            </Link>
                                            {(['ARTIST', 'PROVIDER', 'ADMIN'].includes(post.user.role)) && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${post.user.role === 'ARTIST' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    post.user.role === 'PROVIDER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {post.user.role}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                                    </div>

                                    {/* Action Menu */}
                                    <div className="ml-auto relative">
                                        <button
                                            onClick={() => setOpenMenus(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                            className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {openMenus[post.id] && (
                                            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl py-1 z-20">
                                                {(user?.role === 'ADMIN' || user?.id === post.user.id) && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this post?')) {
                                                                deletePostMutation.mutate(post.id);
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete Post
                                                    </button>
                                                )}
                                                {user?.id !== post.user.id && (
                                                    <button
                                                        onClick={() => {
                                                            const reason = window.prompt('Please enter the reason for reporting:');
                                                            if (reason) {
                                                                reportPostMutation.mutate({ postId: post.id, reason });
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                                                    >
                                                        <Flag className="w-4 h-4" />
                                                        Report Post
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Media */}
                                {post.media_urls.length > 0 && (
                                    <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
                                        <img
                                            src={post.media_urls[0]}
                                            alt="Post content"
                                            className={`w-full h-full object-cover ${post.is_nsfw && !user?.show_nsfw ? 'blur-2xl scale-110' : ''}`}
                                        />
                                        {post.is_nsfw && !user?.show_nsfw && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white z-10 pointer-events-none">
                                                <AlertTriangle className="w-12 h-12 text-red-500 mb-2 opacity-80 drop-shadow-lg" />
                                                <p className="font-bold tracking-wide drop-shadow-md">NSFW Content</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content & Actions */}
                                <div className="p-4">
                                    {post.caption && (
                                        <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.caption}</p>
                                    )}

                                    <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
                                        <button
                                            onClick={() => toggleLikeMutation.mutate(post.id)}
                                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                                            <span>{post.like_count ?? post._count?.likes ?? 0}</span>
                                        </button>
                                        <button
                                            onClick={() => setOpenComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${openComments[post.id] ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            <span>{post.comment_count ?? post._count?.comments ?? 0}</span>
                                        </button>
                                    </div>

                                    {openComments[post.id] && (
                                        <PostComments postId={post.id} />
                                    )}
                                </div>
                            </div>
                        ))}

                        {posts?.length === 0 && (
                            <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-dashed border-gray-800">
                                <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
