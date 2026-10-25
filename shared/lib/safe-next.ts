/**
 * Where to send someone after signing in. Only same-site paths are allowed, so a crafted
 * `?next=` can never bounce a member to another origin (open redirect).
 */
export function safeNextPath(raw: string | null | undefined, fallback = '/hyderabad'): string {
  if (!raw || raw.length > 500) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  if (/[\u0000-\u001f]/.test(raw)) return fallback;
  if (raw.startsWith('/login') || raw.startsWith('/api/')) return fallback;
  try {
    const url = new URL(raw, 'https://fdn.invalid');
    return url.origin === 'https://fdn.invalid' ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
