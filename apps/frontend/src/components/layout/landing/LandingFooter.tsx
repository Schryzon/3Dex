import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 text-black flex items-center justify-center">
                <img src="/3Dex.svg" alt="3Dex" className="w-full h-full object-contain" />
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
                <Link href="/3d-models" className="text-gray-400 hover:text-white transition-colors">
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
                <Link href="/free-models" className="text-gray-400 hover:text-white transition-colors">
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
                <Link href="/terms-of-use" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">
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
                <Link href="/contact-us" className="text-gray-400 hover:text-white transition-colors">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="text-gray-400 hover:text-white transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <a href="mailto:3dexweb@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                  3dexweb@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">We accept</h3>
            <div className="space-y-3">
              {/* International */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-white px-2.5 py-1.5 rounded text-blue-600 font-bold text-[11px]">
                  PayPal
                </div>
                <div className="bg-white px-2.5 py-1.5 rounded text-[11px] font-bold text-blue-900">
                  VISA
                </div>
                <div className="bg-white px-2.5 py-1.5 rounded text-[11px] font-bold">
                  <span className="text-red-600">Master</span>
                  <span className="text-orange-500">Card</span>
                </div>
              </div>

              {/* Local (Indonesia) */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <div className="bg-[#ED2128] border border-white/10 px-2.5 py-1.5 rounded text-[11px] font-bold text-white shadow-sm shadow-[#ED2128]/20">
                  QRIS
                </div>
                <div className="bg-[#00AA13] px-2.5 py-1.5 rounded text-[11px] font-bold text-white tracking-wide shadow-sm shadow-[#00AA13]/20">
                  GoPay
                </div>
                <div className="bg-[#4C2A86] px-2.5 py-1.5 rounded text-[11px] font-bold text-white shadow-sm shadow-[#4C2A86]/20">
                  OVO
                </div>
                <div className="bg-[#005EAA] px-2.5 py-1.5 rounded text-[11px] font-bold text-white shadow-sm shadow-[#005EAA]/20">
                  BCA
                </div>
                <div className="bg-white px-2.5 py-1.5 rounded text-[11px] font-bold text-[#003D79] shadow-sm shadow-black/5 flex items-center">
                  mandiri
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
            © {new Date().getFullYear()} 3Dēx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}