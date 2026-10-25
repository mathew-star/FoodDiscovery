'use client';

import type { ComponentProps } from 'react';
import { track } from '../lib/track';
import type { ClientEvent } from '../schemas/events';

/** A plain link that records one analytics event when followed (Directions, Call). */
export function TrackedAnchor({ event, onClick, ...props }: ComponentProps<'a'> & { event: ClientEvent }) {
  return (
    <a
      {...props}
      onClick={(clickEvent) => {
        track(event);
        onClick?.(clickEvent);
      }}
    />
  );
}
