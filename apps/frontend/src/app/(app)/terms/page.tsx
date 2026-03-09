import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service | 3Dēx',
    description: 'Terms and conditions for using the 3Dēx platform.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#080808] text-white pt-24 pb-32">
            <div className="max-w-3xl mx-auto px-6">
                <div className="mb-12">
                    <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-white/40">Last updated: January 2026</p>
                </div>

                <div className="space-y-12 text-[15px] leading-relaxed text-white/70">
                    <section>
                        <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing and using 3Dēx (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">2. Digital Assets Library</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Standard License:</strong> Grants you the right to use the downloaded 3D models for personal and non-commercial projects.</li>
                            <li><strong>Commercial License:</strong> Grants you the right to use the models in commercial projects, games, and media, subject to the limitations defined in the specific asset's licensing agreement.</li>
                            <li><strong>Prohibited Uses:</strong> You may not resell, redistribute, or sub-license the raw 3D files.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">3. Artist & Provider Network</h2>
                        <p className="mb-4">
                            Users applying to become "Artists" (Model Uploaders) or "Providers" (3D Print Operators) must submit accurate verification documents. The Platform takes a standard flat-rate commission fee from all sales processed through the system.
                        </p>
                        <p>
                            Providers are responsible for the physical quality, shipping, and fulfillment of any Print Jobs accepted through the 3Dēx network.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">4. Payment Processing</h2>
                        <p className="mb-4">
                            All payments are securely processed by Midtrans. We do not store your credit card information on our servers. In the event of a dispute or failed printed job, refunds will be evaluated on a case-by-case basis.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                    <Link href="/" className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium">
                        &larr; Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
