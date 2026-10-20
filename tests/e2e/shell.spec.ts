import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectNoSeriousViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(
    serious,
    JSON.stringify(
      serious.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
      null,
      2,
    ),
  ).toEqual([]);
}

test('landing page leads into the city', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Know what to order before you go.');
  await page.getByRole('main').getByRole('link', { name: 'Explore Hyderabad' }).first().click();
  await expect(page).toHaveURL(/\/hyderabad$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hyderabad, what are we eating?');
});

test('landing page shows every rating word and diet mark with text', async ({ page }) => {
  await page.goto('/');
  for (const label of ['Loved', 'Good', 'Okay', 'Skip', 'Veg', 'Egg', 'Non-veg']) {
    await expect(page.getByText(label, { exact: true }).first()).toBeAttached();
  }
});

test('discover page shows search and context chips', async ({ page }) => {
  await page.goto('/hyderabad');
  await expect(page.getByRole('search').first()).toBeAttached();
  const chips = page.getByRole('navigation', { name: 'Quick filters' }).getByRole('link');
  await expect(chips).toHaveCount(8);
  await expect(chips.first()).toHaveAttribute('href', '/hyderabad/search?chip=open-now');
});

test('unknown city returns not found', async ({ page }) => {
  const response = await page.goto('/mumbai');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'We couldn’t find that page' })).toBeVisible();
});

test('primary navigation marks the current page', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Bottom navigation is mobile only');
  await page.goto('/hyderabad');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link', { name: 'Discover' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link')).toHaveCount(5);
});

test('theme toggle persists across reloads', async ({ page }) => {
  await page.goto('/hyderabad');
  const toggle = page.getByRole('button', { name: /^Theme:/ });
  await expect(toggle).toHaveAccessibleName('Theme: System');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('skip link moves focus to main content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Keyboard path checked on desktop');
  await page.goto('/hyderabad');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

for (const path of ['/', '/hyderabad', '/about', '/guidelines', '/offline']) {
  test(`${path} has no serious accessibility violations in light and dark`, async ({ page, context }) => {
    await page.goto(path);
    await expectNoSeriousViolations(page);
    await context.addCookies([{ name: 'theme', value: 'dark', url: page.url() }]);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectNoSeriousViolations(page);
  });
}

test('manifest and robots are served', async ({ request }) => {
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({
    short_name: 'FDN',
    start_url: '/hyderabad',
    display: 'standalone',
  });
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /admin');
});
