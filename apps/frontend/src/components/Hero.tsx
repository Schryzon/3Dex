import Link from 'next/link';

interface HeroProps {
  backgroundImage?: string;
  stats?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function Hero({
  backgroundImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920",
  stats = "1.8M",
  title = "The grandest 3D asset collection",
  subtitle = "Trusted by over",
  description = "Manage and distribute your 3D Models and Textures assets. Elevate your CG art to a higher level with our top-notch quality content!",
  ctaText = "Join for free",
  ctaHref = "/register"
}: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.4)'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Stats Badge */}
        <div className="inline-flex items-center gap-2 mb-8 text-white/90">
          <span className="text-lg">{subtitle}</span>
          <span className="px-3 py-1 bg-yellow-400 text-black font-bold rounded">
            {stats}
          </span>
          <span className="text-lg">creators monthly</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-4xl mx-auto leading-relaxed">
          {description}
        </p>

        {/* CTA Button */}
        <Link
          href={ctaHref}
          className="inline-block px-12 py-4 bg-yellow-400 text-black font-bold text-lg rounded-full hover:bg-yellow-300 transition-all hover:scale-105 shadow-2xl"
        >
          {ctaText}
        </Link>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}