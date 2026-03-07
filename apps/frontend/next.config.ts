import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "../../",
  },
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
};

export default nextConfig;
