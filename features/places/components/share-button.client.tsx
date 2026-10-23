'use client';

import { Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';

type ShareButtonProps = { title: string; path: string; label: string; copiedLabel: string };

export function ShareButton({ title, path, label, copiedLabel }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <Button variant="secondary" size="lg" onClick={share} aria-live="polite">
      {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
