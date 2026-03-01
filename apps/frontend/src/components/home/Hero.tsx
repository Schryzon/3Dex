'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';

const HERO_IMAGE = "url('https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1920&q=85')";

function fadeIn(visible: boolean, delay: number): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  };
}

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: HERO_IMAGE }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10 pt-20 pb-20">

        <div className="flex items-center gap-2 mb-2" style={fadeIn(visible, 0)}>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-yellow-400">
            The 3D Asset Marketplace
          </span>
          <span className="w-12 h-px bg-yellow-400/50" />
        </div>

        <h1
          className="text-5xl sm:text-6xl xl:text-7xl font-extrabold text-white leading-[1.06] tracking-tight mb-6 max-w-2xl"
          style={fadeIn(visible, 0.1)}>
          Buy, sell &<br/>
          own premium<br/>
          <span className="text-yellow-400">3D assets.</span>
        </h1>

        <p
          className="text-base md:text-lg text-white/70 max-w-lg leading-relaxed mb-10"
          style={fadeIn(visible, 0.22)}>
          From game-ready models to studio-quality textures — discover, trade, and distribute
          3D assets with the community that powers modern digital creation.
        </p>

        <div className="flex flex-wrap gap-3 mb-14" style={fadeIn(visible, 0.34)}>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-black bg-yellow-400 hover:bg-yellow-300 transition-all duration-300 hover:scale-[1.04] hover:shadow-lg hover:shadow-yellow-400/30">
            <ShoppingBag className="w-4 h-4" />
            Browse Catalog
          </Link>

          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white border border-white/20 hover:border-white/40 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.04]">
            Start Selling
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

    </section>
  );
}