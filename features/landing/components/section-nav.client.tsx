'use client';

import { useEffect, useState } from 'react';
import { NavPills, navPillClass } from '@/features/shell/components/nav-pills';
import { t, type MessageKey } from '@/i18n';

export const landingSections: { id: string; labelKey: MessageKey }[] = [
  { id: 'six-apps', labelKey: 'nav.problem' },
  { id: 'how-it-works', labelKey: 'nav.howItWorks' },
  { id: 'community', labelKey: 'nav.community' },
  { id: 'rules', labelKey: 'nav.houseRules' },
  { id: 'faq', labelKey: 'nav.faq' },
];

/** Centre pill nav that follows the section in view (DESIGN-SYSTEM §7.12). */
export function SectionNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const { id } of landingSections) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <NavPills aria-label={t('nav.sections')} className="hidden lg:flex">
      {landingSections.map(({ id, labelKey }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? 'location' : undefined}
          className={navPillClass(active === id)}
        >
          {t(labelKey)}
        </a>
      ))}
    </NavPills>
  );
}
