'use client';

import { Star } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useMemberSaves } from '@/features/saves/hooks/use-member-saves';
import { useSignInPrompt } from '@/features/shell/hooks/use-sign-in-prompt';
import { t } from '@/i18n';
import { Button, type ButtonProps } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog.client';
import { useToast } from '@/shared/ui/toast.client';
import { loadRateSheetAction, type RateSheetData } from '../server/actions';
import { RateSheet } from './rate-sheet.client';

type RateButtonProps = {
  branchId: string;
  branchName: string;
  /** Start the sheet on this dish (branch dish page). */
  dishId?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
};

// `?rate=1` (or `?rate=<dish id>`) on the return path reopens the sheet after sign-in (spec W2.5).
const resumeParam = 'rate';

function resumePath(dishId?: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(resumeParam, dishId ?? '1');
  return `${url.pathname}${url.search}`;
}

export function RateButton({ branchId, branchName, dishId, variant = 'dark', size }: RateButtonProps) {
  const member = useMemberSaves();
  const prompt = useSignInPrompt();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<RateSheetData | null>(null);
  const [startDish, setStartDish] = useState<string | undefined>(dishId);
  const resumed = useRef(false);

  function showSheet(result: Awaited<ReturnType<typeof loadRateSheetAction>>, initialDish?: string) {
    if (!result.ok && result.error.code === 'unauthenticated') {
      prompt(t('intent.rate'), resumePath(dishId));
      return;
    }
    if (!result.ok) {
      toast({ message: t('ratings.sheet.failed') });
      return;
    }
    setStartDish(initialDish ?? dishId);
    setData(result.data);
    setOpen(true);
  }

  async function openSheet() {
    showSheet(await loadRateSheetAction(branchId));
  }

  const onResumeLoaded = useEffectEvent(
    (result: Awaited<ReturnType<typeof loadRateSheetAction>>, initialDish?: string) =>
      showSheet(result, initialDish),
  );

  // After sign-in the member flag arrives; a `?rate=` marker then reopens the sheet once.
  useEffect(() => {
    if (!member.signedIn || resumed.current) return;
    const url = new URL(window.location.href);
    const resume = url.searchParams.get(resumeParam);
    if (!resume) return;
    let cancelled = false;
    void loadRateSheetAction(branchId).then((result) => {
      if (cancelled) return;
      // Marked only once loaded, so a strict-mode double effect still opens the sheet.
      resumed.current = true;
      url.searchParams.delete(resumeParam);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      onResumeLoaded(result, resume === '1' ? undefined : resume);
    });
    return () => {
      cancelled = true;
    };
  }, [member.signedIn, branchId]);

  // The server decides who is signed in: the header's member flag may not have arrived yet.
  function onClick() {
    void openSheet();
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={onClick}>
        <Star aria-hidden="true" />
        {t('ratings.rate')}
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        variant="sheet"
        title={t('ratings.sheet.title', { place: branchName })}
        description={t('ratings.sheet.description')}
        closeLabel={t('common.close')}
      >
        {data ? (
          <RateSheet
            key={startDish ?? 'all'}
            branchId={branchId}
            branchName={branchName}
            data={data}
            initialDishId={startDish}
            onDone={() => setOpen(false)}
          />
        ) : null}
      </Dialog>
    </>
  );
}
