import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge<'type-scale'>({
  extend: {
    theme: {
      radius: ['card', 'panel', 'row'],
      shadow: ['brutal-sm', 'brutal', 'brutal-lg', 'brutal-lime', 'brutal-terracotta'],
    },
    classGroups: {
      'type-scale': [{ type: ['display-xl', 'display-l', 'title-l', 'title-m', 'title-s', 'score'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
