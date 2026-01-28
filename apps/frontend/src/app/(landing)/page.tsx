import Hero from '@/components/home/Hero';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import PopularModels from '@/components/home/PopularModels';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturesSection from '@/components/home/FeaturesSection';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <PopularModels />
      <HowItWorks />
      <FeaturesSection />
    </>
  );
}
