import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/features/auth';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://3dex.studio';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: '3Dēx | The 3D Asset Marketplace',
    template: '%s | 3Dēx',
  },
  description:
    'The premier marketplace for high-quality 3D assets. Discover, buy, and sell game-ready models, textures, and HDRI maps or commission on-demand 3D printing from verified local providers.',
  keywords: [
    '3D models', '3D assets', '3D marketplace', 'buy 3D models',
    '3D printing service', 'textures', 'HDRI', 'game assets',
    'architectural models', '3D asset store',
  ],
  authors: [{ name: '3Dex Team' }],
  creator: '3Dex',
  publisher: '3Dex',
  icons: {
    icon: '/3Dex.svg',
    shortcut: '/3Dex.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: '3Dēx',
    title: '3Dēx | The 3D Asset Marketplace',
    description:
      'The premier marketplace for high-quality 3D assets. Discover, buy, and sell game-ready models, textures, and HDRI maps or commission on-demand 3D printing from verified local providers.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '3Dex - The 3D Asset Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '3Dēx | The 3D Asset Marketplace',
    description:
      'Discover, buy, and sell premium 3D assets. Access game-ready models, studio-quality textures, and on-demand 3D printing all in one place.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="bottom-right"/>
          </AuthProvider>
        </ReactQueryProvider>
        <Script
          src="https://accounts.google.com/gsi/client?hl=en"
          strategy="afterInteractive"
        />
        <Script
          src={process.env.NODE_ENV === 'production'
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"}
          data-client-key={process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_PROD_MIDTRANS_CLIENT_KEY
            : process.env.NEXT_PUBLIC_SB_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}