'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, User, Briefcase, Share2, Check, ChevronRight,
    Loader2, Plus, Trash2, Sparkles, ExternalLink, MapPin,
    Globe, FileText, Instagram, Twitter
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { userService } from '@/lib/api/services/user.service';

type Step = 'profile' | 'portfolio' | 'social';

interface PortfolioEntry {
    title: string;
    url: string;
    description: string;
}

export default function BecomeArtistPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>('profile');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Profile
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');

    // Step 2: Portfolio
    const [portfolioItems, setPortfolioItems] = useState<PortfolioEntry[]>([
        { title: '', url: '', description: '' }
    ]);

    // Step 3: Social
    const [twitter, setTwitter] = useState('');
    const [instagram, setInstagram] = useState('');
    const [artstation, setArtstation] = useState('');
    const [behance, setBehance] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Validation
    const isStep1Valid = displayName.trim().length >= 2 && bio.trim().length >= 10;
    const isStep2Valid = portfolioItems.length > 0 &&
        portfolioItems.every(p => p.title.trim() && p.url.trim());
    const isStep3Valid = agreedToTerms;

    const steps = [
        { id: 'profile' as Step, label: 'Profile Info', icon: User },
        { id: 'portfolio' as Step, label: 'Portfolio', icon: Briefcase },
        { id: 'social' as Step, label: 'Social & Submit', icon: Share2 },
    ];

    const addPortfolioItem = () => {
        setPortfolioItems([...portfolioItems, { title: '', url: '', description: '' }]);
    };

    const removePortfolioItem = (index: number) => {
        if (portfolioItems.length <= 1) return;
        setPortfolioItems(portfolioItems.filter((_, i) => i !== index));
    };

    const updatePortfolioItem = (index: number, field: keyof PortfolioEntry, value: string) => {
        const updated = [...portfolioItems];
        updated[index] = { ...updated[index], [field]: value };
        setPortfolioItems(updated);
    };

    const handleSubmit = async () => {
        if (!isStep3Valid || !isStep2Valid) return;
        setError('');
        setIsSubmitting(true);

        try {
            await userService.applyForRole({
                role: 'ARTIST',
                portfolio: portfolioItems.map(p => ({
                    title: p.title.trim(),
                    url: p.url.trim(),
                    description: p.description.trim() || undefined,
                })),
                display_name: displayName.trim() || undefined,
                bio: bio.trim() || undefined,
                website: website.trim() || undefined,
                location: location.trim() || undefined,
                social_twitter: twitter.trim() || undefined,
                social_instagram: instagram.trim() || undefined,
                social_artstation: artstation.trim() || undefined,
                social_behance: behance.trim() || undefined,
            });

            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auth guard
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto">
                        <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Login Required</h2>
                    <p className="text-gray-400 text-sm max-w-sm">
                        You need to be logged in to apply as an artist.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    // Already an artist
    if (user?.role === 'ARTIST') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">You&apos;re Already an Artist!</h2>
                    <p className="text-gray-400 text-sm max-w-sm">
                        {user.account_status === 'PENDING'
                            ? 'Your artist application is pending review by our admin team.'
                            : 'You already have artist access. Start uploading your creations!'}
                    </p>
                    <Link
                        href={user.account_status === 'APPROVED' ? '/upload' : '/profile'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                    >
                        {user.account_status === 'APPROVED' ? 'Upload Asset' : 'View Profile'}
                    </Link>
                </div>
            </div>
        );
    }

    // Success state
    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-md animate-in fade-in zoom-in-95 duration-500">
                    {/* Animated success icon */}
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                            <Sparkles className="w-10 h-10 text-black" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white">Application Submitted!</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your artist application is now <span className="text-yellow-400 font-semibold">pending review</span>.
                            Our admin team will review your portfolio and get back to you soon.
                        </p>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 text-left space-y-3">
                        <h3 className="text-sm font-bold text-gray-300">What happens next?</h3>
                        <div className="space-y-2">
                            {[
                                'Admin reviews your portfolio & profile',
                                'You\'ll receive a notification on approval',
                                'Once approved, you can start uploading 3D assets',
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-400/10 flex items-center justify-center mt-0.5">
                                        <span className="text-[10px] font-bold text-yellow-400">{i + 1}</span>
                                    </div>
                                    <span className="text-sm text-gray-400">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Link
                            href="/profile"
                            className="px-6 py-3 bg-gray-900 border border-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            View Profile
                        </Link>
                        <Link
                            href="/catalog"
                            className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/20 sticky top-0 z-30 backdrop-blur-md">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/catalog" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Become an Artist</h1>
                            <p className="text-xs text-gray-500">Apply to sell your 3D creations on 3Dēx</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400">Artist Program</span>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 pt-8">
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isPast = steps.findIndex(s => s.id === currentStep) > index;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                                        ? 'bg-yellow-400 text-black scale-110 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                                        : isPast
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-900 text-gray-500 border border-gray-800'
                                    }`}>
                                    {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isActive ? 'text-yellow-400' : isPast ? 'text-green-400' : 'text-gray-500'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Form Container */}
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">

                    {/* ───── STEP 1: PROFILE ───── */}
                    {currentStep === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Tell Us About Yourself</h2>
                                <p className="text-gray-400 text-sm">Let the community know who you are.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Display Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" /> Display Name
                                        <span className="text-yellow-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Alex Doe"
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors text-white placeholder:text-gray-600"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                    />
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" /> Bio
                                        <span className="text-yellow-400">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell us about your 3D art experience, specialties, and creative journey... (min 10 characters)"
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors text-white placeholder:text-gray-600 resize-none"
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <span className={`text-xs ${bio.length >= 10 ? 'text-green-500' : 'text-gray-600'}`}>
                                            {bio.length}/10 min
                                        </span>
                                    </div>
                                </div>

                                {/* Location & Website */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500" /> Location
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Jakarta, Indonesia"
                                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors text-white placeholder:text-gray-600"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-gray-500" /> Website
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://yoursite.com"
                                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors text-white placeholder:text-gray-600"
                                            value={website}
                                            onChange={e => setWebsite(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={() => setCurrentStep('portfolio')}
                                    disabled={!isStep1Valid}
                                    className="px-8 py-3 bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-xl flex items-center gap-2 transition-all hover:bg-yellow-300 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ───── STEP 2: PORTFOLIO ───── */}
                    {currentStep === 'portfolio' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Showcase Your Work</h2>
                                <p className="text-gray-400 text-sm">
                                    Add links to your best work — ArtStation, Sketchfab, Behance, personal site, etc.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {portfolioItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-5 bg-gray-900/30 border border-gray-800 rounded-2xl space-y-4 relative group transition-all hover:border-gray-700"
                                    >
                                        {/* Remove button */}
                                        {portfolioItems.length > 1 && (
                                            <button
                                                onClick={() => removePortfolioItem(index)}
                                                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 rounded-full bg-yellow-400/10 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-yellow-400">{index + 1}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Portfolio Item
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400">Title <span className="text-yellow-400">*</span></label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Sci-Fi Character Bust"
                                                    className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-2.5 outline-none focus:border-yellow-400 transition-colors text-sm text-white placeholder:text-gray-600"
                                                    value={item.title}
                                                    onChange={e => updatePortfolioItem(index, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400">URL <span className="text-yellow-400">*</span></label>
                                                <div className="relative">
                                                    <input
                                                        type="url"
                                                        placeholder="https://artstation.com/..."
                                                        className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-2.5 pr-10 outline-none focus:border-yellow-400 transition-colors text-sm text-white placeholder:text-gray-600"
                                                        value={item.url}
                                                        onChange={e => updatePortfolioItem(index, 'url', e.target.value)}
                                                    />
                                                    {item.url && (
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400 transition-colors"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400">Description (optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Brief description of this piece"
                                                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-2.5 outline-none focus:border-yellow-400 transition-colors text-sm text-white placeholder:text-gray-600"
                                                value={item.description}
                                                onChange={e => updatePortfolioItem(index, 'description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Add more button */}
                                <button
                                    onClick={addPortfolioItem}
                                    className="w-full py-3 border-2 border-dashed border-gray-800 hover:border-yellow-400/50 rounded-2xl text-sm font-semibold text-gray-500 hover:text-yellow-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Add Another Portfolio Item
                                </button>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <button
                                    onClick={() => setCurrentStep('profile')}
                                    className="px-6 py-3 border border-gray-800 text-gray-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setCurrentStep('social')}
                                    disabled={!isStep2Valid}
                                    className="px-8 py-3 bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-xl flex items-center gap-2 transition-all hover:bg-yellow-300 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ───── STEP 3: SOCIAL & SUBMIT ───── */}
                    {currentStep === 'social' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Almost There!</h2>
                                <p className="text-gray-400 text-sm">
                                    Add your social profiles so the community can find you.
                                </p>
                            </div>

                            <div className="space-y-5">
                                {/* Social fields */}
                                {[
                                    { label: 'Twitter / X', icon: Twitter, value: twitter, set: setTwitter, placeholder: 'https://x.com/yourhandle' },
                                    { label: 'Instagram', icon: Instagram, value: instagram, set: setInstagram, placeholder: 'https://instagram.com/yourhandle' },
                                    { label: 'ArtStation', icon: Briefcase, value: artstation, set: setArtstation, placeholder: 'https://artstation.com/yourname' },
                                    { label: 'Behance', icon: Share2, value: behance, set: setBehance, placeholder: 'https://behance.net/yourname' },
                                ].map((social) => (
                                    <div key={social.label} className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                            <social.icon className="w-4 h-4 text-gray-500" />
                                            {social.label}
                                        </label>
                                        <input
                                            type="url"
                                            placeholder={social.placeholder}
                                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors text-white placeholder:text-gray-600"
                                            value={social.value}
                                            onChange={e => social.set(e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Review summary */}
                            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 space-y-3">
                                <h3 className="text-sm font-bold text-gray-300">Application Summary</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="text-gray-500">Display Name</div>
                                    <div className="text-white font-medium">{displayName || '—'}</div>
                                    <div className="text-gray-500">Portfolio Items</div>
                                    <div className="text-white font-medium">{portfolioItems.filter(p => p.title && p.url).length}</div>
                                    <div className="text-gray-500">Location</div>
                                    <div className="text-white font-medium">{location || '—'}</div>
                                    <div className="text-gray-500">Social Links</div>
                                    <div className="text-white font-medium">
                                        {[twitter, instagram, artstation, behance].filter(Boolean).length} connected
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex-shrink-0 mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={e => setAgreedToTerms(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 rounded-md border-2 border-gray-700 peer-checked:border-yellow-400 peer-checked:bg-yellow-400 transition-all flex items-center justify-center">
                                        {agreedToTerms && <Check className="w-3.5 h-3.5 text-black" />}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                    I agree to the{' '}
                                    <span className="text-yellow-400 underline underline-offset-2">Artist Terms of Service</span>{' '}
                                    and confirm that the portfolio items I&apos;ve submitted are my own original work.
                                </span>
                            </label>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="pt-4 flex justify-between">
                                <button
                                    onClick={() => setCurrentStep('portfolio')}
                                    className="px-6 py-3 border border-gray-800 text-gray-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isStep3Valid || isSubmitting}
                                    className="relative px-10 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-black font-black rounded-xl shadow-[0_10px_40px_rgba(250,204,21,0.15)] flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Submit Application
                                        </>
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
