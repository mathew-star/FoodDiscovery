/** D2: at least 10 characters, not a well-known password, not built from the email address. */
export const passwordMinLength = 10;
export const passwordMaxLength = 128;

// Most common leaked passwords of 10+ characters, lowercased. A short list on purpose: it catches
// the guesses an attacker tries first without shipping a large dictionary.
const common = new Set([
  '1234567890',
  '0123456789',
  '0987654321',
  '1111111111',
  '1234512345',
  '1q2w3e4r5t',
  'qwertyuiop',
  'qwerty1234',
  'qwerty12345',
  'asdfghjkl;',
  'zxcvbnm123',
  'password12',
  'password123',
  'password1234',
  'passw0rd123',
  'iloveyou12',
  'iloveyou123',
  'princess123',
  'football123',
  'baseball123',
  'sunshine123',
  'starwars123',
  'welcome123',
  'welcome1234',
  'letmein123',
  'admin12345',
  'administrator',
  'abcdefghij',
  'abc1234567',
  'abcd123456',
  'a123456789',
  'q123456789',
  '123456789a',
  '123456789q',
  'india12345',
  'india@1234',
  'hyderabad1',
  'hyderabad123',
  'hyderabad@123',
  'biryani123',
  'computer123',
  'whatever123',
  'trustno1234',
  'superman123',
  'qazwsxedcrfv',
  '1qaz2wsx3edc',
  'zaq12wsxcde3',
  'changeme123',
  'p@ssw0rd123',
  'p@ssword123',
]);

export type PasswordProblem = 'too_short' | 'too_long' | 'common' | 'repetitive' | 'contains_email';

export function checkPassword(password: string, email?: string): PasswordProblem | null {
  if (password.length < passwordMinLength) return 'too_short';
  if (password.length > passwordMaxLength) return 'too_long';
  const lower = password.toLowerCase();
  if (common.has(lower)) return 'common';
  if (new Set(lower).size <= 2) return 'repetitive';
  const local = email?.split('@')[0]?.toLowerCase();
  if (local && local.length >= 4 && lower.includes(local)) return 'contains_email';
  return null;
}
