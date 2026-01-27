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
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 text-center pt-20">
        {/* Stats Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-6 md:mb-8 text-white">
          <span className="text-base md:text-lg">Trusted by over</span>
          <span className="px-3 md:px-4 py-1 bg-yellow-400 text-black font-bold rounded text-base md:text-lg">
            1.8M
          </span>
          <span className="text-base md:text-lg">creators monthly</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight px-2">
          The grandest 3D asset<br />collection
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
          Manage and distribute your 3D Models and Textures assets. Elevate your CG art to a higher level with our top-notch quality content!
        </p>

        {/* CTA Button */}
        <Link
          href="/catalog"
          className="inline-block px-8 md:px-12 py-3 md:py-4 bg-yellow-400 text-black font-bold text-base md:text-lg rounded-full hover:bg-yellow-300 transition-all hover:scale-105 shadow-2xl cursor-pointer"
        >
          Browse Models
        </Link>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}