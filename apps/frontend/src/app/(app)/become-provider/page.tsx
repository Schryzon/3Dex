'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, User, Printer, Settings2, Check, ChevronRight,
    Loader2, Plus, X, Sparkles, MapPin, Globe, FileText, Wrench, Palette, DollarSign
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { userService } from '@/lib/api/services/user.service';

type Step = 'profile' | 'equipment' | 'review';

const COMMON_MATERIALS = ['PLA', 'ABS', 'PETG', 'TPU', 'Nylon', 'Resin (Standard)', 'Resin (Tough)', 'Resin (Flexible)', 'Carbon Fiber', 'ASA', 'HIPS', 'PVA', 'Wood Fill', 'Metal Fill'];
const COMMON_COLORS = ['White', 'Black', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Transparent', 'Gold', 'Silver', 'Custom'];
const PRINTER_TYPES = ['FDM / FFF', 'SLA (Resin)', 'SLS', 'DLP', 'Multi Jet Fusion', 'Metal (DMLS/SLM)', 'PolyJet'];

export default function BecomeProviderPage() {
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

    // Step 2: Equipment / Config
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedPrinterTypes, setSelectedPrinterTypes] = useState<string[]>([]);
    const [basePrice, setBasePrice] = useState('');
    const [maxX, setMaxX] = useState('');
    const [maxY, setMaxY] = useState('');
    const [maxZ, setMaxZ] = useState('');

    // Step 3: Terms
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Validation
    const isStep1Valid = displayName.trim().length >= 2 && bio.trim().length >= 10 && location.trim().length >= 2;
    const isStep2Valid = selectedMaterials.length > 0 && selectedPrinterTypes.length > 0;
    const isStep3Valid = agreedToTerms;

    const steps = [
        { id: 'profile' as Step, label: 'Profile Info', icon: User },
        { id: 'equipment' as Step, label: 'Equipment', icon: Printer },
        { id: 'review' as Step, label: 'Review & Submit', icon: Settings2 },
    ];

    const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
        setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    };

    const handleSubmit = async () => {
        if (!isStep3Valid || !isStep2Valid) return;
        setError('');
        setIsSubmitting(true);

        try {
            const providerConfig: any = {
                materials: selectedMaterials,
                colors: selectedColors,
                printerTypes: selectedPrinterTypes,
            };
            if (basePrice) providerConfig.basePrice = Number(basePrice);
            if (maxX && maxY && maxZ) {
                providerConfig.maxDimensions = { x: Number(maxX), y: Number(maxY), z: Number(maxZ) };
            }

            await userService.applyForProvider({
                role: 'PROVIDER',
                provider_config: providerConfig,
                display_name: displayName.trim() || undefined,
                bio: bio.trim() || undefined,
                website: website.trim() || undefined,
                location: location.trim() || undefined,
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
                        You need to be logged in to apply as a provider.
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

    // Already a provider
    if (user?.role === 'PROVIDER') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">You&apos;re Already a Provider!</h2>
                    <p className="text-gray-400 text-sm max-w-sm">
                        {user.account_status === 'PENDING'
                            ? 'Your provider application is pending review by our admin team.'
                            : 'You already have provider access. Check your dashboard for incoming jobs!'}
                    </p>
                    <Link
                        href={user.account_status === 'APPROVED' ? '/profile?tab=jobs' : '/profile'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                    >
                        {user.account_status === 'APPROVED' ? 'View Jobs' : 'View Profile'}
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
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                            <Printer className="w-10 h-10 text-black" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white">Application Submitted!</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your provider application is now <span className="text-yellow-400 font-semibold">pending review</span>.
                            Our admin team will review your equipment and get back to you soon.
                        </p>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 text-left space-y-3">
                        <h3 className="text-sm font-bold text-gray-300">What happens next?</h3>
                        <div className="space-y-2">
                            {[
                                'Admin reviews your profile & equipment details',
                                'You\'ll receive a notification on approval',
                                'Once approved, you can start accepting print jobs',
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
                            href="/print-services"
                            className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                        >
                            Browse Print Services
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
                        <Link href="/print-services" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Become a Provider</h1>
                            <p className="text-xs text-gray-500">Join the 3Dēx printing network</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                        <Printer className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400">Provider Program</span>
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
                                <h2 className="text-2xl font-bold mb-2">About Your Business</h2>
                                <p className="text-gray-400 text-sm">Tell customers about your printing service.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" /> Business / Display Name
                                        <span className="text-yellow-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. PrintForge Labs"
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors text-white placeholder:text-gray-600"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" /> Description
                                        <span className="text-yellow-400">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe your printing capabilities, turnaround times, quality standards... (min 10 characters)"
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500" /> Location
                                            <span className="text-yellow-400">*</span>
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
                                    onClick={() => setCurrentStep('equipment')}
                                    disabled={!isStep1Valid}
                                    className="px-8 py-3 bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-xl flex items-center gap-2 transition-all hover:bg-yellow-300 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ───── STEP 2: EQUIPMENT ───── */}
                    {currentStep === 'equipment' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Your Equipment & Capabilities</h2>
                                <p className="text-gray-400 text-sm">
                                    Tell us what you can print — this helps match you with the right customers.
                                </p>
                            </div>

                            {/* Printer Types */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Printer className="w-4 h-4 text-gray-500" /> Printer Types
                                    <span className="text-yellow-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PRINTER_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleItem(selectedPrinterTypes, setSelectedPrinterTypes, type)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${selectedPrinterTypes.includes(type)
                                                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                                                    : 'bg-gray-900/50 border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                                                }`}
                                        >
                                            {selectedPrinterTypes.includes(type) && <Check className="w-3 h-3 inline mr-1" />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Materials */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-gray-500" /> Supported Materials
                                    <span className="text-yellow-400">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_MATERIALS.map(mat => (
                                        <button
                                            key={mat}
                                            onClick={() => toggleItem(selectedMaterials, setSelectedMaterials, mat)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedMaterials.includes(mat)
                                                    ? 'bg-yellow-400 text-black'
                                                    : 'bg-gray-900/50 border border-gray-800 text-gray-400 hover:border-gray-600'
                                                }`}
                                        >
                                            {mat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-gray-500" /> Available Colors
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => toggleItem(selectedColors, setSelectedColors, color)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedColors.includes(color)
                                                    ? 'bg-yellow-400 text-black'
                                                    : 'bg-gray-900/50 border border-gray-800 text-gray-400 hover:border-gray-600'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Base Price & Max Dimensions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-500" /> Base Price (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 50000"
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition-colors text-white placeholder:text-gray-600"
                                        value={basePrice}
                                        onChange={e => setBasePrice(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-600">Starting price per print job</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300">Max Build Volume (mm)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="number" placeholder="X" value={maxX} onChange={e => setMaxX(e.target.value)}
                                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-3 outline-none focus:border-yellow-400 transition-colors text-white text-center placeholder:text-gray-600 text-sm" />
                                        <input type="number" placeholder="Y" value={maxY} onChange={e => setMaxY(e.target.value)}
                                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-3 outline-none focus:border-yellow-400 transition-colors text-white text-center placeholder:text-gray-600 text-sm" />
                                        <input type="number" placeholder="Z" value={maxZ} onChange={e => setMaxZ(e.target.value)}
                                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-3 outline-none focus:border-yellow-400 transition-colors text-white text-center placeholder:text-gray-600 text-sm" />
                                    </div>
                                    <p className="text-xs text-gray-600">Optional — your largest print area</p>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <button
                                    onClick={() => setCurrentStep('profile')}
                                    className="px-6 py-3 border border-gray-800 text-gray-400 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setCurrentStep('review')}
                                    disabled={!isStep2Valid}
                                    className="px-8 py-3 bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-xl flex items-center gap-2 transition-all hover:bg-yellow-300 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ───── STEP 3: REVIEW & SUBMIT ───── */}
                    {currentStep === 'review' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Review Your Application</h2>
                                <p className="text-gray-400 text-sm">
                                    Make sure everything looks good before submitting.
                                </p>
                            </div>

                            {/* Summary Cards */}
                            <div className="space-y-4">
                                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 space-y-3">
                                    <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-yellow-400" /> Profile
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="text-gray-500">Business Name</div>
                                        <div className="text-white font-medium">{displayName || '—'}</div>
                                        <div className="text-gray-500">Location</div>
                                        <div className="text-white font-medium">{location || '—'}</div>
                                        <div className="text-gray-500">Website</div>
                                        <div className="text-white font-medium truncate">{website || '—'}</div>
                                    </div>
                                </div>

                                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 space-y-3">
                                    <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <Printer className="w-4 h-4 text-yellow-400" /> Equipment
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-gray-500 block mb-1">Printer Types</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedPrinterTypes.map(t => (
                                                    <span key={t} className="px-2 py-0.5 bg-yellow-400/10 text-yellow-400 rounded-md text-xs font-medium">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block mb-1">Materials ({selectedMaterials.length})</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedMaterials.map(m => (
                                                    <span key={m} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-md text-xs">{m}</span>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedColors.length > 0 && (
                                            <div>
                                                <span className="text-gray-500 block mb-1">Colors ({selectedColors.length})</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedColors.map(c => (
                                                        <span key={c} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-md text-xs">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-gray-500">Base Price</span>
                                                <span className="text-white font-medium block">{basePrice ? `Rp ${Number(basePrice).toLocaleString()}` : '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Max Build Volume</span>
                                                <span className="text-white font-medium block">{maxX && maxY && maxZ ? `${maxX}×${maxY}×${maxZ} mm` : '—'}</span>
                                            </div>
                                        </div>
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
                                    <span className="text-yellow-400 underline underline-offset-2">Provider Terms of Service</span>{' '}
                                    and confirm that the equipment information I&apos;ve provided is accurate and up to date.
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
                                    onClick={() => setCurrentStep('equipment')}
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
