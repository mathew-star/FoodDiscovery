import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
});

test('hero chips swap the live answer and fill the search', async ({ page }) => {
  const answer = page.getByRole('article', { name: 'Live answer' });
  await expect(answer.getByRole('heading', { name: 'Mutton dum biryani' })).toBeVisible();

  const chip = page.getByRole('group', { name: 'Quick filters' }).getByRole('button', { name: 'Pure veg' });
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await expect(answer.getByRole('heading', { name: 'Pesarattu upma' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: /Search a dish, restaurant or area/ })).toHaveValue(
    'pure veg tiffins Banjara Hills',
  );
  await expect(answer.getByRole('link', { name: /What else to order here/ })).toHaveAttribute(
    'href',
    '/r/gulmohar-tiffins-banjara-hills',
  );
});

test('a guest write action explains why to sign in and keeps the way back', async ({ page }) => {
  await page.getByRole('button', { name: 'Upvote' }).click();
  const toast = page.getByRole('status').filter({ hasText: 'Sign in to vote' });
  await expect(toast).toBeVisible();
  await expect(toast.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login?next=%2F');
});

test('battle split stays hidden until a vote', async ({ page }) => {
  const battle = page.getByRole('group', { name: 'Better mutton dum biryani tonight?' });
  await expect(battle.getByText('%')).toHaveCount(0);
  const side = battle.getByRole('button', { name: /Hitech Biryani Co\./ });
  await side.click();
  await expect(side).toHaveAttribute('aria-pressed', 'true');
  await expect(side).toContainText('Your pick');
});

test('six apps collapse into one page', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Do it in one page' });
  await button.click();
  await expect(page.getByRole('button', { name: 'Show the old way' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('With FDN: under 30 seconds')).toBeVisible();
});

test('mode tabs preview real routes and move with the keyboard', async ({ page, isMobile }) => {
  const tabs = page.getByRole('tablist', { name: 'Ways to explore' });
  const open = page.getByRole('link', { name: 'Open this page' });
  await expect(open).toHaveAttribute('href', '/r/deccan-degh-house-old-city');

  await tabs.getByRole('tab', { name: /Craving one dish/ }).click();
  await expect(open).toHaveAttribute('href', '/hyderabad/dish/mutton-haleem');
  await expect(page.getByRole('heading', { name: 'Best haleem in Hyderabad' })).toBeVisible();

  test.skip(isMobile, 'Arrow keys follow the vertical desktop layout');
  await page.keyboard.press('ArrowDown');
  await expect(tabs.getByRole('tab', { name: /Going by mood/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('group', { name: 'Moods' }).getByRole('button', { name: 'Date night' }).click();
  await expect(open).toHaveAttribute('href', '/hyderabad/search?chip=date-night');
});

test('leaderboard filters narrow the ranking', async ({ page }) => {
  await page.getByRole('tab', { name: /Craving one dish/ }).click();
  const panel = page.getByRole('tabpanel', { name: /Craving one dish/ });
  await panel
    .getByRole('group', { name: 'Filter leaderboard' })
    .getByRole('button', { name: 'Within 3 km' })
    .click();
  await expect(panel.getByText('Deccan Degh House, Old City')).toBeVisible();
  await expect(panel.getByText('Noor-e-Deccan Kitchen, Old City')).toHaveCount(0);
});

test('community tabs filter the feed', async ({ page }) => {
  const tabs = page.getByRole('tablist', { name: 'Filter community posts' });
  await tabs.getByRole('tab', { name: 'Questions' }).click();
  await expect(page.getByRole('heading', { name: /dosa after midnight/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /I ate 6 haleems/ })).toHaveCount(0);
});

test('score x-ray ignores a fake-review burst', async ({ page }) => {
  const fdnScore = page.getByText('FDN dish score').locator('..');
  const before = await fdnScore.textContent();
  await page.getByRole('button', { name: 'Try a fake-review burst' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Burst detected.' })).toBeVisible();
  await expect(fdnScore).toHaveText(before ?? '');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Burst detected.' })).toHaveCount(0);
});

test('FAQ search opens the first match and explains no match', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Search questions' });
  await search.fill('coordinates');
  await expect(page.getByText('We never store your coordinates.', { exact: false })).toBeVisible();
  await expect(page.getByText('Can a restaurant pay to rank higher?')).toBeHidden();
  await search.fill('zzzz');
  await expect(page.getByText('No answer matches that yet.', { exact: false })).toBeVisible();
});

test('publishes FAQPage structured data', async ({ page }) => {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = blocks.map((block) => JSON.parse(block) as { '@type': string; mainEntity?: unknown[] });
  expect(faq.find((node) => node['@type'] === 'FAQPage')?.mainEntity).toHaveLength(8);
});
