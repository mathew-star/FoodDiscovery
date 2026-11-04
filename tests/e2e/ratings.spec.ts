import { expect, test } from '@playwright/test';
import { card, completeOnboarding, latestLink, newMember, signUp, uniqueEmail } from './helpers';

const branchPath = '/r/qamar-irani-cafe-madhapur';

// Each test signs up a fresh member first, which takes a few page loads.
test.describe.configure({ timeout: 60_000 });

test('a guest asked to rate signs up and lands back in the rate sheet', async ({ page }) => {
  await page.goto(branchPath);
  await page.getByRole('main').getByRole('button', { name: 'Rate' }).click();
  const toast = page.getByRole('status').filter({ hasText: 'Sign in to rate' });
  await expect(toast.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
    'href',
    `/login?next=${encodeURIComponent(`${branchPath}?rate=1`)}`,
  );

  const email = uniqueEmail('rate-resume');
  await page.goto(`/login/create?next=${encodeURIComponent(`${branchPath}?rate=1`)}`);
  await signUp(page, email);
  await page.goto(await latestLink(email, 'verify-email'));
  await completeOnboarding(page);
  await expect(page.getByRole('dialog', { name: /Rate Qamar Irani Café/ })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${branchPath}$`));
});

test('rate two dishes and the place; the dish counts move and re-rating replaces the verdict', async ({
  page,
}) => {
  await newMember(page, 'rater');
  await page.goto(branchPath);
  const firstRow = page.getByRole('region', { name: 'What to order here' }).getByRole('listitem').first();
  const countText = async () => (await firstRow.textContent()) ?? '';
  const before = await countText();

  await page.getByRole('main').getByRole('button', { name: 'Rate' }).click();
  const sheet = page.getByRole('dialog', { name: /Rate Qamar Irani Café/ });
  const choices = sheet.getByRole('list', { name: 'Dishes at this place' }).getByRole('button');
  const dishName = async () =>
    (await choices.first().locator('[data-dish-name]').textContent())?.trim() ?? '';
  const firstDish = await dishName();
  await choices.first().click();
  await sheet.getByRole('group', { name: firstDish }).getByRole('button', { name: 'Loved' }).click();
  const secondDish = await dishName();
  await choices.first().click();
  await sheet.getByRole('group', { name: secondDish }).getByRole('button', { name: 'Okay' }).click();

  await sheet.getByRole('button', { name: 'How was the place? (optional)' }).click();
  await sheet.getByRole('group', { name: 'Value' }).getByRole('button', { name: 'Good' }).click();
  await sheet.getByRole('group', { name: 'Go back?' }).getByRole('button', { name: 'Yes' }).click();
  await sheet.getByRole('button', { name: 'Save 2 ratings' }).click();
  await expect(sheet.getByRole('status')).toContainText('Thanks. Your ratings are in.');
  await sheet.getByRole('button', { name: 'Done' }).click();

  await page.reload();
  await expect.poll(countText).not.toBe(before);

  await page.getByRole('main').getByRole('button', { name: 'Rate' }).click();
  const again = page.getByRole('dialog', { name: /Rate Qamar Irani Café/ });
  await expect(
    again.getByRole('group', { name: firstDish }).getByRole('button', { name: 'Loved' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await again.getByRole('group', { name: firstDish }).getByRole('button', { name: 'Good' }).click();
  await again.getByRole('button', { name: 'Save 2 ratings' }).click();
  await expect(again.getByRole('status')).toContainText('Thanks');

  await page.goto('/saved');
  await expect(card(page, 'Been there').getByRole('link', { name: 'Qamar Irani Café' })).toBeVisible();
});

test('the rate sheet passes axe', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await newMember(page, 'rate-axe');
  await page.goto(branchPath);
  await page.getByRole('main').getByRole('button', { name: 'Rate' }).click();
  const sheet = page.getByRole('dialog');
  await sheet.getByRole('list', { name: 'Dishes at this place' }).getByRole('button').first().click();
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id),
  ).toEqual([]);
});
