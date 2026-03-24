'use client';

import Hero from '@/features/home/components/Hero';
import FeaturedCategories from '@/features/home/components/FeaturedCategories';
import SocialProof from '@/features/home/components/SocialProof';
import PopularModels from '@/features/home/components/PopularModels';
import HowItWorks from '@/features/home/components/HowItWorks';
import BecomeArtist from '@/features/home/components/BecomeArtist';
import FeaturesSection from '@/features/home/components/FeaturesSection';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <SocialProof />       {/* "Works with" tool marquee strip */}
      <PopularModels />
      <HowItWorks />
      <BecomeArtist />      {/* Restored: Become an Artist CTA */}
      <FeaturesSection />
    </>
  );
}
