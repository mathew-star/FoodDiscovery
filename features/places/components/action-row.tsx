import { Navigation, Phone } from 'lucide-react';
import { TrackedAnchor } from '@/features/analytics/components/tracked-anchor.client';
import { SaveButton } from '@/features/saves/components/save-button.client';
import { t } from '@/i18n';
import { googleMapsDirectionsUrl, type LatLng } from '@/shared/lib/geo';
import { buttonVariants } from '@/shared/ui/button';
import { ShareButton } from './share-button.client';

type ActionRowProps = {
  branchId: string;
  name: string;
  locality: string;
  path: string;
  location: LatLng;
  phone: string | null;
};

/** Directions, call and share are never gated (DESIGN-SYSTEM §9.1). */
export function ActionRow({ branchId, name, locality, path, location, phone }: ActionRowProps) {
  return (
    <div role="group" aria-label={t('place.actions')} className="flex flex-wrap gap-2">
      <TrackedAnchor
        event={{ name: 'directions_click', branchId, surface: 'branch' }}
        href={googleMapsDirectionsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: 'dark' })}
      >
        <Navigation aria-hidden="true" />
        {t('place.directions')}
      </TrackedAnchor>
      {phone ? (
        <TrackedAnchor
          event={{ name: 'call_click', branchId, surface: 'branch' }}
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className={buttonVariants({ variant: 'outline' })}
        >
          <Phone aria-hidden="true" />
          {t('place.call')}
        </TrackedAnchor>
      ) : null}
      <ShareButton title={name} path={path} analytics={{ surface: 'branch', branchId }} />
      <SaveButton
        surface="branch"
        item={{ kind: 'branch', id: branchId, branchId, name, detail: locality, href: path, diet: null }}
      />
    </div>
  );
}
