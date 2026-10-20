import type { Metadata, Viewport } from 'next';
import { Fraunces, Noto_Sans, Noto_Sans_Devanagari, Noto_Sans_Telugu } from 'next/font/google';
import { ServiceWorkerRegistration } from '@/features/shell/components/service-worker.client';
import { ThemeScript } from '@/features/shell/components/theme-script';
import { defaultLocale, t } from '@/i18n';
import { siteUrl } from '@/shared/config/site';
import { cn } from '@/shared/lib/cn';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'SOFT'],
  display: 'swap',
  variable: '--font-fraunces',
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans',
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans-telugu',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans-devanagari',
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
    { media: '(prefers-color-scheme: light)', color: '#fbf7f1' },
    { media: '(prefers-color-scheme: dark)', color: '#16110c' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={defaultLocale}
      suppressHydrationWarning
      className={cn(
        fraunces.variable,
        notoSans.variable,
        notoSansTelugu.variable,
        notoSansDevanagari.variable,
      )}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-sm bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {t('a11y.skipToContent')}
        </a>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
