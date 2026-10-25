import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { emailOutboxDir } from '../../playwright.config';

type OutboxEmail = { to: string; tag: string; text: string };

async function latestLink(to: string, tag: string): Promise<string> {
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

async function completeOnboarding(page: Page) {
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

const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${Math.round(Math.random() * 1e6)}@example.com`;
const password = 'irani chai before the azaan';

// Next keeps the previous route mounted but hidden after client navigation, so steps are scoped to
// the visible card (role queries skip hidden content).
const card = (page: Page, title: string) => page.getByRole('region', { name: title });

async function signUp(page: Page, email: string) {
  const form = card(page, 'Create an account');
  await form.getByLabel('Your name', { exact: true }).fill('Asha Rao');
  await form.getByLabel('Email', { exact: true }).fill(email);
  await form.getByLabel('New password', { exact: true }).fill(password);
  await form.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('status').filter({ hasText: `Check ${email}` })).toBeVisible();
}

test('sign up from a guest prompt, confirm the email, and land back where you were', async ({ page }) => {
  const email = uniqueEmail('signup');
  await page.goto('/login?next=%2Fr%2Fdeccan-degh-house-old-city');
  await expect(page.getByRole('button', { name: /Continue with Google/ })).toBeDisabled();
  await page.getByRole('link', { name: 'Create an account' }).click();
  await expect(page).toHaveURL(/\/login\/create\?next=%2Fr%2Fdeccan-degh-house-old-city/);
  await signUp(page, email);

  await page.goto(await latestLink(email, 'verify-email'));
  await expect(page).toHaveURL(/\/onboarding\?next=%2Fr%2Fdeccan-degh-house-old-city/);
  await completeOnboarding(page);
  await expect(page).toHaveURL(/\/r\/deccan-degh-house-old-city$/);
  await page.goto('/saved');
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByText('These saves stay on this phone. Sign in to keep them on every device.'),
  ).toBeVisible();

  await page.goto('/login');
  await page.getByRole('main').getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('main').getByLabel('Password', { exact: true }).fill('not the password at all');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveText('That email and password don’t match.');
  await page.getByRole('main').getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/hyderabad$/);
});

test('weak passwords are refused before anything is sent', async ({ page }) => {
  await page.goto('/login/create');
  await page.getByRole('main').getByLabel('Your name', { exact: true }).fill('Asha');
  await page.getByRole('main').getByLabel('Email', { exact: true }).fill(uniqueEmail('weak'));
  await page.getByRole('main').getByLabel('New password', { exact: true }).fill('Password123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(
    page.getByText('That password is too common. Pick something only you would think of.'),
  ).toBeVisible();
});

test('an unconfirmed account cannot sign in and gets a fresh link', async ({ page }) => {
  const email = uniqueEmail('unverified');
  await page.goto('/login/create');
  await signUp(page, email);
  await page.goto('/login');
  await page.getByRole('main').getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('main').getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'We sent a fresh link' })).toBeVisible();
});

test('reset a forgotten password from the emailed link', async ({ page }) => {
  const email = uniqueEmail('reset');
  await page.goto('/login/create');
  await signUp(page, email);
  await page.goto(await latestLink(email, 'verify-email'));
  await completeOnboarding(page);
  await expect(page).toHaveURL(/\/hyderabad$/);

  await page.context().clearCookies();
  await page.goto('/login/forgot');
  await page.getByRole('main').getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('main').getByRole('status')).toContainText('If that email has an account');

  await page.goto(await latestLink(email, 'reset-password'));
  await expect(page).toHaveURL(/\/login\/reset\?token=/);
  await page
    .getByRole('main')
    .getByLabel('New password', { exact: true })
    .fill('a brand new long passphrase');
  await page.getByRole('button', { name: 'Save new password' }).click();
  await expect(page.getByRole('main').getByRole('status')).toContainText('Password saved');

  await page.goto('/login');
  await page.getByRole('main').getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('main').getByLabel('Password', { exact: true }).fill('a brand new long passphrase');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/hyderabad$/);
});

test('auth pages are not indexed and pass axe', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  for (const path of ['/login', '/login/create', '/login/forgot', '/login/reset?token=x']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(
      serious.map((v) => v.id),
      path,
    ).toEqual([]);
  }
});

test('under 18 means no account', async ({ page }) => {
  const email = uniqueEmail('minor');
  await page.goto('/login/create');
  await signUp(page, email);
  await page.goto(await latestLink(email, 'verify-email'));
  const form = card(page, 'Set up your profile');
  await form.getByRole('button', { name: 'I’m under 18' }).click();
  await form.getByRole('button', { name: 'Yes, delete it' }).click();
  await expect(page.getByRole('main').getByRole('status')).toContainText('Your account has been deleted');

  await page.goto('/login');
  await card(page, 'Sign in').getByLabel('Email', { exact: true }).fill(email);
  await card(page, 'Sign in').getByLabel('Password', { exact: true }).fill(password);
  await card(page, 'Sign in').getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveText('That email and password don’t match.');
});

test('guest saves move into the account at sign-in and Save then writes to the account', async ({ page }) => {
  const email = uniqueEmail('saves');
  await page.goto('/r/kebab-karkhana-old-city');
  await page.getByRole('main').getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('main').getByRole('button', { name: 'Save' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.goto('/login/create?next=%2Fsaved');
  await signUp(page, email);
  await page.goto(await latestLink(email, 'verify-email'));
  await completeOnboarding(page);
  await expect(page).toHaveURL(/\/saved$/);
  await expect(page.getByRole('status').filter({ hasText: 'Moved 1 save from this phone' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('fdn:saves'))).toBeNull();

  await page.reload();
  const wantToTry = page.getByRole('region', { name: 'Want to try' });
  await expect(wantToTry.getByRole('link', { name: 'Kebab Karkhana' })).toBeVisible();

  await page.goto('/r/kebab-karkhana-old-city');
  const save = page.getByRole('main').getByRole('button', { name: 'Save' });
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await save.click();
  await expect(save).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/saved');
  await expect(
    page.getByRole('region', { name: 'Want to try' }).getByText('Tap Save on a dish or a place'),
  ).toBeVisible();
});
