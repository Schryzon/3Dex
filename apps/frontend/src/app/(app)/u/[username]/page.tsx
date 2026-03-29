'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@/types';
import UserAvatar from '@/components/common/UserAvatar';
import ModelGrid from '@/features/model/components/ModelGrid';
import {
    MapPin,
    Calendar,
    Link as LinkIcon,
    Twitter,
    Instagram,
    Printer,
    Share2,
    UserPlus,
    UserCheck,
    Users,
    ChevronLeft,
    Camera,
    Loader2,
    AlertTriangle,
    X,
    Globe,
    Lock,
    Package,
    FolderOpen,
    Pencil,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ImageCropModal from '@/components/common/ImageCropModal';
import { useRouter } from 'next/navigation';
import { MINIO_BASE_URL } from '@/lib/constants/endpoints';
import Link from 'next/link';
import { useAuth } from '@/features/auth';


export default function PublicProfilePage() {
    const { username } = useParams();
    const router = useRouter();
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [cropModal, setCropModal] = useState<{
        isOpen: boolean;
        image: string;
        aspect: number;
    }>({ isOpen: false, image: '', aspect: 16 / 5 });
    const [activeTab, setActiveTab] = useState<'models' | 'posts' | 'collections'>('models');

    const { data: user, isLoading, error, refetch: refetchUser } = useQuery({
        queryKey: ['user', username],
        queryFn: async () => {
            const res = await api.get<User>(`/users/${username}`);
            return res.data;
        },
        enabled: !!username
    });

    const { user: currentUser } = useAuth();

    // Check follow status
    const { data: followStatus, refetch: refetchFollowStatus } = useQuery({
        queryKey: ['follow-status', user?.id],
        queryFn: async () => {
            if (!user?.id) return { is_following: false };
            const res = await api.get<{ is_following: boolean }>(`/users/${user.id}/follow-status`);
            return res.data;
        },
        enabled: !!user?.id && !!currentUser
    });

    // Follow mutation
    const followMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/users/${user?.id}/follow`);
        },
        onSuccess: () => {
            refetchFollowStatus();
        }
    });

    // Unfollow mutation
    const unfollowMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/users/${user?.id}/unfollow`);
        },
        onSuccess: () => {
            refetchFollowStatus();
        }
    });

    const handleFollowToggle = () => {
        if (!currentUser) return;

        if (followStatus?.is_following) {
            unfollowMutation.mutate();
        } else {
            followMutation.mutate();
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setCropModal({
                isOpen: true,
                image: reader.result as string,
                aspect: 16 / 5,
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropModal(prev => ({ ...prev, isOpen: false }));
        setIsUploadingBanner(true);
        setUploadError('');
        try {
            const fileName = `banner_${currentUser?.id}_${Date.now()}.jpg`;
            const { data: { url, key } } = await api.post('/storage/upload-url', {
                filename: fileName,
                content_type: 'image/jpeg',
            });

            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: croppedBlob,
                headers: { 'Content-Type': 'image/jpeg' },
            });

            if (!uploadRes.ok) {
                throw new Error(`Upload failed with status: ${uploadRes.status}`);
            }

            await api.patch('/users/profile', { banner_url: key });
            await refetchUser();
        } catch (error: any) {
            console.error('Failed to upload banner:', error);
            setUploadError(error.message || 'Failed to upload banner. Please try again.');
        } finally {
            setIsUploadingBanner(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-20 flex justify-center">
                <div className="animate-spin w-8 h-8 border-t-2 border-yellow-400 rounded-full" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-20 text-center">
                <h1 className="text-2xl text-white font-bold">User not found</h1>
                <Link href="/" className="text-yellow-400 hover:underline mt-4 block">Return Home</Link>
            </div>
        );
    }

    const isOwner = currentUser?.id === user.id;
    const bannerSrc = user.banner_url
        ? user.banner_url.startsWith('http')
            ? user.banner_url
            : `${MINIO_BASE_URL}/3dex-models/${user.banner_url}`
        : null;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hidden files & modals */}
            <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
            />
            {cropModal.isOpen && (
                <ImageCropModal
                    image={cropModal.image}
                    aspect={cropModal.aspect}
                    title="Crop Banner"
                    onClose={() => setCropModal(prev => ({ ...prev, isOpen: false }))}
                    onCropComplete={handleCropComplete}
                />
            )}

            {/* Header / Navigation */}
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors group text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <Breadcrumbs
                        items={[
                            { label: 'Users', href: '/catalog' },
                            { label: `@${username}`, active: true }
                        ]}
                    />
                </div>
            </div>

            {/* Banner / Cover Image */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-800 relative group">
                {/* Image layer with overflow-hidden */}
                <div className="absolute inset-0 overflow-hidden">
                    {bannerSrc ? (
                        <img
                            src={bannerSrc}
                            alt="Profile banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-black/20" />
                    )}
                </div>

                {/* Button layer outside overflow-hidden */}
                {/* Change Banner Button */}
                {isOwner && (
                    <>
                        {/* Desktop Version */}
                        <button
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={isUploadingBanner}
                            className="hidden md:flex absolute bottom-4 right-4 z-10 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 text-white text-sm font-bold rounded-xl items-center gap-2 hover:bg-black/80 transition-opacity duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
                        >
                            {isUploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            <span>{isUploadingBanner ? 'Uploading...' : 'Change Banner'}</span>
                        </button>

                        {/* Mobile Version: Pencil icon on the left */}
                        <button
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={isUploadingBanner}
                            className="md:hidden absolute bottom-4 left-4 z-20 p-2.5 bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-xl flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-lg active:scale-95"
                        >
                            {isUploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                        </button>
                    </>
                )}
                
                {/* Error Banner */}
                {uploadError && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-4 h-4" />
                        {uploadError}
                        <button onClick={() => setUploadError('')} className="ml-2 hover:opacity-75">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Profile Header */}
                <div className="relative -mt-20 mb-8 flex flex-col md:flex-row items-end md:items-end gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0a0a0a] bg-gray-800 overflow-hidden">
                            <UserAvatar user={user} className="w-full h-full text-4xl" />
                        </div>
                        {user.role === 'PROVIDER' && (
                            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-[#0a0a0a]" title="Verified Provider">
                                <Printer className="w-4 h-4" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pb-2">
                        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{user.display_name || user.username}</h1>
                        <p className="text-gray-300 font-medium">@{user.username}</p>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                            {user.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span><strong className="text-white">{user._count?.followers ?? 0}</strong> Followers</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span><strong className="text-white">{user._count?.following ?? 0}</strong> Following</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                            {user.website && (
                                <Link href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-yellow-400 hover:underline">
                                    <LinkIcon className="w-4 h-4" />
                                    <span>Website</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pb-2 w-full md:w-auto">
                        {currentUser && !isOwner && (
                            <button
                                onClick={handleFollowToggle}
                                disabled={followMutation.isPending || unfollowMutation.isPending}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-2.5 text-sm md:text-base font-bold rounded-xl transition-all ${followStatus?.is_following
                                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                                    : 'bg-yellow-400 text-black hover:bg-yellow-300'
                                    }`}
                            >
                                {followMutation.isPending || unfollowMutation.isPending ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                                ) : followStatus?.is_following ? (
                                    <>
                                        <UserCheck className="w-4 h-4" />
                                        Following
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Follow
                                    </>
                                )}
                            </button>
                        )}
                        {user.role === 'PROVIDER' && (
                            <Link
                                href={`/print-services/${user.username}/order`}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm md:text-base font-bold rounded-xl transition-all"
                            >
                                <Printer className="w-4 h-4" />
                                Request Print
                            </Link>
                        )}
                        <button className="p-2 md:p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-700 transition-all shrink-0">
                            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>

                {/* Bio & Socials */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2">
                        {user.bio && (
                            <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">{user.bio}</p>
                        )}

                        {/* Tabs */}
                        <div className="border-b border-gray-800 mb-6">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setActiveTab('models')}
                                    className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'models' ? 'border-yellow-400 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                >
                                    Models
                                </button>
                                <button
                                    onClick={() => setActiveTab('collections')}
                                    className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'collections' ? 'border-yellow-400 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                >
                                    Collections
                                </button>
                            </div>
                        </div>

                        {activeTab === 'models' && (
                            <ModelGrid artistId={user.id} />
                        )}

                        {activeTab === 'collections' && (
                            <PublicCollectionsTab userId={user.id} />
                        )}
                    </div>

                    {/* Sidebar Right */}
                    <div className="hidden lg:block space-y-6">
                        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6">
                            <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest text-gray-500">Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Rating</span>
                                    <span className="text-white font-bold flex items-center gap-1">
                                        ⭐ {(user.rating ?? 0).toFixed(1)} <span className="text-gray-500 font-normal">({user.review_count ?? 0})</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Member since</span>
                                    <span className="text-white">{new Date(user.created_at).getFullYear()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Socials moved to sidebar */}
                        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6">
                            <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest text-gray-500">Socials</h3>
                            <div className="flex flex-wrap gap-3">
                                {user.social_twitter && (
                                    <Link href={`https://twitter.com/${user.social_twitter}`} target="_blank" className="p-3 bg-gray-800 rounded-xl text-blue-400 hover:bg-gray-700 transition-colors">
                                        <Twitter className="w-5 h-5" />
                                    </Link>
                                )}
                                {user.social_instagram && (
                                    <Link href={`https://instagram.com/${user.social_instagram}`} target="_blank" className="p-3 bg-gray-800 rounded-xl text-pink-500 hover:bg-gray-700 transition-colors">
                                        <Instagram className="w-5 h-5" />
                                    </Link>
                                )}
                                {user.website && (
                                    <Link href={user.website} target="_blank" className="p-3 bg-gray-800 rounded-xl text-yellow-400 hover:bg-gray-700 transition-colors">
                                        <LinkIcon className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PublicCollectionsTab({ userId }: { userId: string }) {
    const { data: collections, isLoading } = useQuery({
        queryKey: ['public-collections', userId],
        queryFn: async () => {
            const res = await api.get<{ data: any[] }>(`/collections/user/${userId}`);
            return res.data.data;
        },
        enabled: !!userId
    });

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-yellow-400 animate-spin" /></div>;

    if (!collections || collections.length === 0) {
        return (
            <div className="text-center py-20 bg-[#111111]/20 rounded-[2.5rem] border border-gray-800/40 border-dashed">
                <FolderOpen className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No public collections yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8">
            {collections.map((collection: any) => {
                const items = collection.items || [];
                const hasItems = items.length > 0;

                return (
                    <Link key={collection.id} href={`/collections/${collection.id}`} className="group block">
                        <div className="aspect-[4/3] w-full bg-gray-900/40 relative overflow-hidden rounded-[2.2rem] ring-1 ring-white/5 group-hover:ring-yellow-400/30 transition-all duration-500">
                            <div className="w-full h-full flex gap-1 p-1">
                                {hasItems ? (
                                    <>
                                        {/* Main Image */}
                                        <div className="flex-[2] h-full rounded-2xl overflow-hidden bg-gray-800/20">
                                            <img
                                                src={items[0]?.model?.preview_url ? (items[0].model.preview_url.startsWith('http') ? items[0].model.preview_url : `${MINIO_BASE_URL}/3dex-models/${items[0].model.preview_url}`) : ''}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                        {/* Side Previews */}
                                        <div className="flex-1 flex flex-col gap-1">
                                            <div className="flex-1 rounded-xl overflow-hidden bg-gray-800/20">
                                                {items[1] && (
                                                    <img
                                                        src={items[1]?.model?.preview_url ? (items[1].model.preview_url.startsWith('http') ? items[1].model.preview_url : `${MINIO_BASE_URL}/3dex-models/${items[1].model.preview_url}`) : ''}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 rounded-xl overflow-hidden bg-gray-800/20 flex items-center justify-center">
                                                {items[2] ? (
                                                    <img
                                                        src={items[2]?.model?.preview_url ? (items[2].model.preview_url.startsWith('http') ? items[2].model.preview_url : `${MINIO_BASE_URL}/3dex-models/${items[2].model.preview_url}`) : ''}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center">
                                                        <FolderOpen className="w-4 h-4 text-white/10" />
                                                    </div>
                                                )}
                                            </div>
                                        </div >
                                    </>
                                ) : (
                                    /* Empty State Visual */
                                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                                        <FolderOpen className="absolute -right-6 -bottom-6 w-32 h-32 text-white/[0.03] -rotate-12" />
                                        <div className="w-14 h-14 bg-gray-800/40 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all duration-500 shadow-inner group-hover:rotate-6">
                                            <FolderOpen className="w-6 h-6" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details Info */}
                        <div className="mt-4 px-2">
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                                <h3 className="font-bold text-white text-sm md:text-base truncate group-hover:text-yellow-400 transition-colors">
                                    {collection.name}
                                </h3>
                                <span className={`shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
                                    <Globe className="w-2.5 h-2.5" />
                                    Public
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest opacity-60">
                                <Package className="w-3.5 h-3.5" />
                                {collection._count?.items ?? 0} Assets
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}