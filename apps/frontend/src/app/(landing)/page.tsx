'use client';

import Hero from '@/components/home/Hero';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import SocialProof from '@/components/home/SocialProof';
import PopularModels from '@/components/home/PopularModels';
import HowItWorks from '@/components/home/HowItWorks';
import BecomeArtist from '@/components/home/BecomeArtist';
import FeaturesSection from '@/components/home/FeaturesSection';

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
