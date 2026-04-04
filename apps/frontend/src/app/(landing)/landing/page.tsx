import type { Metadata } from 'next';
import LandingPageContent from '@/features/home/components/LandingPageContent';

export const metadata: Metadata = {
  title: '3Dēx',
  description:
    'Browse curated 3D assets, textures, and print services.',
  alternates: {
    canonical: '/',
  },
  robots: { index: true, follow: true },
};

export default function LandingCanonicalPage() {
  return <LandingPageContent />;
}
