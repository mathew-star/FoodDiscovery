import { z } from 'zod';
import type { MessageKey } from '@/i18n';

export const sentiments = ['loved', 'good', 'okay', 'skip'] as const;
export const sentimentSchema = z.enum(sentiments);
export type Sentiment = z.infer<typeof sentimentSchema>;

export const sentimentValue: Record<Sentiment, number> = { loved: 1, good: 0.7, okay: 0.4, skip: 0 };

export const sentimentLabelKey: Record<Sentiment, MessageKey> = {
  loved: 'rating.loved',
  good: 'rating.good',
  okay: 'rating.okay',
  skip: 'rating.skip',
};
