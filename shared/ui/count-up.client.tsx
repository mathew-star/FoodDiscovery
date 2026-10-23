'use client';

import { animate } from 'animejs';
import { useEffect, useRef } from 'react';

export function CountUp({
  value,
  suffix = '',
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const counter = { n: Math.max(0, value - 24) };
    const animation = animate(counter, {
      n: value,
      duration: 700,
      ease: 'outExpo',
      onUpdate: () => {
        node.textContent = `${Math.round(counter.n)}${suffix}`;
      },
    });
    return () => {
      animation.cancel();
      node.textContent = `${value}${suffix}`;
    };
  }, [value, suffix]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
