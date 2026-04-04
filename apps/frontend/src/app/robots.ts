import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://3dex.studio';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/profile',
          '/admin',
          '/artist',
          '/provider',
          '/cart',
          '/checkout',
          '/orders',
          '/downloads',
          '/notifications',
          '/collections',
          '/saved',
          '/upload',
          '/apply',
          '/forbidden',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
