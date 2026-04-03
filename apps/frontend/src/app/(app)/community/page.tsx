'use client';

import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService, userService } from '@/lib/api/services';
import { getStorageUrl } from '@/lib/utils/storage';
import { useAuth } from '@/features/auth';
import { 
    Loader2, Heart, MessageSquare, Send, Image as ImageIcon, 
    AlertTriangle, MoreVertical, Trash2, Flag, Sparkles, Users, X,
    Mail, ShieldAlert, EyeOff, Scale, HelpCircle,
    Plus, PlusCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import UserSearch from '@/features/community/components/UserSearch';
import PostDetailModal from '@/features/community/components/PostDetailModal';

export default function CommunityPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'explore' | 'following'>('all');

    // New Post State
    const [caption, setCaption] = useState('');
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState<{ id: string; name: string; progress: number; }[]>([]);
    const [isNsfw, setIsNsfw] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Menu & Report UI State
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [reportingPost, setReportingPost] = useState<any | null>(null);

    const REPORT_REASONS = [
        { id: 'spam', label: 'Spam or misleading', icon: <Mail className="w-5 h-5 text-blue-400" /> },
        { id: 'harassment', label: 'Harassment or hate speech', icon: <ShieldAlert className="w-5 h-5 text-red-400" /> },
        { id: 'inappropriate', label: 'Inappropriate content', icon: <EyeOff className="w-5 h-5 text-yellow-400" /> },
        { id: 'intellectual', label: 'Intellectual property violation', icon: <Scale className="w-5 h-5 text-purple-400" /> },
        { id: 'other', label: 'Other issue', icon: <HelpCircle className="w-5 h-5 text-gray-400" /> },
    ];

    const { data: realPosts, isLoading } = useQuery({
        queryKey: ['community-feed'],
        queryFn: () => postService.getFeed()
    });

    // Fetch real artists for featured section
    const { data: realArtists, isLoading: isCreatorsLoading } = useQuery({
        queryKey: ['community-artists'],
        queryFn: () => userService.searchUsers('', 'ARTIST')
    });

    const posts = useMemo(() => realPosts || [], [realPosts]);

    // Filter Logic (Algorithm)
    const filteredPosts = useMemo(() => {
        if (activeTab === 'all') return posts;
        if (activeTab === 'explore') {
            // "Explore" algorithm Show posts with likes > 50 or recently created high-engagement ones
            return [...posts].sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
        }
        if (activeTab === 'following') {
            // "Following" algorithm In mock mode, show posts from specific users
            return posts.filter(p => ['GhostMesh', 'NeonForge', 'CyberVoxel'].includes(p.user.username));
        }
        return posts;
    }, [activeTab, posts]);

    const followMutation = useMutation({
        mutationFn: (userId: string) => userService.followUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            queryClient.invalidateQueries({ queryKey: ['post-detail'] });
        }
    });

    const unfollowMutation = useMutation({
        mutationFn: (userId: string) => userService.unfollowUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            queryClient.invalidateQueries({ queryKey: ['post-detail'] });
        }
    });

    const createPostMutation = useMutation({
        mutationFn: () => postService.createPost({
            caption,
            media_urls: mediaUrls,
            is_nsfw: isNsfw
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            setCaption('');
            setMediaUrls([]);
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
            queryClient.invalidateQueries({ queryKey: ['post-detail'] });
        }
    });

    const reportMutation = useMutation({
        mutationFn: ({ postId, reason }: { postId: string; reason: string }) => postService.reportPost(postId, reason),
        onSuccess: () => {
            alert('Report submitted successfully. Thank you for keeping 3Dex safe!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to submit report');
        }
    });

    const deletePostMutation = useMutation({
        mutationFn: (postId: string) => postService.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-feed'] });
            setOpenMenuId(null);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete post');
        }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (mediaUrls.length + files.length > 8) {
            alert('You can only upload up to 8 images.');
            return;
        }

        const newUploadingFiles = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            progress: 0
        }));

        setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const uploadId = newUploadingFiles[i].id;

            try {
                // 1. Get presigned URL
                const { url, key } = await postService.getUploadUrl(file.name, file.type);

                // 2. PUT file to URL (with progress)
                await postService.uploadToPresignedUrl(url, file, (progress: number) => {
                    setUploadingFiles(prev => prev.map(f => 
                        f.id === uploadId ? { ...f, progress } : f
                    ));
                });

                // 3. Add to mediaUrls
                setMediaUrls(prev => [...prev, key]);
                
                // 4. Remove from uploading list
                setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
            } catch (error) {
                console.error('Upload failed:', error);
                alert(`Failed to upload ${file.name}`);
                setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
            }
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeMedia = (index: number) => {
        setMediaUrls(prev => prev.filter((_, i) => i !== index));
    };

    const canPost = user?.role === 'ARTIST' || user?.role === 'PROVIDER';

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-0 pb-20 px-4">
            {/* Discovery Hub Layout Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* --- Left Column: Feed & Highlights (8/12) --- */}
                <div className="lg:col-span-8 space-y-6 pt-6">
                    
                    {/* Header Section (Mobile Optimized) */}
                    <div className="lg:hidden text-center mb-6">
                         <h1 className="text-2xl font-black text-white tracking-tight">Community Feed</h1>
                         <p className="text-gray-500 text-xs mt-1">Discover the next generation of 3D creators.</p>
                         <div className="mt-4">
                            <UserSearch />
                         </div>
                    </div>

                    {/* Featured Creators Carousel */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                             <h1 className="text-[10px] font-bold text-gray-500 tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-yellow-500" /> Discover Artists
                             </h1>
                        </div>
        
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x no-scrollbar">
                            {isCreatorsLoading ? (
                                // Creators Skeleton
                                [...Array(8)].map((_, i) => (
                                    <div key={i} className="flex-shrink-0 animate-pulse flex flex-col items-center gap-2 w-20">
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-800/50" />
                                        <div className="w-12 h-2 bg-gray-800/50 rounded" />
                                    </div>
                                ))
                            ) : realArtists && realArtists.length > 0 ? (
                                realArtists.map(creator => (
                                    <div key={creator.id} className="flex-shrink-0 group flex flex-col items-center gap-2 snap-center w-20 transition-all active:scale-95">
                                        <Link 
                                            href={`/u/${creator.username}`}
                                            className="relative"
                                        >
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-yellow-400/20 to-amber-600/20 p-[2px] shadow-lg group-hover:from-yellow-400 group-hover:to-amber-600 transition-all duration-500">
                                                <div className="w-full h-full rounded-full bg-black p-[2px]">
                                                    {creator.avatar_url ? (
                                                        <img 
                                                            src={getStorageUrl(creator.avatar_url)} 
                                                            className="w-full h-full rounded-full object-cover filter brightness-90 group-hover:brightness-110 transition-all" 
                                                            alt={creator.username}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-gray-600 font-bold uppercase text-[10px]">
                                                            {creator.username?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors truncate w-full text-center">
                                            {creator.username}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-gray-600 font-medium px-2 py-4">No artists featured yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Feed Tabs & Action Bar */}
                    <div className="flex items-center justify-between border-b border-gray-800/50 pb-1">
                        <div className="flex gap-6">
                            {['all', 'explore', 'following'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`relative pb-3 text-sm font-bold capitalize transition-colors ${
                                        activeTab === tab ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'
                                    }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Create Post Widget */}
                    {canPost && (
                        <div className="bg-[#111]/30 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl -mr-16 -mt-16" />
                            <div className="flex gap-4 relative">
                                <div className="w-11 h-11 rounded-full bg-gray-800 flex-shrink-0 ring-2 ring-gray-900 overflow-hidden">
                                    {user?.avatar_url ? (
                                        <img src={getStorageUrl(user.avatar_url)} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 uppercase text-xs">
                                            {user?.username?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    
                                    {/* Media Preview Grid */}
                                    {(mediaUrls.length > 0 || uploadingFiles.length > 0) && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {mediaUrls.map((url, idx) => (
                                                <div key={idx} className="relative rounded-xl overflow-hidden aspect-square bg-black border border-gray-800 shadow-inner group/preview">
                                                    <img src={getStorageUrl(url)} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => removeMedia(idx)}
                                                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-all shadow-lg scale-90 group-hover/preview:scale-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {uploadingFiles.map((file) => (
                                                <div key={file.id} className="relative rounded-xl overflow-hidden aspect-square bg-gray-800/40 backdrop-blur-sm border border-gray-700 flex flex-col items-center justify-center p-4">

                                                    <Loader2 className="w-6 h-6 text-gray-500 animate-spin mb-2" />
                                                    <div className="w-full bg-gray-700/50 h-1.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="bg-yellow-400 h-full transition-all duration-300" 
                                                            style={{ width: `${file.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 mt-2 truncate w-full text-center">{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <textarea
                                        placeholder="Share your latest project..."
                                        className="w-full outline-none text-white placeholder-gray-600 resize-none h-20 text-sm font-medium"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                    />
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-900/40">
                                        <div className="flex gap-4 items-center">
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleFileUpload} 
                                                multiple 
                                                accept="image/*" 
                                                className="hidden" 
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-gray-400 hover:text-yellow-400 p-2 rounded-xl hover:bg-yellow-400/5 transition-all flex items-center gap-2 group/btn"
                                            >
                                                <ImageIcon className="w-5 h-5" />
                                                <span className="text-xs font-bold hidden sm:inline">Add gallery</span>
                                            </button>
                                            <label className="flex items-center gap-2 cursor-pointer group/nsfw">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isNsfw} 
                                                    onChange={(e) => setIsNsfw(e.target.checked)} 
                                                    className="w-4 h-4 rounded-lg bg-gray-800 border-gray-700 text-red-500 focus:ring-red-500/20 transition-colors" 
                                                />
                                                <span className="text-[10px] font-bold text-gray-500 group-hover/nsfw:text-red-400 transition-colors tracking-widest uppercase">NSFW</span>
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => createPostMutation.mutate()}
                                            disabled={!caption.trim() || mediaUrls.length === 0 || createPostMutation.isPending || uploadingFiles.length > 0}
                                            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-20 text-black font-black px-6 py-2 rounded-xl transition-all active:scale-[0.95] flex items-center gap-2 shadow-lg shadow-yellow-400/10"
                                        >
                                            {createPostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            <span className="text-sm">Post</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Post Feed */}
                    <div className="space-y-6">
                        {isLoading ? (
                            // Feed Skeleton
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="bg-[#0f0f0f] border border-gray-800 rounded-[32px] overflow-hidden animate-pulse">
                                    <div className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-800" />
                                        <div className="space-y-2">
                                            <div className="w-24 h-2 bg-gray-800 rounded" />
                                            <div className="w-16 h-1.5 bg-gray-900 rounded" />
                                        </div>
                                    </div>
                                    <div className="aspect-video bg-gray-900" />
                                    <div className="p-6 space-y-3">
                                        <div className="w-full h-2 bg-gray-800 rounded" />
                                        <div className="w-2/3 h-2 bg-gray-800 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : filteredPosts && filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
                                <div key={post.id} className="bg-[#0f0f0f] border border-gray-800 rounded-[32px] overflow-hidden group shadow-2xl transition-all hover:border-gray-700/50">
                                    {/* Post Header */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/u/${post.user.username}`} className="relative group/avatar">
                                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-2 ring-transparent group-hover/avatar:ring-yellow-400 transition-all duration-300 flex items-center justify-center">
                                                    {post.user.avatar_url ? (
                                                        <img src={getStorageUrl(post.user.avatar_url)} className="w-full h-full object-cover" alt={post.user.username} />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center font-bold text-gray-600 uppercase text-xs">
                                                            {post.user.username?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                            <div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <Link href={`/u/${post.user.username}`} className="text-sm font-black text-white hover:text-yellow-400 transition-colors">
                                                        {post.user.display_name || post.user.username}
                                                    </Link>
                                                    {user?.id !== post.user.id && (
                                                        <>
                                                            <span className="w-0.5 h-0.5 rounded-full bg-gray-700" />
                                                            <button 
                                                                onClick={() => post.user.is_followed ? unfollowMutation.mutate(post.user.id) : followMutation.mutate(post.user.id)}
                                                                className={`text-[10px] sm:text-[11px] cursor-pointer font-bold transition-colors ${
                                                                    post.user.is_followed ? 'text-gray-500 hover:text-white' : 'text-yellow-400 hover:text-white'
                                                                }`}
                                                            >
                                                                {post.user.is_followed ? 'Followed' : 'Follow'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                                        post.user.role === 'ARTIST' ? 'bg-purple-500/10 text-purple-400' :
                                                        post.user.role === 'PROVIDER' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-600'
                                                    }`}>
                                                        {post.user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button className={`p-1.5 rounded-lg transition-all ${openMenuId === post.id ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-white hover:bg-gray-800/50'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === post.id ? null : post.id);
                                                }}
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {openMenuId === post.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-gray-800 rounded-2xl shadow-2xl py-2 z-30 animate-in fade-in zoom-in duration-200">
                                                    {(user?.role === 'ADMIN' || user?.id === post.user.id) && (
                                                        <button 
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this post permanently?')) {
                                                                    deletePostMutation.mutate(post.id);
                                                                }
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-400/10 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete post
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            setReportingPost(post);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-300 hover:bg-white/5 transition-colors"
                                                    >
                                                        <Flag className="w-3.5 h-3.5" />
                                                        Report post
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Main Post Image */}
                                    {post.media_urls.length > 0 && (
                                        <div 
                                            onClick={() => setSelectedPostId(post.id)}
                                            className="relative w-full aspect-[4/5] sm:aspect-video overflow-hidden bg-[#111] cursor-pointer ring-1 ring-gray-800/20 group/img shadow-inner"
                                        >
                                            <img 
                                                src={getStorageUrl(post.media_urls[0])} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" 
                                                alt="Post media" 
                                            />
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2 text-white">
                                                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                                        <span className="font-black">{post.like_count || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-white">
                                                        <MessageSquare className="w-5 h-5 fill-white" />
                                                        <span className="font-black">{post.comment_count || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Compact Actions bar */}
                                    <div className="px-6 py-4 space-y-4">
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => {
                                                    if (!user) return;
                                                    toggleLikeMutation.mutate(post.id);
                                                }}
                                                className={`transition-all hover:scale-125 active:scale-90 flex items-center gap-2 ${post.is_liked ? 'text-red-500' : 'text-gray-300 hover:text-white'}`}
                                            >
                                                <Heart className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} />
                                                <span className="text-xs font-black">{post.like_count || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => setSelectedPostId(post.id)}
                                                className="text-gray-300 hover:text-white hover:scale-125 active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                <MessageSquare className="w-6 h-6" />
                                                <span className="text-xs font-black">{post.comment_count || 0}</span>
                                            </button>
                                        </div>

                                        {post.caption && (
                                            <p className="text-[13px] text-gray-300 leading-relaxed font-medium">
                                                <span className="font-black mr-2 text-white">{post.user.username}</span>
                                                {post.caption}
                                            </p>
                                        )}
                                        
                                        <div className="pt-2">
                                            <p className="text-[10px] font-black text-gray-700 tracking-wider">
                                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Empty State
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-[#0a0a0a] border-2 border-dashed border-gray-900 rounded-[40px]">
                                <div className="w-20 h-20  rounded-3xl flex items-center justify-center mb-2">
                                    <Sparkles className="w-10 h-10 text-gray-700" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white">No posts yet</h4>
                                    <p className="text-sm text-gray-600 max-w-xs mx-auto mt-2 leading-relaxed">
                                        Be the first to share your work with the community and get discovered!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Right Column: Sidebar Discovery (4/12) --- */}
                <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-8 h-fit pt-6">
                    
                    {/* Page Branding */}
                    <div className="px-2">
                        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Discovery</h1>
                        <p className="text-gray-500 text-xs leading-snug">Inspire and connect with the best creators.</p>
                    </div>

                    {/* Integrated Search Module */}
                    <div className="bg-[#111]/40 border border-gray-800/50 rounded-3xl p-6 shadow-2xl relative group transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 blur-3xl -mr-12 -mt-12 group-hover:bg-yellow-400/10 transition-colors duration-500" />
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users className="w-3 h-3" /> Quick discovery
                        </h3>
                        <UserSearch />
                    </div>

                    {/* Community Guidelines (Useful Content) */}
                    <div className="bg-[#0f0f0f] border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-600 to-yellow-400 opacity-20" />
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" /> Community Rules
                        </h3>
                        <div className="space-y-4">
                            {[
                                { text: 'Be respectful to other creators', icon: '✨' },
                                { text: 'Cite other artists in your remixes', icon: '📝' },
                                { text: 'Mark explicit (NSFW) content correctly', icon: '🔞' },
                                { text: 'No spam or misleading subjects', icon: '🚫' }
                            ].map((rule, idx) => (
                                <div key={idx} className="flex items-start gap-3 group/rule">
                                    <span className="text-sm grayscale group-hover/rule:grayscale-0 transition-all">{rule.icon}</span>
                                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed group-hover/rule:text-gray-200 transition-colors">
                                        {rule.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5">
                            <Link href="/community-rules" className="text-[10px] font-black text-yellow-400 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest">
                                Read Full Guidelines <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>


                    {/* Footer Links */}
                    <div className="px-6 flex flex-wrap gap-x-4 gap-y-2 opacity-30 text-[8px] font-bold text-gray-500 uppercase tracking-widest justify-center">
                        <Link href="/safety" className="hover:text-white transition-colors">Safety</Link>
                        <Link href="/creators" className="hover:text-white transition-colors">Creators</Link>
                        <Link href="/community-rules" className="hover:text-white transition-colors">Rules</Link>
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
                        <p className="mt-2 w-full text-center">© 2026 3Dex Community</p>
                    </div>
                </div>
            </div>

            {/* Premium Report Modal */}
            {reportingPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-[#0f0f0f] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-white leading-tight">Report Post</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Select a reason for reporting</p>
                            </div>
                            <button 
                                onClick={() => setReportingPost(null)}
                                className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2">
                            {REPORT_REASONS.map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => {
                                        reportMutation.mutate({ postId: reportingPost.id, reason: reason.label });
                                        setReportingPost(null);
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/5 transition-all group text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                        {reason.icon}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-300 group-hover:text-white transition-colors">{reason.label}</p>
                                        <p className="text-[10px] text-gray-600 font-medium">Flag this content for review</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-900/20">
                            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                                Our community rules help keep 3Dex safe. <br />
                                <Link href="/community-rules" className="text-yellow-400 hover:underline font-bold transition-all">Read more about our rules.</Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Instagram-Style Modal */}
            <PostDetailModal 
                isOpen={!!selectedPostId} 
                postId={selectedPostId || ''} 
                onClose={() => setSelectedPostId(null)} 
            />
        </div>
    );
}

