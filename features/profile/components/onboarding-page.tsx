import { redirect } from 'next/navigation';
import { AuthCard } from '@/features/auth/components/auth-card';
import { getLocalities } from '@/features/geo/queries/geo';
import { defaultCity } from '@/features/geo/schemas/city';
import { getCuisineOptions } from '@/features/places/queries/branches';
import { t } from '@/i18n';
import { safeNextPath } from '@/shared/lib/safe-next';
import { getUsernameSuggestion } from '../queries/username';
import { getViewer } from '../queries/viewer';
import { OnboardingForm } from './onboarding-form.client';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Spec E1-3. Guests go to sign in; finished members go straight on to where they were heading. */
export async function OnboardingPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).next;
  const next = safeNextPath(Array.isArray(raw) ? raw[0] : raw);
  const viewer = await getViewer();
  if (!viewer)
    redirect(`/login?${new URLSearchParams({ next: `/onboarding?${new URLSearchParams({ next })}` })}`);
  if (viewer.profile?.onboardedAt) redirect(next);

  const [cuisines, localities, username] = await Promise.all([
    getCuisineOptions(),
    getLocalities(defaultCity),
    getUsernameSuggestion(viewer.name),
  ]);
  return (
    <AuthCard title={t('profile.onboarding.title')} intro={t('profile.onboarding.intro')}>
      <OnboardingForm
        next={next}
        defaults={{ displayName: viewer.name, username }}
        cuisines={cuisines}
        localities={localities.map(({ slug, name }) => ({ slug, name }))}
      />
    </AuthCard>
  );
}
