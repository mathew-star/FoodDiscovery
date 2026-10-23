import type { Metadata, Viewport } from 'next';
import { Anek_Devanagari, Anek_Latin, Anek_Telugu, Hind, Hind_Guntur, Martian_Mono } from 'next/font/google';
import { ServiceWorkerRegistration } from '@/features/shell/components/service-worker.client';
import { ThemeScript } from '@/features/shell/components/theme-script';
import { MotionRoot } from '@/shared/ui/motion.client';
import { defaultLocale, t } from '@/i18n';
import { siteUrl } from '@/shared/config/site';
import { cn } from '@/shared/lib/cn';
import './globals.css';

const anek = Anek_Latin({ subsets: ['latin'], axes: ['wdth'], display: 'swap', variable: '--font-anek' });
const anekTelugu = Anek_Telugu({
  subsets: ['telugu'],
  axes: ['wdth'],
  display: 'swap',
  preload: false,
  variable: '--font-anek-telugu',
});
const anekDevanagari = Anek_Devanagari({
  subsets: ['devanagari'],
  axes: ['wdth'],
  display: 'swap',
  preload: false,
  variable: '--font-anek-devanagari',
});
const hind = Hind({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-hind',
});
const hindGuntur = Hind_Guntur({
  subsets: ['telugu'],
  weight: ['400', '600'],
  display: 'swap',
  preload: false,
  variable: '--font-hind-guntur',
});
const martian = Martian_Mono({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-martian',
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: `${t('app.name')} · ${t('app.fullName')}`, template: `%s · ${t('app.name')}` },
  description: t('app.description'),
  applicationName: t('app.name'),
  openGraph: { siteName: t('app.name'), type: 'website', locale: 'en_IN' },
  appleWebApp: { capable: true, title: t('app.name'), statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4eee1' },
    { media: '(prefers-color-scheme: dark)', color: '#111220' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={defaultLocale}
      suppressHydrationWarning
      className={cn(
        anek.variable,
        anekTelugu.variable,
        anekDevanagari.variable,
        hind.variable,
        hindGuntur.variable,
        martian.variable,
      )}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="grain flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 bg-ink px-4 py-2 font-semibold text-on-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {t('a11y.skipToContent')}
        </a>
        <MotionRoot>{children}</MotionRoot>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
