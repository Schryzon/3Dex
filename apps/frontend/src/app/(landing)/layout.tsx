import type { Metadata } from 'next';
import LandingShell from './LandingShell';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://3dex.example.com';

export const metadata: Metadata = {
  title: '3Dēx',
  description:
    'Discover printable 3D assets, connect with artists, and order professional 3D printing — all in one marketplace.',
  openGraph: {
    title: '3Dēx',
    description:
      'Discover printable 3D assets, connect with artists, and order professional 3D printing.',
    url: siteUrl,
    siteName: '3Dēx',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3Dēx',
    description:
      'Discover printable 3D assets, connect with artists, and order professional 3D printing.',
  },
  robots: { index: true, follow: true },
};

export default function LandingGroupLayout({ children }: { children: React.ReactNode }) {
  return <LandingShell>{children}</LandingShell>;
}
