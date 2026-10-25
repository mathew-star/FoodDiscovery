import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    feed: { stale: 60, revalidate: 120, expire: 3_600 },
    city: { stale: 300, revalidate: 300, expire: 86_400 },
    branch: { stale: 300, revalidate: 600, expire: 86_400 },
    catalog: { stale: 300, revalidate: 900, expire: 86_400 },
    cuisine: { stale: 900, revalidate: 3_600, expire: 86_400 },
    config: { stale: 900, revalidate: 3_600, expire: 86_400 },
    search: { stale: 300, revalidate: 600, expire: 3_600 },
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
