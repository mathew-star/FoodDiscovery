'use client';

import { animate, svg } from 'animejs';
import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';

export function Scribble({ className, delay = 500 }: { className?: string; delay?: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.opacity = '1';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const paths = node.querySelectorAll('path');
    const animation = animate(svg.createDrawable(paths), {
      draw: ['0 0', '0 1'],
      duration: 900,
      delay,
      ease: 'inOutQuad',
    });
    return () => {
      animation.revert();
    };
  }, [delay]);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 300 110"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute opacity-0', className)}
      fill="none"
    >
      <path
        d="M24 62C38 22 132 8 212 14c58 4 80 26 70 48-14 30-110 42-178 36C46 92 10 76 18 52 26 28 90 16 150 16"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
