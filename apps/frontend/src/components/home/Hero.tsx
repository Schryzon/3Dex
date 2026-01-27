'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-20">
        {/* Stats Badge */}
        <div className="inline-flex items-center gap-2 mb-8 text-white">
          <span className="text-lg">Trusted by over</span>
          <span className="px-4 py-1 bg-yellow-400 text-black font-bold rounded text-lg">
            1.8M
          </span>
          <span className="text-lg">creators monthly</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          The grandest 3D asset<br />collection
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
          Manage and distribute your 3D Models and Textures assets. Elevate your CG art to a higher level with our top-notch quality content!
        </p>

        {/* CTA Button */}
        <Link
          href="/catalog"
          className="inline-block px-12 py-4 bg-yellow-400 text-black font-bold text-lg rounded-full hover:bg-yellow-300 transition-all hover:scale-105 shadow-2xl"
        >
          Browse Models
        </Link>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}