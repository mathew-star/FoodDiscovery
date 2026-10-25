import 'server-only';

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ConfigurationError } from './env';
import { logger } from './logger';

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Short label for logs and Resend tags, e.g. `verify-email`. Never contains personal data. */
  tag: string;
};

// Resend's shared test sender; it only delivers to the Resend account owner. Production sets EMAIL_FROM.
const fallbackFrom = 'FDN <onboarding@resend.dev>';
const resendEndpoint = 'https://api.resend.com/emails';
const timeoutMs = 10_000;

async function sendWithResend(email: OutgoingEmail, apiKey: string): Promise<void> {
  const response = await fetch(resendEndpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM?.trim() || fallbackFrom,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      tags: [{ name: 'kind', value: email.tag }],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    // The body explains the failure (domain not verified, quota); it holds no recipient data.
    throw new Error(`Resend rejected ${email.tag} email: ${response.status} ${await response.text()}`);
  }
}

/*
  Development and e2e without a Resend key: each email is written as JSON to EMAIL_OUTBOX_DIR
  (default `.email-outbox/`, git-ignored) so a developer or Playwright can open the link.
*/
async function writeToOutbox(email: OutgoingEmail): Promise<void> {
  const dir = process.env.EMAIL_OUTBOX_DIR?.trim() || path.join(process.cwd(), '.email-outbox');
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}-${email.tag}-${crypto.randomUUID()}.json`);
  await writeFile(file, JSON.stringify(email, null, 2), { mode: 0o600 });
}

export async function sendEmail(email: OutgoingEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const outbox = process.env.EMAIL_OUTBOX_DIR?.trim();
  if (outbox && process.env.VERCEL_ENV === 'production') {
    throw new ConfigurationError('EMAIL_OUTBOX_DIR must not be set in production');
  }
  if (apiKey && !outbox) {
    await sendWithResend(email, apiKey);
  } else if (process.env.NODE_ENV !== 'production' || outbox) {
    await writeToOutbox(email);
  } else {
    throw new ConfigurationError('RESEND_API_KEY is required to send email in production');
  }
  logger.info({ tag: email.tag }, 'email sent');
}
