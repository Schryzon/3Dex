'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { FolderOpen, Bookmark, ShoppingCart, Sparkles, CheckCircle, XCircle, Upload, BarChart3, Settings, Camera, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ProfilePage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [upgrading, setUpgrading] = useState(false);
    const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState<'collections' | 'bookmarks' | 'uploads' | 'settings'>('collections');

    // Profile edit form state
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        displayName: '',
        bio: '',
        location: '',
        address1: '',
        address2: '',
        address3: '',
        website: '',
        skills: [] as string[],
        socialLinks: {
            twitter: '',
            instagram: '',
            artstation: '',
            behance: ''
        }
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
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Settings saved:', formData);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Set active tab from URL query parameter
    useEffect(() => {
        const tabParam = searchParams.get('tab') as 'collections' | 'bookmarks' | 'uploads' | 'settings' | null;
        if (tabParam && ['collections', 'bookmarks', 'uploads', 'settings'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    //TODO: Mock function - replace with actual API call
    const handleUpgradeToArtist = async () => {
        setUpgrading(true);
        setUpgradeStatus('idle');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setUpgradeStatus('success');
            console.log('✅ Upgrade to artist successful (MOCK)');
        } catch (error) {
            console.error('❌ Upgrade failed:', error);
            setUpgradeStatus('error');
        } finally {
            setUpgrading(false);
        }
    };

    const tabs = [
        { id: 'collections' as const, label: 'Collections', icon: FolderOpen, count: 0 },
        { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark, count: 0 },
        ...(user?.role === 'ARTIST' || user?.role === 'ADMIN' ? [
            { id: 'uploads' as const, label: 'Uploads', icon: Upload, count: 0 },
        ] : []),
        { id: 'settings' as const, label: 'Settings', icon: Settings, count: undefined },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Cover Image */}
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-yellow-400/20 border-b border-gray-800">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
                <button className="absolute top-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm border border-gray-700 transition-colors flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">Change Cover</span>
                </button>
            </div>

            {/* Profile Header */}
            <div className="max-w-7xl mx-auto px-6 -mt-20">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-3xl md:text-5xl border-4 border-[#0a0a0a] shadow-2xl">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-8 h-8 md:w-10 md:h-10 bg-yellow-400 hover:bg-yellow-300 text-black rounded-full flex items-center justify-center shadow-lg transition-colors">
                            <Camera className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                            <h1 className="text-2xl md:text-4xl font-bold text-white">{user?.username || 'User'}</h1>
                            <span className="inline-flex items-center px-3 py-1 bg-yellow-400/10 text-yellow-400 text-sm font-semibold rounded-full border border-yellow-400/20 w-fit">
                                {user?.role || 'CUSTOMER'}
                            </span>
                        </div>
                        <p className="text-gray-400 mb-4">{user?.email}</p>

                        {/* Stats */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div>
                                <p className="text-2xl font-bold text-white">0</p>
                                <p className="text-sm text-gray-400">Collections</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">0</p>
                                <p className="text-sm text-gray-400">Bookmarks</p>
                            </div>
                            {(user?.role === 'ARTIST' || user?.role === 'ADMIN') && (
                                <div>
                                    <p className="text-2xl font-bold text-white">0</p>
                                    <p className="text-sm text-gray-400">Uploads</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Become an Artist Banner - Only for CUSTOMER */}
                {user?.role === 'CUSTOMER' && (
                    <div className="mb-8 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-yellow-400/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-yellow-400/30">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg md:text-xl font-bold text-white mb-1">Become an Artist</h3>
                                <p className="text-gray-300 text-xs md:text-sm">
                                    Start uploading and selling your 3D models. Earn money from your creations!
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                {upgradeStatus === 'success' && (
                                    <div className="flex items-center gap-2 text-green-400 text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Upgraded! Refresh page.</span>
                                    </div>
                                )}

                                {upgradeStatus === 'error' && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm">
                                        <XCircle className="w-4 h-4" />
                                        <span>Failed. Try again.</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleUpgradeToArtist}
                                    disabled={upgrading || upgradeStatus === 'success'}
                                    className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    {upgrading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            <span>Upgrading...</span>
                                        </>
                                    ) : upgradeStatus === 'success' ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Upgraded!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span>Upgrade Now</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="border-b border-gray-800 mb-8">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-yellow-400 border-b-2 border-yellow-400'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                                            ? 'bg-yellow-400/20 text-yellow-400'
                                            : 'bg-gray-800 text-gray-400'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="pb-12">
                    {activeTab === 'collections' && (
                        <div className="text-center py-20">
                            <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No collections yet</h3>
                            <p className="text-gray-400 mb-6">Start purchasing 3D models to build your collection</p>
                            <Link
                                href="/catalog"
                                className="inline-block px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
                            >
                                Browse Catalog
                            </Link>
                        </div>
                    )}

                    {activeTab === 'bookmarks' && (
                        <div className="text-center py-20">
                            <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No bookmarks yet</h3>
                            <p className="text-gray-400 mb-6">Save your favorite models for later</p>
                            <Link
                                href="/catalog"
                                className="inline-block px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
                            >
                                Explore Models
                            </Link>
                        </div>
                    )}

                    {activeTab === 'uploads' && (
                        <div className="text-center py-20">
                            <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No uploads yet</h3>
                            <p className="text-gray-400 mb-6">Start uploading your 3D models to sell</p>
                            <button className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
                                Upload Model
                            </button>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-5xl mx-auto space-y-10">

                            {/* ==================== GENERAL SETTINGS ==================== */}
                            <section>
                                <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3">General Settings</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Account Information */}
                                    <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800">
                                        <h4 className="text-white font-semibold mb-4">Account Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Username</label>
                                                <input
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                    placeholder="Enter username"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Details */}
                                    <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800">
                                        <h4 className="text-white font-semibold mb-4">Profile Details</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.displayName}
                                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                    className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                    placeholder="Enter display name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Bio</label>
                                                <textarea
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    rows={3}
                                                    className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 resize-none"
                                                    placeholder="Tell us about yourself..."
                                                />
                                                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-2">Location</label>
                                                    <input
                                                        type="text"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                        className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                        placeholder="City, Country"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-2">Website</label>
                                                    <input
                                                        type="url"
                                                        value={formData.website}
                                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                        className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills - Full Width Card */}
                                <div className="mt-6 bg-gray-900/40 rounded-xl p-6 border border-gray-800">
                                    <h4 className="text-white font-semibold mb-4">Skills</h4>
                                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                            className="flex-1 bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                            placeholder="e.g., 3D Modeling, Texturing, Animation"
                                        />
                                        <button
                                            type="button"
                                            onClick={addSkill}
                                            className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 rounded-lg transition-colors font-semibold"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {formData.skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-gray-700"
                                                >
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No skills added yet.</p>
                                    )}
                                </div>
                            </section>

                            {/* ==================== ADDRESS ==================== */}
                            <section>
                                <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3">Address</h3>
                                <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Address 1</label>
                                            <input
                                                type="text"
                                                value={formData.address1}
                                                onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                                                className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                placeholder="Street address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Address 2</label>
                                            <input
                                                type="text"
                                                value={formData.address2}
                                                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                                                className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                placeholder="Apartment, suite, etc."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Address 3</label>
                                            <input
                                                type="text"
                                                value={formData.address3}
                                                onChange={(e) => setFormData({ ...formData, address3: e.target.value })}
                                                className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                placeholder="Additional info (optional)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ==================== SOCIALS ==================== */}
                            <section>
                                <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3">Socials</h3>
                                <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Twitter</label>
                                            <input
                                                type="url"
                                                value={formData.socialLinks.twitter}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                                                className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                placeholder="https://twitter.com/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Instagram</label>
                                            <input
                                                type="url"
                                                value={formData.socialLinks.instagram}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                                                className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                placeholder="https://instagram.com/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">ArtStation</label>
                                            <input
                                                type="url"
                                                value={formData.socialLinks.artstation}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, artstation: e.target.value } })}
                                                className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                placeholder="https://artstation.com/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Behance</label>
                                            <input
                                                type="url"
                                                value={formData.socialLinks.behance}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, behance: e.target.value } })}
                                                className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                                                placeholder="https://behance.net/username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ==================== SAVE BUTTON ==================== */}
                            <div className="pt-4 pb-8">
                                <button
                                    type="button"
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-400/20"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            <span>Saving Changes...</span>
                                        </>
                                    ) : (
                                        <span>Save Changes</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}