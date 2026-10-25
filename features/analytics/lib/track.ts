import type { ClientEvent } from '../schemas/events';

export const eventsEndpoint = '/api/events';

/*
  Fire-and-forget. A plain string body is sent as text/plain, a CORS-safelisted type, so the beacon
  never needs a preflight; the server parses it as JSON.
*/
export function track(event: ClientEvent): void {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify({ events: [event] });
  try {
    if (navigator.sendBeacon?.(eventsEndpoint, body)) return;
    void fetch(eventsEndpoint, { method: 'POST', body, keepalive: true, credentials: 'same-origin' }).catch(
      () => undefined,
    );
  } catch {
    // Analytics never breaks the page.
  }
}
