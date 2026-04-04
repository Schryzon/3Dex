import { Mail, MessageSquare, Phone } from 'lucide-react';
import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

export default function ContactUsPage() {
  return (
    <StaticPageLayout title="Contact Us" lastUpdated="March 29, 2026">
      <p className="mb-12 text-lg text-gray-400">
        Have questions? We're here to help. Reach out through any of the channels below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center hover:border-emerald-500/50 transition-colors">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Email</h3>
          <p className="text-gray-400 text-sm">3dexweb@gmail.com</p>
        </div>

        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center hover:border-emerald-500/50 transition-colors">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mx-auto mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Support Ticket</h3>
          <p className="text-gray-400 text-sm">Response within 24h</p>
        </div>

        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center hover:border-emerald-500/50 transition-colors">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mx-auto mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Phone</h3>
          <p className="text-gray-400 text-sm">+1 (555) 3DEX-HELP</p>
        </div>
      </div>

      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
        <div className="space-y-4">
          <p className="text-gray-400 italic">
            This contact form is a placeholder. For actual inquiries, please email us directly.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/50 border border-gray-800 h-12 rounded-lg px-4 flex items-center text-gray-600">Your Name</div>
            <div className="bg-black/50 border border-gray-800 h-12 rounded-lg px-4 flex items-center text-gray-600">Email Address</div>
          </div>
          <div className="bg-black/50 border border-gray-800 h-32 rounded-lg px-4 py-3 text-gray-600">Message Content...</div>
          <button className="bg-white text-black h-12 px-8 rounded-lg font-bold">
            Send Message
          </button>
        </div>
      </div>
    </StaticPageLayout>
  );
}
