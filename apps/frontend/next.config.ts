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
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.midtrans.com https://*.gtflabs.io https://pay.google.com https://gwk.gopayapi.com https://accounts.google.com https://api.3dex.studio; img-src 'self' blob: data: https://*.midtrans.com https://api.3dex.studio https://storage.3dex.studio https://lh3.googleusercontent.com https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos https://raw.githack.com https://raw.githubusercontent.com http://127.0.0.1:9000 http://localhost:9000 http://100.73.191.15:9000 http://localhost:4000 http://127.0.0.1:4000; connect-src 'self' https://api.3dex.studio https://storage.3dex.studio https://raw.githack.com https://raw.githubusercontent.com https://www.gstatic.com http://127.0.0.1:9000 http://localhost:9000 http://100.73.191.15:9000 http://localhost:4000 http://127.0.0.1:4000;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
