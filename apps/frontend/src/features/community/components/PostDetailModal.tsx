'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService, postKeys, userService, type Post } from '@/lib/api/services';
import { useAuth } from '@/features/auth';
import { 
    X, Heart, MessageSquare, Send, Loader2, MoreVertical, 
    Trash2, Flag, AlertTriangle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import PostComments from './PostComments'; // Adapted/Reused

import { motion, AnimatePresence } from 'framer-motion';
import { getStorageUrl } from '@/lib/utils/storage';

interface PostDetailModalProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function PostDetailModal({ postId, isOpen, onClose }: PostDetailModalProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Detect mobile for drag logic
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch Full Post Detail
    const { data: post, isLoading } = useQuery({
        queryKey: ['post-detail', postId],
        queryFn: async () => {
            // First check query cache
            const feedPosts = queryClient.getQueryData<Post[]>(['community-feed']);
            const foundInFeed = feedPosts?.find(p => p.id === postId);
            if (foundInFeed) return foundInFeed;

            // Fallback to Actual API Call
            return postService.getPostById(postId);
        },
        enabled: isOpen && !!postId
    });

    // Mutations
    const toggleLikeMutation = useMutation({
        mutationFn: () => postService.toggleLike(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            queryClient.invalidateQueries({ queryKey: ['post-detail', postId] });
        }
    });

    const addCommentMutation = useMutation({
        mutationFn: () => postService.addComment(postId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            setComment('');
        }
    });

    const deletePostMutation = useMutation({
        mutationFn: () => postService.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            onClose();
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete post');
        }
    });

    const followMutation = useMutation({
        mutationFn: (userId: string) => userService.followUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            queryClient.invalidateQueries({ queryKey: ['post-detail', postId] });
        }
    });

    const reportPostMutation = useMutation({
        mutationFn: (reason: string) => postService.reportPost(postId, reason),
        onSuccess: () => {
            alert('Report submitted successfully!');
            setShowMenu(false);
        }
    });

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !post) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-10">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/95 backdrop-blur-xl" 
                    onClick={onClose} 
                />
                
                {/* Close Button (Desktop Only) */}
                <button 
                    onClick={onClose}
                    className="hidden md:flex absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors z-[70]"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* Modal Container */}
                <motion.div 
                    initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
                    animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
                    exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-6xl h-full md:h-[90vh] bg-black md:border border-gray-800 md:rounded-3xl flex flex-col md:flex-row overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] z-[65]"
                >
                    
                    {/* Left: Media Column */}
                    <div className="relative flex-1 bg-black flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-800 overflow-hidden">
                        {post.media_urls.length > 0 && (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={getStorageUrl(post.media_urls[0])}
                                    alt="Post content"
                                    className={`max-w-full max-h-full object-contain ${post.is_nsfw && !user?.show_nsfw ? 'blur-3xl scale-125' : ''}`}
                                />
                                {post.is_nsfw && !user?.show_nsfw && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-6 text-center backdrop-blur-md">
                                        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4 opacity-50" />
                                        <h3 className="text-xl font-black mb-2 uppercase tracking-widest text-yellow-500">Sensitive Metadata</h3>
                                        <p className="text-sm text-gray-400 max-w-xs font-medium">Enable NSFW preview in your profile settings to view this work.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Mobile Close Handle Overlay (Top Left) */}
                        <button onClick={onClose} className="md:hidden absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/80 border border-white/10 z-20">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Right Column: Dynamic Draggable Sheet for Mobile / Sidebar for Desktop */}
                    <motion.div 
                        drag={isMobile ? "y" : false}
                        dragConstraints={{ top: 0, bottom: 500 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 300) onClose();
                        }}
                        className="w-full md:w-[450px] flex flex-col bg-[#0f0f0f] relative md:static rounded-t-[24px] md:rounded-none -mt-4 md:mt-0 z-10"
                    >
                        {/* Mobile Drag Handle */}
                        <div className="md:hidden w-full flex justify-center py-3 cursor-grab active:cursor-grabbing">
                            <div className="w-10 h-1 bg-gray-800 rounded-full" />
                        </div>

                        {/* Sticky Header */}
                        <div className="p-3 md:p-4 border-b border-gray-800 flex items-center gap-3">
                            <Link href={`/u/${post.user.username}`} onClick={onClose} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 overflow-hidden shrink-0 ring-2 ring-gray-900 group">
                                {post.user.avatar_url ? (
                                    <img src={getStorageUrl(post.user.avatar_url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 uppercase text-xs">
                                        {post.user.username[0]}
                                    </div>
                                )}
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Link href={`/u/${post.user.username}`} onClick={onClose} className="font-bold text-[13px] md:text-sm text-white hover:text-yellow-400 transition-colors truncate">
                                        {post.user.display_name || post.user.username}
                                    </Link>
                                    {(['ARTIST', 'PROVIDER'].includes(post.user.role)) && (
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                            post.user.role === 'ARTIST' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                            {post.user.role}
                                        </span>
                                    )}
                                    {user?.id !== post.user.id && (
                                        <button 
                                            onClick={() => followMutation.mutate(post.user.id)}
                                            className="text-[10px] font-bold text-yellow-400 hover:text-white transition-colors ml-1"
                                        >
                                            Follow
                                        </button>
                                    )}
                                </div>
                                <p className="text-[9px] font-bold text-gray-600 tracking-widest lowercase">@{post.user.username}</p>
                            </div>
                            <div className="relative">
                                <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl py-1 z-20">
                                        {(user?.role === 'ADMIN' || user?.id === post.user.id) && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this post?')) {
                                                        deletePostMutation.mutate();
                                                    }
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete Post
                                            </button>
                                        )}
                                        {user?.id !== post.user.id && (
                                            <button
                                                onClick={() => {
                                                    const reason = window.prompt('Please enter the reason for reporting:');
                                                    if (reason) {
                                                        reportPostMutation.mutate(reason);
                                                    }
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-300 hover:bg-white/5 transition-colors"
                                            >
                                                <Flag className="w-3.5 h-3.5" />
                                                Report Post
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
                            {/* Post Content Info */}
                            <div className="p-4 flex gap-3">
                                <Link href={`/u/${post.user.username}`} onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden shrink-0">
                                    <img src={getStorageUrl(post.user.avatar_url)} className="w-full h-full object-cover" />
                                </Link>
                                <div className="flex-1">
                                    <div className="text-[13px] md:text-sm text-white leading-relaxed">
                                        <Link href={`/u/${post.user.username}`} onClick={onClose} className="font-bold mr-2 hover:text-yellow-400 transition-colors">
                                        {post.user.username}
                                    </Link>
                                    {post.caption}
                                </div>
                                <p className="text-[9px] font-black text-gray-700 mt-2 tracking-widest">
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>

                        {/* Divider - Only visible on Desktop */}
                        <div className="hidden md:block mx-4 border-t border-gray-800/50" />
                        
                        {/* Desktop Exclusive: Interaction Row */}
                        <div className="hidden md:flex p-4 items-center gap-4">
                            <button onClick={() => toggleLikeMutation.mutate()} className={`transition-all hover:scale-110 active:scale-90 ${post.is_liked ? 'text-red-500' : 'text-gray-300'}`}>
                                <Heart className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} />
                            </button>
                            <button className="text-gray-300 hover:scale-110 active:scale-90 transition-all">
                                <MessageSquare className="w-6 h-6" />
                            </button>
                            <div className="ml-auto text-xs font-bold text-white">
                                {post.like_count || 0} likes
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="px-4 pb-20 md:pb-4">
                            <PostComments postId={postId} hideInput={isMobile} noMaxHeight={true} />
                        </div>
                    </div>

                        {/* Fixed Interaction Bar (Desktop Only) */}
                        <div className="hidden md:block p-4 border-t border-gray-800 space-y-3 bg-[#0f0f0f]">
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => toggleLikeMutation.mutate()}
                                    className={`transition-all hover:scale-110 active:scale-95 ${post.is_liked ? 'text-red-500' : 'text-white'}`}
                                >
                                    <Heart className={`w-7 h-7 ${post.is_liked ? 'fill-current' : ''}`} />
                                </button>
                                <button onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="text-white hover:text-yellow-400 transition-colors">
                                    <MessageSquare className="w-7 h-7" />
                                </button>
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">
                                    {(post.like_count ?? post._count?.likes ?? 0).toLocaleString()} likes
                                </p>
                            </div>
                        </div>

                        {/* Fixed Comment Input at bottom */}
                        <div className="p-3 md:p-4 border-t border-gray-800 bg-black pb-8 md:pb-4">
                            <div className="flex gap-3 relative">
                                <textarea
                                    placeholder="Add a comment..."
                                    className="w-full bg-transparent border-none text-white text-[13px] md:text-sm placeholder-gray-600 focus:ring-0 resize-none h-10 max-h-32 py-2 pr-12 scrollbar-hide"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                                            e.preventDefault();
                                            addCommentMutation.mutate();
                                        }
                                    }}
                                />
                                <button 
                                    onClick={() => comment.trim() && addCommentMutation.mutate()}
                                    disabled={!comment.trim() || addCommentMutation.isPending}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-400 font-bold text-[13px] md:text-sm disabled:opacity-30 disabled:hover:text-yellow-400 hover:text-yellow-300 transition-colors py-2 px-1"
                                >
                                    {addCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
