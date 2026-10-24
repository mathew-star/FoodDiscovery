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
        className="mx-auto w-full max-w-[1200px] flex-1 px-5 pt-8 pb-16 md:px-10 md:pb-24"
      >
        {children}
      </main>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
