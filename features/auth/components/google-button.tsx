import { t } from '@/i18n';
import { Badge } from '@/shared/ui/badge';
import { buttonVariants } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';

/** D1: Google sign-in is not live yet, so the button is shown but disabled with a "soon" tag. */
export function GoogleButton() {
  return (
    <button
      type="button"
      disabled
      aria-describedby="google-soon"
      className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center disabled:opacity-60')}
    >
      {t('auth.google')}
      <Badge id="google-soon" tone="neutral">
        {t('auth.soon')}
      </Badge>
    </button>
  );
}

export function OrDivider() {
  return (
    <p className="flex items-center gap-3 text-xs text-inkMuted" aria-hidden="true">
      <span className="h-0 grow border-t-2 border-dashed border-ink/25" />
      {t('auth.or')}
      <span className="h-0 grow border-t-2 border-dashed border-ink/25" />
    </p>
  );
}
