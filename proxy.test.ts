import { describe, expect, it } from 'vitest';
import { config } from './proxy';

const pattern = new RegExp(`^${config.matcher[0] ?? ''}$`);

describe('proxy matcher', () => {
  it.each(['/mumbai', '/mumbai/search', '/wp-login.php', '/hyderabadx', '/battlesx'])(
    'treats %s as unknown',
    (path) => {
      expect(pattern.test(path)).toBe(true);
    },
  );

  it.each([
    '/',
    '/hyderabad',
    '/hyderabad/search',
    '/hyderabad/dish/haleem',
    '/r/pista-house-shalibanda',
    '/p/123/haleem',
    '/c/biryani',
    '/u/foodie',
    '/lists/1/top-biryani',
    '/battles',
    '/battles/1/haleem',
    '/communities',
    '/about',
    '/guidelines',
    '/offline',
    '/login',
    '/onboarding',
    '/post/new',
    '/rate/pista-house-shalibanda',
    '/saved',
    '/notifications',
    '/settings',
    '/admin',
    '/admin/queues',
    '/api/auth/session',
    '/_next/static/chunk.js',
    '/manifest.webmanifest',
    '/robots.txt',
    '/sitemap.xml',
    '/sw.js',
    '/icons/icon-192.png',
    '/icon.svg',
    '/apple-icon.png',
  ])('lets %s through', (path) => {
    expect(pattern.test(path)).toBe(false);
  });
});
