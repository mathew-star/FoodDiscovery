import type { ComponentProps } from 'react';
import { Ticket } from './ticket';

export function Card(props: ComponentProps<'div'>) {
  return <Ticket edge="plain" {...props} />;
}
