import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: "3Dēx | 3D Marketplace",
  description: "The grandest 3D asset collection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
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