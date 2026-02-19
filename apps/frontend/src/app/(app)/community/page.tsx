'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import UserAvatar from '@/components/common/UserAvatar';
import { Loader2, Heart, MessageSquare, Send, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Post {
    id: string;
    caption: string;
    media_urls: string[];
    created_at: string;
    user: {
        id: string;
        username: string;
        display_name?: string;
        avatar_url?: string;
        role: 'ARTIST' | 'PROVIDER' | 'ADMIN' | 'CUSTOMER';
    };
    _count: {
        likes: number;
        comments: number;
    };
    is_liked: boolean;
}


export default function CommunityPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isPosting, setIsPosting] = useState(false);

    // New Post State
    const [caption, setCaption] = useState('');
    const [mediaUrl, setMediaUrl] = useState(''); // Simplified for now

    const { data: posts, isLoading } = useQuery<Post[]>({
        queryKey: ['community-feed'],
        queryFn: async () => {
            const res = await api.get('/posts/feed');
            return res.data;
        }
    });

    const createPostMutation = useMutation({
        mutationFn: async () => {
            await api.post('/posts', {
                caption,
                media_urls: [mediaUrl]
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            setCaption('');
            setMediaUrl('');
            setIsPosting(false);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to post');
        }
    });

    const toggleLikeMutation = useMutation({
        mutationFn: async (postId: string) => {
            await api.post(`/posts/${postId}/like`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
        }
    });

    const canPost = user?.role === 'ARTIST' || user?.role === 'PROVIDER' || user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Community Feed</h1>
                        <p className="text-gray-400">See what artists and providers are working on.</p>
                    </div>
                </div>

                {/* Create Post Widget */}
                {canPost && (
                    <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4">
                        <div className="flex gap-4">
                            <UserAvatar user={user} size="md" />
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
                                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                                    <div className="flex gap-2">
                                        <button
                                            // Quick hack for demo: prompt for URL
                                            onClick={() => {
                                                const url = prompt('Enter image URL:');
                                                if (url) setMediaUrl(url);
                                            }}
                                            className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-400/10 transition-colors"
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => createPostMutation.mutate()}
                                        disabled={!caption.trim() || !mediaUrl || createPostMutation.isPending}
                                        className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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
                            <div key={post.id} className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
                                {/* Post Header */}
                                <div className="p-4 flex items-center gap-3">
                                    <UserAvatar user={post.user} size="md" linkToProfile={true} />
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
                                </div>

                                {/* Media */}
                                {post.media_urls.length > 0 && (
                                    <div className="w-full aspect-video bg-gray-900">
                                        <img src={post.media_urls[0]} alt="Post content" className="w-full h-full object-cover" />
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
                                            <span>{post._count.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                            <MessageSquare className="w-5 h-5" />
                                            <span>{post._count.comments}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
