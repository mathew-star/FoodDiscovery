/** Spec E1-3: 3–20 characters, a–z, 0–9 and underscore. */
export const usernamePattern = /^[a-z0-9_]{3,20}$/;

// Names people could mistake for staff, the product or a route.
const reserved = new Set([
  'admin',
  'administrator',
  'fdn',
  'fdn_team',
  'fdn_ops',
  'ops',
  'moderator',
  'mod',
  'support',
  'help',
  'staff',
  'official',
  'hyderabad',
  'about',
  'guidelines',
  'login',
  'settings',
  'saved',
  'notifications',
  'onboarding',
  'deleted_user',
  'null',
  'undefined',
  'root',
  'system',
]);

export function isReservedUsername(username: string): boolean {
  return reserved.has(username) || username.startsWith('fdn_');
}

/** A starting suggestion from a display name: "Asha Rao" → "asha_rao". */
export function usernameBase(displayName: string): string {
  const base = displayName
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 16);
  if (base.length >= 3 && !isReservedUsername(base)) return base;
  return `${base || 'foodie'}_eats`.slice(0, 16).replace(/^_+/, '');
}
