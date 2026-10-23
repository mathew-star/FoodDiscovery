'use client';

import { m, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import type { PointerEvent, ReactNode } from 'react';

type MagneticLinkProps = { href: string; className: string; children: ReactNode };

export function MagneticLink({ href, className, children }: MagneticLinkProps) {
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });

  function onMove(event: PointerEvent<HTMLSpanElement>) {
    if (reduced || event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - box.left - box.width / 2) * 0.25);
    y.set((event.clientY - box.top - box.height / 2) * 0.35);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.span className="inline-flex" style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      <Link href={href} className={className}>
        {children}
      </Link>
    </m.span>
  );
}
