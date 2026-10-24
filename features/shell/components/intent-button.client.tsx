'use client';

import type { ComponentProps } from 'react';
import { useSignInPrompt } from '../hooks/use-sign-in-prompt';

type IntentButtonProps = Omit<ComponentProps<'button'>, 'onClick' | 'type'> & {
  /** Why signing in is needed, e.g. "Sign in to answer. Your answer goes straight to the asker." */
  reason: string;
};

/** A write action a guest cannot take yet: shows the sign-in prompt with its reason (spec W2). */
export function IntentButton({ reason, ...props }: IntentButtonProps) {
  const prompt = useSignInPrompt();
  return <button type="button" onClick={() => prompt(reason)} {...props} />;
}
