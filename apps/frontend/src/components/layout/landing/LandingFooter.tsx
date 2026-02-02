import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-400 text-black flex items-center justify-center font-black text-2xl rounded">
                R
              </div>
              <span className="text-white font-bold text-2xl">3Dēx</span>
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
                <a href="mailto:support@3dex.com" className="text-gray-400 hover:text-white transition-colors">
                  support@3dex.com
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">We accept</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-white px-3 py-2 rounded text-blue-600 font-bold text-sm">
                  PayPal
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-white px-3 py-2 rounded text-xs font-bold text-blue-900">
                  VISA
                </div>
                <div className="bg-white px-3 py-2 rounded text-xs font-bold">
                  <span className="text-red-600">Master</span>
                  <span className="text-orange-500">Card</span>
                </div>
                <div className="bg-blue-400 px-3 py-2 rounded text-xs font-bold text-white">
                  AMEX
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-gray-400 text-sm text-center">
            © 2024 3Dēx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}