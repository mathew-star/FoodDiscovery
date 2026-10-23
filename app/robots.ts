import type { MetadataRoute } from 'next';
import { siteUrl } from '@/shared/config/site';

const privatePaths = [
  '/admin',
  '/login',
  '/onboarding',
  '/post/new',
  '/rate/',
  '/saved',
  '/notifications',
  '/settings',
  '/api/',
  '/offline',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: privatePaths },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
  };
}
