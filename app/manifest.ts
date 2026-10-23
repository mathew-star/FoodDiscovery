import type { MetadataRoute } from 'next';
import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: `${t('app.name')} · ${t('app.fullName')}`,
    short_name: t('app.name'),
    description: t('app.description'),
    start_url: `/${defaultCity}`,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fbf7f1',
    theme_color: '#b4410f',
    lang: 'en-IN',
    categories: ['food', 'lifestyle', 'social'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
