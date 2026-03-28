import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

export default function ComingSoonPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-lg w-full bg-[#111] border border-gray-800 rounded-3xl p-10 md:p-14 text-center shadow-2xl">
                <div className="w-20 h-20 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-yellow-400/20">
                    <Construction className="w-10 h-10 text-yellow-400" />
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    Coming <span className="text-yellow-400">Soon</span>
                </h1>

                <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                    This page is currently under development. We're working hard to bring it to you as soon as possible!
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
