import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

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
      {
        source: '/downloads',
        destination: '/library?tab=purchases',
        permanent: true,
      },
      {
        source: '/saved',
        destination: '/library?tab=wishlist',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Cache static assets (images, fonts, 3d models, media, etc.)
        source: "/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|glb|gltf|woff|woff2|ttf|otf|mp4|webm|zip|rar)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' https://*.midtrans.com https://*.gtflabs.io https://pay.google.com https://gwk.gopayapi.com https://accounts.google.com https://api.3dex.studio https://www.gstatic.com https://cdn.jsdelivr.net https://unpkg.com; img-src 'self' blob: data: https://*.midtrans.com https://api.3dex.studio https://storage.3dex.studio https://lh3.googleusercontent.com https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos https://raw.githack.com https://raw.githubusercontent.com https://github.com https://avatars.githubusercontent.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org http://127.0.0.1:9000 http://localhost:9000 http://localhost:4000 http://127.0.0.1:4000 ${process.env.NEXT_PUBLIC_API_URL || ''} ${process.env.NEXT_PUBLIC_MINIO_URL || ''}; connect-src 'self' blob: https://api.3dex.studio https://storage.3dex.studio https://raw.githack.com https://raw.githubusercontent.com https://www.gstatic.com https://cdn.jsdelivr.net https://photon.komoot.io https://nominatim.openstreetmap.org http://127.0.0.1:9000 http://localhost:9000 http://localhost:4000 http://127.0.0.1:4000 ${process.env.NEXT_PUBLIC_API_URL || ''} ${process.env.NEXT_PUBLIC_MINIO_URL || ''}; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://*.midtrans.com https://pay.google.com https://accounts.google.com https://www.google.com; object-src 'none'; base-uri 'self';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
