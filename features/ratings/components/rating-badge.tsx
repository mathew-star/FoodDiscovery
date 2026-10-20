import { sentimentLabelKey, type Sentiment } from '@/features/ratings/schemas/sentiment';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { Stamp } from '@/shared/ui/stamp';
import { SentimentIcon } from './sentiment-icon';

const tone: Record<Sentiment, string> = {
  loved: 'text-rate-loved',
  good: 'text-rate-good',
  okay: 'text-rate-okay',
  skip: 'text-rate-skip',
};

const tilt: Record<Sentiment, number> = { loved: -5, good: 3, okay: -2, skip: 4 };

type RatingBadgeProps = {
  sentiment: Sentiment;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  index?: number;
  className?: string;
};

export function RatingBadge({ sentiment, size = 'sm', animate = false, index, className }: RatingBadgeProps) {
  return (
    <Stamp
      size={size}
      tilt={tilt[sentiment]}
      animate={animate}
      index={index}
      className={cn(tone[sentiment], className)}
    >
      <SentimentIcon sentiment={sentiment} className="size-[0.9em]" />
      {t(sentimentLabelKey[sentiment])}
    </Stamp>
  );
}

export function dominantSentiment(weights: Record<Sentiment, number>): Sentiment {
  return (Object.entries(weights) as [Sentiment, number][]).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best,
  )[0];
}
