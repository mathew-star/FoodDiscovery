'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState, useTransition, type FormEvent } from 'react';
import { DietMark } from '@/features/dishes/components/diet-mark';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ChipButton } from '@/shared/ui/chip';
import type { RateSheetData } from '../server/actions';
import { rateBranchAction } from '../server/actions';
import { maxDishesPerSubmission, maxNewDishesPerSubmission } from '../schemas/rate-input';
import { sentimentLabelKey, sentiments, type Sentiment } from '../schemas/sentiment';
import { verdictFill } from './verdict-pill';

type Aspect = 'good' | 'okay' | 'poor';
type Aspects = {
  value: Aspect | null;
  service: Aspect | null;
  ambience: Aspect | null;
  wouldReturn: boolean | null;
};

const aspectFields = [
  ['value', 'ratings.sheet.value'],
  ['service', 'ratings.sheet.service'],
  ['ambience', 'ratings.sheet.ambience'],
] as const satisfies readonly (readonly [keyof Aspects, MessageKey])[];
const aspectAnswers: readonly Aspect[] = ['good', 'okay', 'poor'];
const aspectLabel: Record<Aspect, MessageKey> = {
  good: 'ratings.sheet.good',
  okay: 'ratings.sheet.okay',
  poor: 'ratings.sheet.poor',
};
const chipLimit = 12;
const dietOptions: readonly Diet[] = ['veg', 'egg', 'nonveg'];
const dietLabel: Record<Diet, MessageKey> = { veg: 'diet.veg', egg: 'diet.egg', nonveg: 'diet.nonveg' };

type Diet = 'veg' | 'egg' | 'nonveg';
/** A dish the member ate that is not on this menu yet (docs/CONTRIBUTIONS.md §5.2). */
type AddedDish = {
  key: string;
  name: string;
  diet: Diet | null;
  rupees: string;
  sentiment: Sentiment | null;
};

const sameName = (a: string, b: string) =>
  a.trim().toLowerCase().replace(/\s+/g, ' ') === b.trim().toLowerCase().replace(/\s+/g, ' ');

type RateSheetProps = {
  branchId: string;
  branchName: string;
  data: RateSheetData;
  /** Dish to start with, from a dish page or a resumed intent. */
  initialDishId?: string;
  onDone: () => void;
};

/** Spec W3: tap the dishes you ate, give each a verdict, optionally rate the place. Under 20 s. */
export function RateSheet({ branchId, branchName, data, initialDishId, onDone }: RateSheetProps) {
  const [verdicts, setVerdicts] = useState<Map<string, Sentiment>>(() => {
    const start = new Map(data.mine.dishes.map((row) => [row.branchDishId, row.sentiment]));
    return start;
  });
  const [selected, setSelected] = useState<string[]>(() => {
    const mine = data.mine.dishes.map((row) => row.branchDishId);
    return initialDishId && !mine.includes(initialDishId) ? [initialDishId, ...mine] : mine;
  });
  const [aspects, setAspects] = useState<Aspects>(
    data.mine.aspects ?? { value: null, service: null, ambience: null, wouldReturn: null },
  );
  const [showAspects, setShowAspects] = useState(data.mine.aspects !== null);
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<AddedDish[]>([]);
  const [error, setError] = useState<{ message: string; onboarding?: boolean } | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const byId = useMemo(() => new Map(data.dishes.map((dish) => [dish.id, dish])), [data.dishes]);
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    // Unprompted chips are the branch's top live dishes; pending ones appear only when searched for
    // (Gate 1), so an unconfirmed name is never promoted to everyone (docs/CONTRIBUTIONS.md §5.4).
    const pool = needle
      ? data.dishes.filter((dish) => dish.name.toLowerCase().includes(needle))
      : data.dishes.filter((dish) => dish.status === 'active');
    return pool.filter((dish) => !selected.includes(dish.id)).slice(0, chipLimit);
  }, [data.dishes, query, selected]);

  function toggleDish(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < maxDishesPerSubmission
          ? [...current, id]
          : current,
    );
  }

  function setVerdict(id: string, sentiment: Sentiment) {
    setVerdicts((current) => new Map(current).set(id, sentiment));
  }

  const typed = query.trim();
  // Gate 1: matches already show as chips; "Add" appears only for a name this menu does not have.
  const canAdd =
    typed.length >= 2 &&
    added.length < maxNewDishesPerSubmission &&
    !data.dishes.some((dish) => sameName(dish.name, typed)) &&
    !added.some((dish) => sameName(dish.name, typed));

  function addDish() {
    setAdded([...added, { key: typed.toLowerCase(), name: typed, diet: null, rupees: '', sentiment: null }]);
    setQuery('');
  }

  const updateAdded = (key: string, change: Partial<AddedDish>) =>
    setAdded(added.map((dish) => (dish.key === key ? { ...dish, ...change } : dish)));

  const ready = selected.filter((id) => verdicts.has(id));
  const readyAdded = added.filter((dish) => dish.diet !== null && dish.sentiment !== null);
  const anyAspect = Object.values(aspects).some((answer) => answer !== null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readyAdded.length < added.length) {
      setError({ message: t('ratings.sheet.finishNewDish') });
      return;
    }
    if (ready.length === 0 && added.length === 0 && !anyAspect) {
      setError({ message: t('ratings.sheet.nothing') });
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rateBranchAction({
        branchId,
        dishes: ready.map((id) => ({ branchDishId: id, sentiment: verdicts.get(id) as Sentiment })),
        newDishes: readyAdded.map((dish) => ({
          name: dish.name,
          diet: dish.diet,
          sentiment: dish.sentiment,
          pricePaise: /^\d{1,5}$/.test(dish.rupees.trim()) ? Number(dish.rupees.trim()) * 100 : null,
        })),
        aspects: anyAspect ? aspects : null,
      });
      if (result.ok) {
        setSaved(true);
        return;
      }
      if (result.error.message === 'onboarding_required') {
        setError({ message: t('ratings.sheet.onboarding'), onboarding: true });
      } else if (result.error.message === 'dish_name') {
        setError({ message: t('ratings.sheet.badName') });
      } else if (result.error.code === 'rate_limited') {
        setError({ message: t('ratings.sheet.limited') });
      } else {
        setError({ message: t('ratings.sheet.failed') });
      }
    });
  }

  if (saved) {
    return (
      <div className="flex flex-col gap-4" role="status">
        <p className="type-title-s">{t('ratings.sheet.thanksTitle')}</p>
        <p className="text-sm text-inkMuted">{t('ratings.sheet.thanksBody', { place: branchName })}</p>
        <Button variant="primary" onClick={onDone}>
          {t('ratings.sheet.done')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error ? (
        <p
          role="alert"
          className="rounded-row border-2 border-terracottaDeep bg-terracotta/10 px-3 py-2 text-sm"
        >
          {error.message}{' '}
          {error.onboarding ? (
            <Link
              href={`/onboarding?${new URLSearchParams({ next: window.location.pathname })}`}
              className="underline underline-offset-4"
            >
              {t('ratings.sheet.finishProfile')}
            </Link>
          ) : null}
        </p>
      ) : null}

      <section aria-labelledby="rate-dishes" className="flex flex-col gap-3">
        <h3 id="rate-dishes" className="text-sm">
          {t('ratings.sheet.whatDidYouEat')}
        </h3>
        <label className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-paper px-3 focus-within:ring-4 focus-within:ring-lime">
          <Search aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.5} />
          <span className="sr-only">{t('ratings.sheet.findDish')}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('ratings.sheet.findDish')}
            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-inkMuted [&::-webkit-search-cancel-button]:appearance-none"
          />
        </label>
        <ul aria-label={t('ratings.sheet.dishChoices')} className="flex flex-wrap gap-2">
          {matches.map((dish) => (
            <li key={dish.id} data-diet={dish.diet}>
              <ChipButton selected={false} onClick={() => toggleDish(dish.id)}>
                <DietMark diet={dish.diet} />
                <span data-dish-name>{dish.name}</span>
                {dish.status === 'pending' ? (
                  <span className="text-[10px] text-inkMuted">{t('dish.new')}</span>
                ) : null}
              </ChipButton>
            </li>
          ))}
          {matches.length === 0 && !canAdd ? (
            <li className="text-xs text-inkMuted">{t('ratings.sheet.noMatch')}</li>
          ) : null}
        </ul>
        {canAdd ? (
          <Button variant="outline" size="sm" className="self-start" onClick={addDish}>
            {t('ratings.sheet.addDish', { name: typed })}
          </Button>
        ) : null}

        {added.length > 0 ? (
          <ol
            aria-label={t('ratings.sheet.newDishes')}
            className="flex flex-col gap-4 border-t-2 border-dashed border-ink/25 pt-3"
          >
            {added.map((dish) => (
              <li key={dish.key} data-diet={dish.diet ?? undefined} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <span className="truncate">{dish.name}</span>
                    <Badge tone="lime">{t('dish.new')}</Badge>
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdded(added.filter((item) => item.key !== dish.key))}
                    className="shrink-0 text-xs text-inkMuted underline underline-offset-4 hover:text-terracottaDeep"
                  >
                    {t('ratings.sheet.remove')}
                    <span className="sr-only">{dish.name}</span>
                  </button>
                </div>
                <div
                  role="group"
                  aria-label={t('ratings.sheet.dietOf', { name: dish.name })}
                  className="flex flex-wrap gap-2"
                >
                  {dietOptions.map((diet) => (
                    <ChipButton
                      key={diet}
                      selected={dish.diet === diet}
                      onClick={() => updateAdded(dish.key, { diet })}
                    >
                      <DietMark diet={diet} />
                      {t(dietLabel[diet])}
                    </ChipButton>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs text-inkMuted">
                  {t('ratings.sheet.priceOptional')}
                  <span className="flex items-center rounded-row border-2 border-ink bg-paper px-2 text-sm text-ink focus-within:ring-4 focus-within:ring-lime">
                    <span aria-hidden="true">₹</span>
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      value={dish.rupees}
                      onChange={(event) =>
                        updateAdded(dish.key, { rupees: event.target.value.replace(/\D/g, '') })
                      }
                      className="h-9 w-20 bg-transparent px-1 outline-none"
                    />
                  </span>
                </label>
                <div role="group" aria-label={dish.name} className="grid grid-cols-4 gap-1.5">
                  {sentiments.map((sentiment) => (
                    <button
                      key={sentiment}
                      type="button"
                      aria-pressed={dish.sentiment === sentiment}
                      onClick={() => updateAdded(dish.key, { sentiment })}
                      className={cn(
                        'min-h-11 rounded-row border-2 border-ink px-1 text-xs transition-[background-color,translate] duration-(--dur-instant)',
                        dish.sentiment === sentiment
                          ? cn(verdictFill[sentiment], '-translate-x-px -translate-y-px shadow-brutal-sm')
                          : 'bg-paper hover:bg-cream',
                      )}
                    >
                      {t(sentimentLabelKey[sentiment])}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        ) : null}

        {selected.length > 0 ? (
          <ol className="flex flex-col gap-3 border-t-2 border-dashed border-ink/25 pt-3">
            {selected.map((id) => {
              const dish = byId.get(id);
              if (!dish) return null;
              const current = verdicts.get(id);
              return (
                <li key={id} data-diet={dish.diet} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <DietMark diet={dish.diet} />
                      <span className="truncate">{dish.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDish(id)}
                      className="shrink-0 text-xs text-inkMuted underline underline-offset-4 hover:text-terracottaDeep"
                    >
                      {t('ratings.sheet.remove')}
                      <span className="sr-only">{dish.name}</span>
                    </button>
                  </div>
                  <div role="group" aria-label={dish.name} className="grid grid-cols-4 gap-1.5">
                    {sentiments.map((sentiment) => (
                      <button
                        key={sentiment}
                        type="button"
                        aria-pressed={current === sentiment}
                        onClick={() => setVerdict(id, sentiment)}
                        className={cn(
                          'min-h-11 rounded-row border-2 border-ink px-1 text-xs transition-[background-color,translate] duration-(--dur-instant)',
                          current === sentiment
                            ? cn(verdictFill[sentiment], '-translate-x-px -translate-y-px shadow-brutal-sm')
                            : 'bg-paper hover:bg-cream',
                        )}
                      >
                        {t(sentimentLabelKey[sentiment])}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}
      </section>

      <section
        aria-labelledby="rate-place"
        className="flex flex-col gap-3 border-t-2 border-dashed border-ink/25 pt-4"
      >
        <button
          type="button"
          id="rate-place"
          aria-expanded={showAspects}
          onClick={() => setShowAspects(!showAspects)}
          className="self-start text-sm underline underline-offset-4 hover:text-terracottaDeep"
        >
          {t('ratings.sheet.howWasPlace')}
        </button>
        {showAspects ? (
          <div className="flex flex-col gap-3">
            {aspectFields.map(([field, label]) => (
              <div
                key={field}
                role="group"
                aria-label={t(label)}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="w-20 text-xs text-inkMuted">{t(label)}</span>
                {aspectAnswers.map((answer) => (
                  <ChipButton
                    key={answer}
                    selected={aspects[field] === answer}
                    onClick={() =>
                      setAspects({ ...aspects, [field]: aspects[field] === answer ? null : answer })
                    }
                  >
                    {t(aspectLabel[answer])}
                  </ChipButton>
                ))}
              </div>
            ))}
            <div
              role="group"
              aria-label={t('ratings.sheet.wouldReturn')}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="w-20 text-xs text-inkMuted">{t('ratings.sheet.wouldReturn')}</span>
              {([true, false] as const).map((answer) => (
                <ChipButton
                  key={String(answer)}
                  selected={aspects.wouldReturn === answer}
                  onClick={() =>
                    setAspects({ ...aspects, wouldReturn: aspects.wouldReturn === answer ? null : answer })
                  }
                >
                  {t(answer ? 'ratings.sheet.yes' : 'ratings.sheet.no')}
                </ChipButton>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending
          ? t('ratings.sheet.saving')
          : ready.length + readyAdded.length === 1
            ? t('ratings.sheet.saveOne')
            : ready.length + readyAdded.length > 1
              ? t('ratings.sheet.saveCount', { count: ready.length + readyAdded.length })
              : t('ratings.sheet.save')}
      </Button>
      <p className="text-xs text-inkMuted">{t('ratings.sheet.note')}</p>
    </form>
  );
}
