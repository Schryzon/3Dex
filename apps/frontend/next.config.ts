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
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.midtrans.com https://*.gtflabs.io https://pay.google.com https://gwk.gopayapi.com https://accounts.google.com https://api.3dex.studio; img-src 'self' blob: data: https://*.midtrans.com https://api.3dex.studio https://storage.3dex.studio https://lh3.googleusercontent.com https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos; connect-src 'self' https://api.3dex.studio https://storage.3dex.studio;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
