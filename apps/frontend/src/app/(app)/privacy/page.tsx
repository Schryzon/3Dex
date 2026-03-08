import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy | 3Dēx',
    description: 'How we collect and use your data.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#080808] text-white pt-24 pb-32">
            <div className="max-w-3xl mx-auto px-6">
                <div className="mb-12">
                    <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-white/40">Last updated: January 2026</p>
                </div>

                <div className="space-y-12 text-[15px] leading-relaxed text-white/70">
                    <section>
                        <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">1. Information We Collect</h2>
                        <p className="mb-4">
                            When you use the 3Dēx platform, we may collect the following information:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Account Information:</strong> Email address, name, and chosen username.</li>
                            <li><strong>Payment Data:</strong> Billing details provided during checkout (Processed by Midtrans).</li>
                            <li><strong>Verification Documents:</strong> Identity or portfolio files exclusively for "Artist" and "Provider" applications (stored securely).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">2. How We Use Your Data</h2>
                        <p className="mb-4">
                            We use the collected information to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Process your purchases and print service requests.</li>
                            <li>Facilitate the community feed and artist interactions.</li>
                            <li>Send important notifications regarding your orders and account security.</li>
                            <li>Improve our platform's algorithms and catalog recommendations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">3. Data Sharing and Third Parties</h2>
                        <p className="mb-4">
                            We <strong>do not sell</strong> your personal information. We only share necessary data with trusted third parties required to operate our service, primarily our payment gateway (Midtrans) and our cloud hosting services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">4. Cookies and Tracking</h2>
                        <p className="mb-4">
                            3Dēx uses standard session cookies and local storage to keep you logged in and preserve your shopping cart state.
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
