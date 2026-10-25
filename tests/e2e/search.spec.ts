import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('typeahead suggests after two characters and opens the highlighted result', async ({ page }) => {
  await page.goto('/hyderabad');
  const box = page.getByRole('combobox', { name: 'Search dishes, restaurants or areas' });
  await box.fill('halem');
  const list = page.getByRole('listbox', { name: 'Suggestions' });
  await expect(list.getByRole('option').first()).toHaveText(/Mutton Haleem/);
  await expect(box).toHaveAttribute('aria-expanded', 'true');

  await box.press('ArrowDown');
  await expect(list.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await box.press('Enter');
  await expect(page).toHaveURL(/\/hyderabad\/dish\/mutton-haleem$/);
});

test('typed filters become chips and results are typo tolerant', async ({ page }) => {
  await page.goto('/hyderabad/search?q=biriyani+under+%E2%82%B9300');
  const chips = page.getByRole('group', { name: 'Quick filters' });
  await expect(chips.getByRole('button', { name: 'Under ₹300' })).toHaveAttribute('aria-pressed', 'true');
  const results = page.getByRole('region', { name: 'Dishes' }).locator('ol > li');
  await expect(results.first()).toContainText('Biryani');
  await expect(page.getByRole('link', { name: /Best .*Biryani in Hyderabad/ }).first()).toBeVisible();
});

test('chips and filters apply in place and stay in the URL', async ({ page }) => {
  await page.goto('/hyderabad/search?q=biryani');
  const count = page.getByText(/^\d+ dish(es)?/);
  const before = Number((await count.textContent())?.match(/\d+/)?.[0]);

  await page.getByRole('group', { name: 'Quick filters' }).getByRole('button', { name: 'Pure veg' }).click();
  await expect(page).toHaveURL(/chip=veg/);
  await expect.poll(async () => Number((await count.textContent())?.match(/\d+/)?.[0])).toBeLessThan(before);
  await expect(page.locator('[data-diet="nonveg"]')).toHaveCount(0);

  await page.getByText('More filters').click();
  await page.getByRole('group', { name: 'Diet' }).getByRole('button', { name: 'Non-veg' }).click();
  await expect(page).toHaveURL(/diet=nonveg/);
  await expect(page.getByText('Nothing matches all those filters. Remove one to see more.')).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page).toHaveURL(/\/hyderabad\/search\?q=biryani$/);
});

test('no results suggests a spelling and areas, and asking needs sign-in', async ({ page }) => {
  await page.goto('/hyderabad/search?q=zzqxv+haleam');
  await expect(page.getByRole('heading', { name: 'Nothing for “zzqxv haleam” yet' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: /^(Mutton|Chicken) Haleem$/ })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'Old City' })).toBeVisible();
  await page.getByRole('button', { name: 'Ask the locals' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sign in to ask the locals' })).toBeVisible();
});

test('search page is not indexed and passes axe', async ({ page }) => {
  await page.goto('/hyderabad/search?q=haleem');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => v.id)).toEqual([]);
});

test('guests save on this phone, see the list, and the 21st save asks to sign in', async ({ page }) => {
  await page.goto('/r/deccan-degh-house-old-city');
  const save = page.getByRole('main').getByRole('button', { name: 'Save' });
  await save.click();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status').filter({ hasText: 'Saved on this phone' })).toBeVisible();

  await page.goto('/saved');
  await expect(page.getByRole('heading', { name: 'Places' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Deccan Degh House' }).first()).toHaveAttribute(
    'href',
    '/r/deccan-degh-house-old-city',
  );

  // Fill the phone to the limit, then try one more.
  await page.evaluate(() => {
    const saves = Array.from({ length: 20 }, (_, n) => ({
      kind: 'dish',
      id: `01920000-0000-7000-8000-${String(n).padStart(12, '0')}`,
      branchId: '01920000-0000-7000-8000-999999999999',
      name: `Dish ${n}`,
      detail: 'Somewhere',
      href: '/hyderabad',
      diet: 'veg',
      savedAt: n,
    }));
    localStorage.setItem('fdn:saves', JSON.stringify(saves));
  });
  await page.goto('/r/kebab-karkhana-madhapur');
  await page.getByRole('main').getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'This phone holds 20 saves' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('button', { name: 'Save' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('discover shows trending across the city until location is shared', async ({ page, context }) => {
  await page.goto('/hyderabad');
  await expect(page.getByRole('heading', { name: 'Trending across Hyderabad' })).toBeVisible();
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 17.3616, longitude: 78.4747 });
  await page.getByRole('button', { name: 'Use my location' }).click();
  await expect(page.getByRole('heading', { name: /^Trending (near you|across Hyderabad)$/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Use my location' })).toHaveCount(0);
  await expect(
    page
      .getByRole('region', { name: /^Trending/ })
      .getByText(/(k?m) away/)
      .first(),
  ).toBeVisible();
});

test('directions clicks are recorded without blocking the link', async ({ page, context }) => {
  await context.route('https://www.google.com/**', (route) => route.fulfill({ body: 'ok' }));
  await page.goto('/r/deccan-degh-house-old-city');
  const beacon = page.waitForRequest(
    (request) => request.url().endsWith('/api/events') && request.method() === 'POST',
  );
  const popup = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Directions' }).click();
  expect((await beacon).postData()).toContain('directions_click');
  await popup;
});
