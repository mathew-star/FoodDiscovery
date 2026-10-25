'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';
import { FormField as Field, FormMessage } from '@/features/auth/components/auth-card';
import { t, type MessageKey } from '@/i18n';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox.client';
import { ChipButton } from '@/shared/ui/chip';
import { Input } from '@/shared/ui/input';
import { completeOnboardingAction, declineUnderageAction } from '../server/actions';
import { dietPreferenceValues, maxCuisines } from '../schemas/onboarding';

type Option = { slug: string; name: string };

type OnboardingFormProps = {
  next: string;
  defaults: { displayName: string; username: string };
  cuisines: Option[];
  localities: Option[];
};

const dietLabel: Record<(typeof dietPreferenceValues)[number], MessageKey> = {
  veg: 'diet.veg',
  jain: 'diet.jain',
  egg: 'diet.egg',
  nonveg: 'diet.nonveg',
};

const message = (key: string | undefined) => (key ? t(key as MessageKey) : null);

/** Spec E1-3: one screen. Only the name, username and 18+ confirmation are required. */
export function OnboardingForm({ next, defaults, cuisines, localities }: OnboardingFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adult, setAdult] = useState(false);
  const [diet, setDiet] = useState<(typeof dietPreferenceValues)[number] | null>(null);
  const [chosenCuisines, setChosenCuisines] = useState<string[]>([]);
  const [homeLocality, setHomeLocality] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [declined, setDeclined] = useState(false);
  const [confirmUnderage, setConfirmUnderage] = useState(false);

  function toggleCuisine(slug: string) {
    setChosenCuisines((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length < maxCuisines
          ? [...current, slug]
          : current,
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await completeOnboardingAction({
        displayName: String(form.get('displayName') ?? ''),
        username: String(form.get('username') ?? ''),
        adult,
        diet,
        cuisines: chosenCuisines,
        homeLocality,
      });
      if (result.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      setFieldErrors(result.error.fieldErrors ?? {});
      setFormError(
        result.error.code === 'rate_limited'
          ? t('auth.errors.rateLimited')
          : result.error.fieldErrors
            ? null
            : t('auth.errors.generic'),
      );
    });
  }

  function declineUnderage() {
    startTransition(async () => {
      const result = await declineUnderageAction();
      if (result.ok) setDeclined(true);
      else setFormError(t('auth.errors.generic'));
    });
  }

  if (declined) return <FormMessage tone="success">{t('profile.onboarding.underageDone')}</FormMessage>;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {formError ? <FormMessage tone="error">{formError}</FormMessage> : null}
      <Field
        id="displayName"
        label={t('profile.fields.displayName')}
        error={message(fieldErrors.displayName?.[0])}
      >
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaults.displayName}
          required
          maxLength={40}
        />
      </Field>
      <Field
        id="username"
        label={t('profile.fields.username')}
        hint={t('profile.fields.usernameHint')}
        error={message(fieldErrors.username?.[0])}
      >
        <Input
          id="username"
          name="username"
          defaultValue={defaults.username}
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]{3,20}"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby="username-hint"
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm">{t('profile.fields.diet')}</legend>
        <div className="flex flex-wrap gap-2">
          <ChipButton selected={diet === null} onClick={() => setDiet(null)}>
            {t('profile.fields.noPreference')}
          </ChipButton>
          {dietPreferenceValues.map((value) => (
            <ChipButton key={value} selected={diet === value} onClick={() => setDiet(value)}>
              {t(dietLabel[value])}
            </ChipButton>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm">
          {t('profile.fields.cuisines', { max: maxCuisines, count: chosenCuisines.length })}
        </legend>
        <div className="flex flex-wrap gap-2">
          {cuisines.map((cuisine) => (
            <ChipButton
              key={cuisine.slug}
              selected={chosenCuisines.includes(cuisine.slug)}
              disabled={!chosenCuisines.includes(cuisine.slug) && chosenCuisines.length >= maxCuisines}
              onClick={() => toggleCuisine(cuisine.slug)}
            >
              {cuisine.name}
            </ChipButton>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm">{t('profile.fields.homeLocality')}</legend>
        <div className="flex flex-wrap gap-2">
          {localities.map((locality) => (
            <ChipButton
              key={locality.slug}
              selected={homeLocality === locality.slug}
              onClick={() => setHomeLocality(homeLocality === locality.slug ? null : locality.slug)}
            >
              {locality.name}
            </ChipButton>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1 border-t-2 border-dashed border-ink/25 pt-4">
        <Checkbox
          label={t('profile.fields.adult')}
          checked={adult}
          onCheckedChange={(checked) => setAdult(checked === true)}
          aria-describedby={fieldErrors.adult ? 'adult-error' : undefined}
        />
        {fieldErrors.adult ? (
          <p id="adult-error" className="text-xs text-terracottaDeep">
            {message(fieldErrors.adult[0])}
          </p>
        ) : null}
        {confirmUnderage ? (
          <div
            role="group"
            aria-label={t('profile.onboarding.underage')}
            className="flex flex-col gap-2 text-xs"
          >
            <p>{t('profile.onboarding.underageConfirm')}</p>
            <div className="flex gap-2">
              <Button variant="dark" size="sm" onClick={declineUnderage} disabled={pending}>
                {t('profile.onboarding.underageYes')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmUnderage(false)}>
                {t('profile.onboarding.underageNo')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmUnderage(true)}
            className="self-start text-xs text-inkMuted underline underline-offset-4 hover:text-terracottaDeep"
          >
            {t('profile.onboarding.underage')}
          </button>
        )}
      </div>

      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? t('profile.onboarding.pending') : t('profile.onboarding.submit')}
      </Button>
    </form>
  );
}
