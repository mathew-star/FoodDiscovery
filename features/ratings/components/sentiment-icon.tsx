import { Ban, CircleMinus, Heart, ThumbsUp } from 'lucide-react';
import type { Sentiment } from '@/features/ratings/schemas/sentiment';
import { cn } from '@/shared/lib/cn';

export function SentimentIcon({ sentiment, className }: { sentiment: Sentiment; className?: string }) {
  const props = { 'aria-hidden': true, className: cn('size-4 shrink-0', className) } as const;
  switch (sentiment) {
    case 'loved':
      return <Heart {...props} fill="currentColor" />;
    case 'good':
      return <ThumbsUp {...props} />;
    case 'okay':
      return <CircleMinus {...props} />;
    case 'skip':
      return <Ban {...props} />;
  }
}
