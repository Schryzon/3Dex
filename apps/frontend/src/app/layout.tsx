import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';

export const metadata: Metadata = {
  title: "3Dēx | 3D Marketplace",
  description: "3D asset collection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        <ReactQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
        <Script
          src="https://accounts.google.com/gsi/client"
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