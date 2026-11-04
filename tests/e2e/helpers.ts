import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';
import { emailOutboxDir } from '../../playwright.config';

type OutboxEmail = { to: string; tag: string; text: string };

export async function latestLink(to: string, tag: string): Promise<string> {
  let link: string | undefined;
  await expect
    .poll(async () => {
      const files = (await readdir(emailOutboxDir).catch(() => [])).sort();
      for (const file of files.reverse()) {
        const email = JSON.parse(await readFile(path.join(emailOutboxDir, file), 'utf8')) as OutboxEmail;
        if (email.to === to && email.tag === tag) {
          link = email.text.match(/https?:\/\/\S+/)?.[0];
          return true;
        }
      }
      return false;
    })
    .toBe(true);
  if (!link) throw new Error(`no ${tag} link for ${to}`);
  return link;
}

export async function completeOnboarding(page: Page) {
  const form = card(page, 'Set up your profile');
  await expect(form.getByLabel('Display name', { exact: true })).toHaveValue('Asha Rao');
  await expect(form.getByLabel('Username', { exact: true })).toHaveValue(/^asha_rao(_\d{3})?$/);
  await form.getByRole('button', { name: 'Veg', exact: true }).click();
  await form.getByRole('button', { name: 'Hyderabadi' }).click();
  await form.getByRole('button', { name: 'Old City' }).click();
  await form.getByRole('button', { name: 'Finish' }).click();
  await expect(form.getByText('Confirm you’re 18 or older to finish.')).toBeVisible();
  await form.getByRole('checkbox', { name: 'I’m 18 or older' }).click();
  await form.getByRole('button', { name: 'Finish' }).click();
}

export const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${Math.round(Math.random() * 1e6)}@example.com`;
export const password = 'irani chai before the azaan';

// Next keeps the previous route mounted but hidden after client navigation, so steps are scoped to
// the visible card (role queries skip hidden content).
export const card = (page: Page, title: string) => page.getByRole('region', { name: title });

export async function signUp(page: Page, email: string) {
  const form = card(page, 'Create an account');
  await form.getByLabel('Your name', { exact: true }).fill('Asha Rao');
  await form.getByLabel('Email', { exact: true }).fill(email);
  await form.getByLabel('New password', { exact: true }).fill(password);
  await form.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('status').filter({ hasText: `Check ${email}` })).toBeVisible();
}

/** A signed-in, onboarded member, ready to rate or save. */
export async function newMember(page: Page, label: string) {
  const email = uniqueEmail(label);
  await page.goto('/login/create');
  await signUp(page, email);
  await page.goto(await latestLink(email, 'verify-email'));
  await completeOnboarding(page);
  await expect(page).toHaveURL(/\/hyderabad$/);
  return email;
}
