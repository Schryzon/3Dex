'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import {
    FolderOpen,
    Bookmark,
    ShoppingCart,
    Sparkles,
    CheckCircle,
    XCircle,
    Upload,
    BarChart3,
    Settings,
    Camera,
    X,
    ChevronRight,
    Bell,
    ShieldCheck,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Printer,
    Box,
    Settings2,
    Globe,
    Trash2,
    Twitter,
    Instagram,
    Github,
    ExternalLink,
    Download
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UserAvatar from '@/components/common/UserAvatar';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ServiceTab from '@/components/profile/ServiceTab';
import JobsTab from '@/components/profile/JobsTab';
import { useProducts } from '@/lib/hooks/useProducts';
import { api } from '@/lib/api';

import ModelGrid from '@/components/model/ModelGrid';

function UploadsTab({ userId }: { userId?: string }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">My Assets</h3>
                <Link href="/upload" className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-all">
                    <Upload className="w-4 h-4" />
                    Upload New
                </Link>
            </div>
            <ModelGrid artistId={userId} showUpload={true} />
        </div>
    );
}


type TabType = 'profile' | 'settings' | 'collections' | 'bookmarks' | 'notifications' | 'uploads' | 'analytics' | 'billing' | 'shipping' | 'service' | 'jobs' | 'workshop';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const searchParams = useSearchParams();
    const [upgrading, setUpgrading] = useState(false);
    const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        displayName: user?.display_name || '',
        bio: user?.bio || '',
        location: user?.location || '',
        address1: '',
        address2: '',
        address3: '',
        receiverName: '',
        phoneNumber: '',
        postcode: '',
        detailedAddress: '',
        courierPreference: 'JNE',
        ecoPackaging: true,
        website: user?.website || '',
        skills: [] as string[],
        socialLinks: {
            twitter: user?.social_twitter || '',
            instagram: user?.social_instagram || '',
            artstation: user?.social_artstation || '',
            behance: user?.social_behance || ''
        },
    });
    const [newSkill, setNewSkill] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const payload = {
                username: formData.username,
                display_name: formData.displayName,
                bio: formData.bio,
                location: formData.location,
                // Simplify social links flattened
                social_twitter: formData.socialLinks.twitter,
                social_instagram: formData.socialLinks.instagram,
                social_artstation: formData.socialLinks.artstation,
                social_behance: formData.socialLinks.behance,
            };

            const res = await api.patch('/users/profile', payload);
            setUser(res.data);
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const tabParam = searchParams.get('tab') as TabType | null;
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const handleUpgradeToArtist = async () => {
        setUpgrading(true);
        setUpgradeStatus('idle');

        try {
            await api.post('/users/apply-role', { role: 'ARTIST' });
            // Refresh user or show success
            setUpgradeStatus('success');
            alert('Application submitted!');
        } catch (error) {
            setUpgradeStatus('error');
            alert('Application failed');
        } finally {
            setUpgrading(false);
        }
    };

    const handleUpgradeToProvider = async () => {
        if (!confirm('Apply to become a printing provider?')) return;
        setUpgrading(true);
        try {
            await api.post('/users/apply-role', { role: 'PROVIDER' });
            alert('Application submitted!');
        } catch (error) {
            alert('Application failed');
        } finally {
            setUpgrading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/dashboard" className="hover:text-white transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>Profile</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white capitalize">{activeTab}</span>
                </nav>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Sidebar Left */}
                    <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Content Right */}
                    <div className="flex-1 min-w-0">
                        {/* Tab Headers per Page */}
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-white capitalize">{activeTab}</h2>
                            {activeTab === 'profile' && user?.role === 'CUSTOMER' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpgradeToArtist}
                                        disabled={upgrading}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition-all disabled:opacity-50"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Artist
                                    </button>
                                    <button
                                        onClick={handleUpgradeToProvider}
                                        disabled={upgrading}
                                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-all disabled:opacity-50"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Provider
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Rendering Content */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Avatar Card */}
                                <div className="bg-gray-900/40 rounded-2xl p-8 border border-gray-800 flex flex-col md:flex-row items-center gap-8">
                                    <div className="relative group">
                                        <UserAvatar user={user} size="xl" className="border-4 cursor-pointer border-gray-800 shadow-2xl transition-transform group-hover:scale-105" />
                                        <button className="absolute bottom-2 cursor-pointer right-2 w-10 h-10 bg-yellow-400 hover:bg-yellow-300 text-black rounded-full flex items-center justify-center shadow-lg transition-all transform scale-0 group-hover:scale-100">
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-bold text-white mb-2">{user?.username}</h3>
                                        <p className="text-gray-400 mb-4">{user?.email}</p>
                                    </div>
                                </div>

                                {/* General Settings Card */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                            <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20">
                                                <h3 className="text-lg font-bold text-white">General Information</h3>
                                                <p className="text-sm text-gray-400">Update your basic account information and public profile.</p>
                                            </div>
                                            <div className="p-8 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-2 font-medium">Username</label>
                                                        <input
                                                            type="text"
                                                            value={formData.username}
                                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                            className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-2 font-medium">Display Name</label>
                                                        <input
                                                            type="text"
                                                            value={formData.displayName}
                                                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                            placeholder="Mahesa Putra"
                                                            className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Location</label>
                                                    <div className="relative">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                                        <input
                                                            type="text"
                                                            value={formData.location}
                                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                            placeholder="Jakarta, Indonesia"
                                                            className="w-full bg-black/50 text-white pl-12 pr-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Bio</label>
                                                    <textarea
                                                        value={formData.bio}
                                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                        className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 transition-all resize-none h-32"
                                                        placeholder="Write a short bit about yourself..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="px-8 py-4 bg-gray-800/10 border-t border-gray-800 flex justify-end">
                                                <button
                                                    onClick={handleSaveSettings}
                                                    disabled={isSaving}
                                                    className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/20">
                                                <h3 className="font-bold text-white">Social Presence</h3>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div className="relative">
                                                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Twitter URL"
                                                        value={formData.socialLinks.twitter}
                                                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                                                        className="w-full bg-black/30 text-white pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-800 focus:border-blue-400 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                                                    <input
                                                        type="text"
                                                        placeholder="Instagram URL"
                                                        value={formData.socialLinks.instagram}
                                                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                                                        className="w-full bg-black/30 text-white pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-800 focus:border-pink-500 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                                                    <input
                                                        type="text"
                                                        placeholder="GitHub URL"
                                                        className="w-full bg-black/30 text-white pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-800 focus:border-white focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Portfolio Website"
                                                        value={formData.website}
                                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                        className="w-full bg-black/30 text-white pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-400/5 rounded-2xl border border-yellow-400/10 p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                                                    <ShieldCheck className="w-5 h-5 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">Trust Level</h4>
                                                    <p className="text-xs text-gray-500">Verified Member</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-yellow-400 h-full w-[85%]" />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2 text-center">Your profile is 85% complete</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'uploads' && (
                            <UploadsTab userId={user?.id} />
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
                                        <p className="text-sm text-gray-400 mb-1">Total Downloads</p>
                                        <p className="text-3xl font-bold text-white">1,284</p>
                                        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> +12% this month
                                        </p>
                                    </div>
                                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
                                        <p className="text-sm text-gray-400 mb-1">Total Earnings</p>
                                        <p className="text-3xl font-bold text-white">$4,820.00</p>
                                        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> +8% this month
                                        </p>
                                    </div>
                                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
                                        <p className="text-sm text-gray-400 mb-1">Active Models</p>
                                        <p className="text-3xl font-bold text-white">42</p>
                                        <p className="text-xs text-gray-500 mt-2">All assets online</p>
                                    </div>
                                </div>
                                <div className="bg-gray-900/40 p-8 rounded-2xl border border-gray-800 h-64 flex items-center justify-center">
                                    <p className="text-gray-500">Sales Chart Visualization Coming Soon</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Shipping Address Card */}
                                <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20">
                                        <h3 className="text-lg font-bold text-white">Default Shipping Address</h3>
                                        <p className="text-sm text-gray-400">Where should we spend your physical 3D prints or packages?</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Receiver Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.receiverName}
                                                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                                                    placeholder="e.g., Mahesa Putra"
                                                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    placeholder="e.g., +62 812-3456-7890"
                                                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2 font-medium">Detailed Address</label>
                                            <textarea
                                                value={formData.detailedAddress}
                                                onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                                                placeholder="Street name, building number, locality..."
                                                className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all h-32 resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Postcode / ZIP</label>
                                                <input
                                                    type="text"
                                                    value={formData.postcode}
                                                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                                    placeholder="54321"
                                                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Preferred Shipping Service</label>
                                                <select
                                                    value={formData.courierPreference}
                                                    onChange={(e) => setFormData({ ...formData, courierPreference: e.target.value })}
                                                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all"
                                                >
                                                    <option value="JNE">JNE</option>
                                                    <option value="J&T">J&T Express</option>
                                                    <option value="SiCepat">SiCepat</option>
                                                    <option value="Pos Indonesia">Pos Indonesia</option>
                                                    <option value="DHL">DHL (International)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-800">
                                            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-green-400/10 rounded-lg flex items-center justify-center">
                                                        <Sparkles className="w-5 h-5 text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">Eco-friendly Packaging</p>
                                                        <p className="text-sm text-gray-500">Use recycled materials for your shipments when possible.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setFormData({ ...formData, ecoPackaging: !formData.ecoPackaging })}
                                                    className={`w-12 h-6 rounded-full relative transition-all duration-200 ${formData.ecoPackaging ? 'bg-green-500' : 'bg-gray-700'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${formData.ecoPackaging ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-8 py-4 bg-gray-800/10 border-t border-gray-800 flex justify-end">
                                        <button
                                            onClick={handleSaveSettings}
                                            disabled={isSaving}
                                            className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Shipping Details'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'service' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <ServiceTab />
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <JobsTab />
                            </div>
                        )}

                        {activeTab === 'workshop' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20">
                                        <h3 className="text-lg font-bold text-white">Workshop Setup</h3>
                                        <p className="text-sm text-gray-400">Manage your printers and technical capabilities.</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                                    <Settings2 className="w-5 h-5 text-gray-300" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Auto-Accept Orders</p>
                                                    <p className="text-sm text-gray-500">Automatically accept print jobs that match your capabilities.</p>
                                                </div>
                                            </div>
                                            <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'collections' && (
                            <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-gray-800 border-dashed animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <FolderOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No collections yet</h3>
                                <p className="text-gray-400 mb-8 max-w-sm mx-auto">Start creating collections to organize your favorite 3D models.</p>
                                <Link href="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
                                    Explore Catalog
                                </Link>
                            </div>
                        )}

                        {activeTab === 'bookmarks' && (
                            <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-gray-800 border-dashed animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Bookmark className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h3>
                                <p className="text-gray-400 mb-8 max-w-sm mx-auto">Items you save in the catalog will appear here for easy access later.</p>
                                <Link href="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
                                    Discover Models
                                </Link>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="p-6 bg-gray-900/40 rounded-2xl border border-gray-800 flex items-start gap-4 hover:border-yellow-400/30 transition-all cursor-pointer">
                                    <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Payment successful!</p>
                                        <p className="text-sm text-gray-400">Your order #ORD-1234 has been confirmed. You can now download your items.</p>
                                        <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-900/40 rounded-2xl border border-gray-800 flex items-start gap-4 grayscale opacity-50">
                                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                                        <Bell className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Welcome to 3Dēx!</p>
                                        <p className="text-sm text-gray-400">Thanks for joining our community of 3D creators and enthusiasts.</p>
                                        <p className="text-xs text-gray-500 mt-2">Yesterday</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Preferences Card */}
                                <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20">
                                        <h3 className="text-lg font-bold text-white">System Preferences</h3>
                                        <p className="text-sm text-gray-400">Manage your language, timezone, and display settings.</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Language</label>
                                                <select className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all">
                                                    <option>English (US)</option>
                                                    <option>Bahasa Indonesia</option>
                                                    <option>Japanese</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Timezone</label>
                                                <select className="w-full bg-black/50 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-yellow-400 focus:outline-none transition-all">
                                                    <option>(GMT+07:00) Jakarta</option>
                                                    <option>(GMT+00:00) UTC</option>
                                                    <option>(GMT-08:00) Pacific Time</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                                <div>
                                                    <p className="text-white font-medium">Email Notifications</p>
                                                    <p className="text-sm text-gray-500">Receive weekly digests and important updates.</p>
                                                </div>
                                                <div className="w-12 h-6 bg-yellow-400 rounded-full relative cursor-pointer">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full shadow-sm" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                                <div>
                                                    <p className="text-white font-medium">Marketplace Updates</p>
                                                    <p className="text-sm text-gray-500">Get notified when models you bookmarked go on sale.</p>
                                                </div>
                                                <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                                                    <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full shadow-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-8 py-4 bg-gray-800/10 border-t border-gray-800 flex justify-end">
                                        <button className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all">
                                            Update Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {activeTab === 'billing' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-gray-900/40 rounded-2xl border border-gray-800 p-8 flex flex-col items-center text-center">
                                    <CreditCard className="w-16 h-16 text-gray-700 mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Billing & Payments</h3>
                                    <p className="text-gray-400 mb-8 max-w-sm">Manage your payment methods and view your transaction history.</p>
                                    <button className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-all">
                                        Add Payment Method
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
