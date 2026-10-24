import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inder } from 'next/font/google';
import Script from 'next/script';
import { vegOnlyBootScript } from '@/features/dishes/lib/veg-only';
import { ServiceWorkerRegistration } from '@/features/shell/components/service-worker.client';
import { defaultLocale, t } from '@/i18n';
import { siteUrl } from '@/shared/config/site';
import { cn } from '@/shared/lib/cn';
import { ToastProvider } from '@/shared/ui/toast.client';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-bricolage',
});

const inder = Inder({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-inder' });

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
  colorScheme: 'light',
  themeColor: '#ecebc9',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning className={cn(bricolage.variable, inder.variable)}>
      <head>
        <Script
          id="fdn-diet"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: vegOnlyBootScript }}
        />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-[70] rounded-full border-2 border-ink bg-ink px-4 py-2 text-sm text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t('a11y.skipToContent')}
        </a>
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
