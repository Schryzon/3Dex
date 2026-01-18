import Link from 'next/link';
import { CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-black text-2xl">
                R
              </div>
              <span className="text-yellow-400 font-bold text-3xl">3Dex</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect and access the best 3D resources
            </p>
          </div>

          {/* Contents */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contents</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/models" className="text-gray-400 hover:text-white transition-colors">
                  3D Models
                </Link>
              </li>
              <li>
                <Link href="/textures" className="text-gray-400 hover:text-white transition-colors">
                  Textures
                </Link>
              </li>
              <li>
                <Link href="/hdri" className="text-gray-400 hover:text-white transition-colors">
                  HDRI
                </Link>
              </li>
              <li>
                <Link href="/free" className="text-gray-400 hover:text-white transition-colors">
                  Free 3D models
                </Link>
              </li>
            </ul>
          </div>

          {/* Agreements */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Agreements</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/license" className="text-gray-400 hover:text-white transition-colors">
                  License
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <a href="mailto:www.relebook@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                  www.relebook@gmail.com
                </a>
              </li>
              <li>
                <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                  sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Download / Payment */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Download</h3>
            <p className="text-gray-400 text-sm mb-4">
              Individual materials can be paid
            </p>
            <p className="text-gray-400 text-sm mb-4">We accept:</p>
            
            {/* Payment Methods */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-white px-3 py-2 rounded">
                  <span className="text-blue-600 font-bold text-sm">PayPal</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-white px-3 py-2 rounded text-xs font-bold text-blue-900">
                  VISA
                </div>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 px-3 py-2 rounded">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-red-600 rounded-full" />
                    <div className="w-4 h-4 bg-orange-500 rounded-full -ml-2" />
                  </div>
                </div>
                <div className="bg-blue-400 px-3 py-2 rounded text-xs font-bold text-white">
                  AMEX
                </div>
                <div className="bg-blue-600 px-3 py-2 rounded text-xs font-bold text-white">
                  UnionPay
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Cookie Notice */}
      <div className="border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black">
              R
            </div>
            <span className="text-yellow-400 font-bold">ReleBook</span>
          </div>
          <p className="text-gray-400 text-sm">
            Using relebook.com means that you agree to the use of cookies. You can find detailed information about how we use cookies in our{' '}
            <Link href="/cookies" className="text-white underline hover:text-yellow-400">
              Cookie Policy
            </Link>
            .
          </p>
          <button className="px-6 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 transition-colors">
            Got it!
          </button>
        </div>
      </div>
    </footer>
  );
}