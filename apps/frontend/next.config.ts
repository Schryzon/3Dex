import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  async redirects() {
    return [
      {
        source: '/model',
        destination: '/catalog',
        permanent: true,
      },
      {
        source: '/wishlist',
        destination: '/collections',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.midtrans.com https://*.gtflabs.io https://pay.google.com https://gwk.gopayapi.com https://accounts.google.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
