import { Navigation, Phone } from 'lucide-react';
import { t } from '@/i18n';
import { googleMapsDirectionsUrl, type LatLng } from '@/shared/lib/geo';
import { buttonVariants } from '@/shared/ui/button';
import { ShareButton } from './share-button.client';

type ActionRowProps = { name: string; path: string; location: LatLng; phone: string | null };

/** Directions, call and share are never gated (DESIGN-SYSTEM §9.1). */
export function ActionRow({ name, path, location, phone }: ActionRowProps) {
  return (
    <div role="group" aria-label={t('place.actions')} className="flex flex-wrap gap-2">
      <a
        href={googleMapsDirectionsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: 'dark' })}
      >
        <Navigation aria-hidden="true" />
        {t('place.directions')}
      </a>
      {phone ? (
        <a href={`tel:${phone.replace(/\s+/g, '')}`} className={buttonVariants({ variant: 'outline' })}>
          <Phone aria-hidden="true" />
          {t('place.call')}
        </a>
      ) : null}
      <ShareButton title={name} path={path} />
    </div>
  );
}
