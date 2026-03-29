'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { orderService } from '@/lib/api/services';
import { orderKeys } from '@/lib/api/services/order.service';
import { cartKeys } from '@/lib/api/services/cart.service';
import {
    ArrowLeft, Lock, ChevronRight, Loader2,
    QrCode, Building2, Wallet, CreditCard,
    Tag, X, Check, ShieldCheck, Package
} from 'lucide-react';

declare global { interface Window { snap: any; } }

async function waitForMidtransSnap(maxMs = 20000): Promise<void> {
    const start = Date.now();
    while (typeof window !== 'undefined' && !(window as any).snap) {
        if (Date.now() - start > maxMs) {
            throw new Error('Payment gateway not loaded. Please refresh and try again.');
        }
        await new Promise((r) => setTimeout(r, 120));
    }
}

const PAYMENT_METHODS = [
    {
        id: 'qris',
        label: 'QRIS',
        desc: 'GoPay · OVO · ShopeePay · Dana',
        icon: QrCode,
        badge: 'Instant',
    },
    {
        id: 'va',
        label: 'Virtual Account',
        desc: 'BCA · Mandiri · BNI · BRI',
        icon: Building2,
        badge: null,
    },
    {
        id: 'wallet',
        label: 'E-Wallet',
        desc: 'Dana · LinkAja · OVO',
        icon: Wallet,
        badge: null,
    },
    {
        id: 'cc',
        label: 'Credit / Debit Card',
        desc: 'Visa · Mastercard · JCB',
        icon: CreditCard,
        badge: null,
    },
] as const;

type PaymentId = typeof PAYMENT_METHODS[number]['id'];

/* ─── Small reusable pieces ─── */

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden mb-5">
            {children}
        </div>
    );
}

function CardHeader({ title, meta }: { title: string; meta?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
            <h2 className="font-semibold text-[15px] tracking-tight text-white">{title}</h2>
            {meta && <span className="text-[12px] text-white/30">{meta}</span>}
        </div>
    );
}

function Field({
    label, type = 'text', placeholder, value, onChange, hint,
}: {
    label: string; type?: string; placeholder: string;
    value: string; onChange: (v: string) => void; hint?: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="
                    w-full bg-[#0a0a0a] border border-white/[0.08] rounded-xl
                    px-4 py-3.5 text-[14px] text-white placeholder:text-white/20
                    outline-none transition-colors duration-150
                    focus:border-white/20
                "
            />
            {hint && <p className="text-[12px] text-white/25">{hint}</p>}
        </div>
    );
}

/* ─── Main Page ─── */

export default function CheckoutPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isLoading: authLoading } = useAuth();
    const { items, total, clearCart } = useCart();

    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'failed' | 'pending'>('idle');
    const [serverOrderId, setServerOrderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [method, setMethod] = useState<PaymentId>('qris');
    const [coupon, setCoupon] = useState('');
    const [couponOpen, setCouponOpen] = useState(false);
    const [billing, setBilling] = useState({
        fullName: user?.username || '',
        email: user?.email || '',
        phone: '',
    });

    if (!authLoading && !user) { router.push('/'); return null; }
    // Only redirect to cart if we haven't successfully started a checkout
    if (!authLoading && !items.length && checkoutStatus === 'idle') { router.push('/cart'); return null; }

    if (authLoading) return (
        <div className="min-h-screen bg-[#080808] grid place-items-center">
            <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-yellow-400 animate-spin" />
        </div>
    );

    const handleCheckout = async () => {
        if (!billing.fullName || !billing.email || !billing.phone) {
            setError('Please complete all contact information first.');
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            const lines = items.map((i) => ({
                model_id: i.model_id,
                quantity: i.quantity,
            }));
            const { orderId, token } = await orderService.checkout(lines);
            setServerOrderId(orderId);

            if (token === 'mock-snap-token') {
                setTimeout(async () => {
                    await clearCart();
                    queryClient.invalidateQueries({ queryKey: cartKeys.all });
                    queryClient.invalidateQueries({ queryKey: orderKeys.all });
                    setCheckoutStatus('success');
                    setIsProcessing(false);
                }, 1000);
                return;
            }

            await waitForMidtransSnap();
            window.snap.pay(token, {
                onSuccess: async () => {
                    await clearCart();
                    queryClient.invalidateQueries({ queryKey: cartKeys.all });
                    queryClient.invalidateQueries({ queryKey: orderKeys.all });
                    setCheckoutStatus('success');
                    setIsProcessing(false);
                },
                onPending: () => {
                    queryClient.invalidateQueries({ queryKey: orderKeys.all });
                    setCheckoutStatus('pending');
                    setIsProcessing(false);
                },
                onError: () => {
                    setCheckoutStatus('failed');
                    setIsProcessing(false);
                },
                onClose: () => setIsProcessing(false),
            });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Checkout failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const activeMethod = PAYMENT_METHODS.find(m => m.id === method)!;

    return (
        <div className="min-h-screen bg-[#080808] text-white pb-24">

            {/* ── Sticky nav ── */}
            <nav className="sticky top-0 z-50 h-16 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">

                    {/* Brand */}
                    <span className="font-bold text-[20px] tracking-tight">
                        Checkout
                    </span>

                    {/* Steps */}
                    <div className="flex items-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em]">
                        {['Cart', 'Checkout', 'Confirm'].map((step, i) => {
                            const done = i < 1;
                            const active = i === 1;
                            return (
                                <div key={step} className="flex items-center">
                                    <div className={`flex items-center gap-2 lg:gap-2.5 transition-colors ${active ? 'text-white' : done ? 'text-white/40' : 'text-white/20'
                                        }`}>
                                        <span className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-[9px] lg:text-[10px] font-mono transition-all ${active ? 'bg-yellow-400 text-black'
                                            : done ? 'bg-white/10 text-white/40'
                                                : 'border border-white/10 text-white/20'
                                            }`}>
                                            {done ? <Check size={10} strokeWidth={3} /> : i + 1}
                                        </span>
                                        <span className="hidden xs:inline">{step}</span>
                                    </div>
                                    {i < 2 && <div className="w-5 lg:w-10 h-px bg-white/10 mx-2 lg:mx-4" />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Secure */}
                    <div className="flex items-center gap-2 text-[12px] text-white/25">
                        <Lock size={12} strokeWidth={2} />
                        <span className="hidden sm:inline">Secured by Midtrans</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1200px] mx-auto px-6 pb-32 lg:pb-0">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 pt-6 lg:pt-8 pb-0 text-[13px] text-white/30 hover:text-white/70 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={14} strokeWidth={2} />
                    Back to cart
                </button>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mt-6">

                    {/* ── LEFT COLUMN ── */}
                    <div className="flex flex-col gap-5">

                        {/* 1. Contact */}
                        <SectionCard>
                            <CardHeader
                                title="Contact Information"
                                meta={user?.email && (
                                    <span className="hidden xs:inline">Signed in as <strong className="text-white/60">{user.email}</strong></span>
                                )}
                            />
                            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Full Name"
                                    placeholder="John Doe"
                                    value={billing.fullName}
                                    onChange={v => setBilling(b => ({ ...b, fullName: v }))}
                                />
                                <Field
                                    label="Email Address"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={billing.email}
                                    onChange={v => setBilling(b => ({ ...b, email: v }))}
                                />
                                <div className="sm:col-span-2">
                                    <Field
                                        label="Phone Number"
                                        type="tel"
                                        placeholder="0812 XXXX XXXX"
                                        value={billing.phone}
                                        onChange={v => setBilling(b => ({ ...b, phone: v }))}
                                        hint="Used for payment notifications and invoice delivery."
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* 2. Payment method */}
                        <div id="payment-methods" className="scroll-mt-24">
                            <SectionCard>
                                <CardHeader title="Payment Method" />
                                <p className="px-6 pt-2 pb-0 text-[11px] text-white/35 leading-relaxed">
                                    Actual payment channel (QRIS, VA, card, e-wallet) is selected inside the secure Midtrans window after you place the order — the options below are a quick reference only.
                                </p>
                                <div className="px-6 py-6 flex flex-col gap-3">
                                    {PAYMENT_METHODS.map(m => {
                                        const active = method === m.id;
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => setMethod(m.id)}
                                                className={`
                                                w-full flex items-center gap-4 px-4 py-3.5 rounded-xl
                                                border text-left transition-all duration-150 cursor-pointer
                                                ${active
                                                        ? 'border-yellow-400/60 bg-yellow-400/[0.04]'
                                                        : 'border-white/[0.07] bg-[#0a0a0a] hover:border-white/[0.14]'
                                                    }
                                            `}
                                            >
                                                {/* Radio */}
                                                <span className={`
                                                w-4 h-4 rounded-full border-[1.5px] flex-shrink-0
                                                flex items-center justify-center transition-all
                                                ${active ? 'border-yellow-400' : 'border-white/20'}
                                            `}>
                                                    {active && (
                                                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                                    )}
                                                </span>

                                                {/* Icon */}
                                                <span className={`
                                                w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                                                transition-all
                                                ${active
                                                        ? 'bg-yellow-400/10 text-yellow-400'
                                                        : 'bg-white/[0.04] text-white/35'
                                                    }
                                            `}>
                                                    <m.icon size={16} strokeWidth={1.5} />
                                                </span>

                                                {/* Label */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[14px] font-semibold tracking-tight transition-colors ${active ? 'text-white' : 'text-white/70'
                                                        }`}>
                                                        {m.label}
                                                    </p>
                                                    <p className="text-[12px] text-white/30 mt-0.5">{m.desc}</p>
                                                </div>

                                                {/* Badge */}
                                                {m.badge && (
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border border-emerald-500/25 text-emerald-400 bg-emerald-500/[0.08] flex-shrink-0">
                                                        {m.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}

                                    {/* Secure note */}
                                    <div className="flex items-center gap-3 mt-1 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <ShieldCheck size={14} strokeWidth={1.5} className="text-white/25 flex-shrink-0" />
                                        <p className="text-[11px] text-white/25 leading-relaxed">
                                            Payments are securely processed by{' '}
                                            <strong className="text-white/40">Midtrans</strong>.
                                            Card data is not stored on our servers.
                                        </p>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {/* 3. Order review */}
                        <SectionCard>
                            <CardHeader
                                title="Order Review"
                                meta={`${items.length} item${items.length !== 1 ? 's' : ''}`}
                            />
                            <div className="px-6 py-2">
                                {items.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-4 py-4 ${idx < items.length - 1 ? 'border-b border-white/[0.05]' : ''
                                            }`}
                                    >
                                        {/* Thumb */}
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                                            {item.model.thumbnails?.[0]
                                                ? <img src={item.model.thumbnails[0]} alt="" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full grid place-items-center text-white/20">
                                                    <Package size={20} strokeWidth={1} />
                                                </div>
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-medium truncate">{item.model.title}</p>
                                            <p className="text-[12px] text-white/30 mt-0.5">
                                                @{item.model.artist?.username || 'Unknown'}
                                            </p>
                                            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded bg-white/[0.06] text-white/35">
                                                3D Model · License
                                            </span>
                                        </div>

                                        {/* Price (one license per line) */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[14px] font-mono font-medium">
                                                {formatPrice(item.model.price).idr}
                                            </p>
                                            <p className="text-[11px] font-mono text-white/30 mt-0.5">
                                                {formatPrice(item.model.price).usd}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    {/* ── RIGHT SIDEBAR ── */}
                    <aside className="lg:sticky lg:top-20 self-start flex flex-col gap-3">

                        {/* Summary card */}
                        <div className="bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden">
                            <div className="px-6 py-[18px] border-b border-white/[0.06]">
                                <h2 className="font-semibold text-[13px] tracking-tight">Order Summary</h2>
                            </div>

                            <div className="px-6 py-5 flex flex-col gap-5">

                                {/* Coupon */}
                                <div>
                                    <button
                                        onClick={() => setCouponOpen(v => !v)}
                                        className="flex items-center gap-2 text-[11px] text-white/30 hover:text-white/60 transition-colors cursor-pointer mb-0"
                                    >
                                        <Tag size={11} strokeWidth={2} />
                                        {couponOpen ? 'Hide coupon' : 'Have a coupon code?'}
                                    </button>

                                    {couponOpen && (
                                        <div className="flex gap-2 mt-3">
                                            <input
                                                value={coupon}
                                                onChange={e => setCoupon(e.target.value.toUpperCase())}
                                                placeholder="COUPON"
                                                className="
                                                    flex-1 bg-[#0a0a0a] border border-white/[0.08] rounded-xl
                                                    px-4 py-2.5 text-[12px] font-mono tracking-widest
                                                    text-white placeholder:text-white/20 placeholder:tracking-normal
                                                    outline-none focus:border-white/20 transition-colors
                                                "
                                            />
                                            <button className="px-4 py-2.5 text-[12px] font-semibold rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap">
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Active payment method preview */}
                                <div className="flex items-center gap-3 py-3.5 border-y border-white/[0.06]">
                                    <span className="w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center flex-shrink-0">
                                        <activeMethod.icon size={14} strokeWidth={1.5} />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.07em] font-semibold">
                                            Payment via
                                        </p>
                                        <p className="text-[13px] font-semibold">{activeMethod.label}</p>
                                    </div>
                                    <button
                                        onClick={() => document.querySelector('#payment-methods')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                        className="text-[11px] text-yellow-400/80 hover:text-yellow-400 font-semibold transition-colors cursor-pointer"
                                    >
                                        Change
                                    </button>
                                </div>

                                {/* Line items */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-white/40">
                                            Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})
                                        </span>
                                        <span className="font-mono text-[12px]">{formatPrice(total).idr}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-white/40">Platform fee</span>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-emerald-400">
                                            Free
                                        </span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-end pt-5 border-t border-white/[0.06]">
                                    <span className="text-[16px] font-semibold">Total</span>
                                    <div className="text-right">
                                        <p className="text-[28px] font-bold tracking-tight leading-none text-yellow-400">
                                            {formatPrice(total).idr}
                                        </p>
                                        <p className="text-[12px] font-mono text-white/30 mt-1.5">
                                            ≈ ${formatPrice(total).usd}
                                        </p>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-red-500/[0.06] border border-red-500/20">
                                        <X size={14} strokeWidth={2.5} className="text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-[13px] text-red-300/80 leading-relaxed">{error}</p>
                                    </div>
                                )}

                                {/* CTA Button (Desktop Only) */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className="
                                        hidden lg:flex w-full items-center justify-between
                                        px-6 py-4.5 rounded-xl font-bold text-[15px] tracking-tight
                                        bg-yellow-400 text-black
                                        hover:bg-yellow-300 disabled:bg-white/[0.08] disabled:text-white/20
                                        transition-all duration-150 cursor-pointer disabled:cursor-not-allowed
                                        hover:-translate-y-px active:translate-y-0 shadow-[0_8px_30px_rgb(250,204,21,0.1)]
                                    "
                                >
                                    <span className="flex items-center gap-2.5">
                                        {isProcessing && <Loader2 size={16} className="animate-spin" />}
                                        {isProcessing ? 'Processing…' : 'Place Order'}
                                    </span>
                                    {!isProcessing && (
                                        <span className="flex items-center gap-1.5 text-[12px] font-medium opacity-50">
                                            <Lock size={12} strokeWidth={2} />
                                            Secure
                                            <ChevronRight size={14} />
                                        </span>
                                    )}
                                </button>

                                {/* Trust row */}
                                <div className="flex items-center justify-center gap-4 pt-1">
                                    {[
                                        { icon: Lock, label: '256-bit SSL' },
                                        { icon: ShieldCheck, label: 'Midtrans' },
                                        { icon: Check, label: 'No data stored' },
                                    ].map(({ icon: Icon, label }) => (
                                        <div key={label} className="flex items-center gap-1 text-[9px] text-white/20 uppercase tracking-[0.05em]">
                                            <Icon size={9} strokeWidth={2} />
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Need help */}
                        <div className="flex items-center justify-center gap-2 text-[11px] text-white/20 hover:text-white/40 transition-colors py-1 cursor-pointer">
                            <span>Need help?</span>
                            <span className="text-yellow-400/60 font-semibold">Contact support</span>
                        </div>
                    </aside>

                </div>

                {/* Mobile Sticky Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/[0.08] px-6 py-5 safe-bottom">
                    <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-6">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 mb-0.5">Total Amount</p>
                            <p className="text-[20px] font-bold text-yellow-400 leading-none">{formatPrice(total).idr}</p>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="flex-1 bg-yellow-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg disabled:bg-white/[0.08] disabled:text-white/20"
                        >
                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Pay Now'}
                            {!isProcessing && <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            </div>
            {/* ── STATUS MODALS ── */}
            {checkoutStatus !== 'idle' && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                    onClick={() => { if (checkoutStatus === 'failed') setCheckoutStatus('idle'); }}
                >
                    <div
                        className="bg-[#111111] border border-white/[0.08] rounded-3xl max-w-sm w-full p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {checkoutStatus === 'success' && (
                            <>
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                    <Check size={32} strokeWidth={2.5} className="text-emerald-400" />
                                </div>
                                <h2 className="text-[24px] font-bold tracking-tight mb-3">Payment Successful</h2>
                                <p className="text-[14px] text-white/40 mb-10 leading-relaxed">
                                    Your order has been confirmed. You can now download your 3D assets from your invoices.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => router.push('/cart?tab=orders')}
                                        className="w-full py-4 bg-yellow-400 text-black text-[15px] font-bold rounded-2xl hover:bg-yellow-300 transition-colors cursor-pointer shadow-lg active:scale-[0.98]"
                                    >
                                        View invoices
                                    </button>
                                    <button
                                        onClick={() => router.push('/catalog')}
                                        className="w-full py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white/20 hover:text-white/50 transition-colors cursor-pointer"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </>
                        )}

                        {checkoutStatus === 'pending' && (
                            <>
                                <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                    <Loader2 size={32} className="text-yellow-400 animate-spin" />
                                </div>
                                <h2 className="text-[24px] font-bold tracking-tight mb-3">Payment Pending</h2>
                                <p className="text-[14px] text-white/40 mb-10 leading-relaxed">
                                    We're waiting for your payment to be processed. Please check your banking app to complete the transaction.
                                </p>
                                <button
                                    onClick={() => setCheckoutStatus('idle')}
                                    className="w-full py-4 bg-white/10 text-white text-[15px] font-bold rounded-2xl hover:bg-white/20 transition-colors cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </>
                        )}

                        {checkoutStatus === 'failed' && (
                            <>
                                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                    <X size={32} strokeWidth={2.5} className="text-red-400" />
                                </div>
                                <h2 className="text-[24px] font-bold tracking-tight mb-3">Payment Failed</h2>
                                <p className="text-[14px] text-white/40 mb-10 leading-relaxed">
                                    Something went wrong with the transaction. Please try again or use a different payment method.
                                </p>
                                <button
                                    onClick={() => setCheckoutStatus('idle')}
                                    className="w-full py-4 bg-red-500 text-white text-[15px] font-bold rounded-2xl hover:bg-red-600 transition-colors cursor-pointer"
                                >
                                    Try Again
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}