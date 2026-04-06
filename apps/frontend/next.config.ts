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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' https://*.midtrans.com https://*.gtflabs.io https://pay.google.com https://gwk.gopayapi.com https://accounts.google.com https://api.3dex.studio https://www.gstatic.com https://cdn.jsdelivr.net; img-src 'self' blob: data: https://*.midtrans.com https://api.3dex.studio https://storage.3dex.studio https://lh3.googleusercontent.com https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos https://raw.githack.com https://raw.githubusercontent.com https://github.com https://avatars.githubusercontent.com http://127.0.0.1:9000 http://localhost:9000 http://100.73.191.15:9000 http://localhost:4000 http://127.0.0.1:4000; connect-src 'self' blob: https://api.3dex.studio https://storage.3dex.studio https://raw.githack.com https://raw.githubusercontent.com https://www.gstatic.com https://cdn.jsdelivr.net http://127.0.0.1:9000 http://localhost:9000 http://100.73.191.15:9000 http://localhost:4000 http://127.0.0.1:4000; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://*.midtrans.com https://pay.google.com https://accounts.google.com; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
