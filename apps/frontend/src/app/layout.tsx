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

export const metadata: Metadata = {
  title: "3Dēx",
  description: "3D asset marketplace and printing service",
  icons: {
    icon: "/3Dex.svg",
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
            <Toaster position="bottom-right" />
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
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}