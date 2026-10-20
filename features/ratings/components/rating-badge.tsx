import { cva } from 'class-variance-authority';
import { sentimentLabelKey, type Sentiment } from '@/features/ratings/schemas/sentiment';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { SentimentIcon } from './sentiment-icon';

const badge = cva('inline-flex items-center gap-1 rounded-full font-semibold', {
  variants: {
    sentiment: {
      loved: 'bg-rate-loved-soft text-rate-loved',
      good: 'bg-rate-good-soft text-rate-good',
      okay: 'bg-rate-okay-soft text-rate-okay',
      skip: 'bg-rate-skip-soft text-rate-skip',
    },
    size: { sm: 'h-6 px-2 text-xs', md: 'h-8 px-3 text-sm' },
  },
  defaultVariants: { size: 'sm' },
});

type RatingBadgeProps = { sentiment: Sentiment; size?: 'sm' | 'md'; className?: string };

export function RatingBadge({ sentiment, size, className }: RatingBadgeProps) {
  return (
    <span className={cn(badge({ sentiment, size }), className)}>
      <SentimentIcon sentiment={sentiment} className={size === 'md' ? 'size-4' : 'size-3.5'} />
      {t(sentimentLabelKey[sentiment])}
    </span>
  );
}
