import { defaultCity } from '@/features/geo/schemas/city';
import { BottomNav } from '@/features/shell/components/bottom-nav.client';
import { SiteFooter } from '@/features/shell/components/site-footer';
import { TopBar } from '@/features/shell/components/top-bar';

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <TopBar city={defaultCity} />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-6 pb-24 md:px-6 lg:pb-12"
      >
        {children}
      </main>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
