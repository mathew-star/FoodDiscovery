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

test.describe('branch page', () => {
  test('answers first: name, locality, open status, actions, what to order', async ({ page }) => {
    await page.goto('/r/deccan-degh-house-old-city');
    await expect(page.getByRole('heading', { level: 1, name: 'Deccan Degh House' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: 'Old City' }).first()).toBeVisible();
    await expect(
      page
        .getByRole('main')
        .locator('header')
        .getByText(/^(Open|Closed)/)
        .first(),
    ).toBeVisible();
    const directions = page.getByRole('link', { name: 'Directions' });
    await expect(directions).toHaveAttribute(
      'href',
      /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=17\.\d+,78\.\d+$/,
    );
    await expect(directions).toHaveAttribute('target', '_blank');
    await expect(page.getByRole('heading', { name: 'What to order here' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'What to order here' }).getByRole('listitem')).toHaveCount(
      5,
    );
  });

  test('shows facts with confirmation age', async ({ page }) => {
    await page.goto('/r/deccan-degh-house-old-city');
    const facts = page.getByRole('region', { name: 'Facts' }).filter({ visible: true });
    await expect(facts).toHaveCount(1);
    await expect(facts.getByText('Hours', { exact: true })).toBeVisible();
    await expect(facts.getByText(/Confirmed (today|\d+ days ago)/).first()).toBeVisible();
  });

  test('publishes Restaurant and BreadcrumbList JSON-LD', async ({ page }) => {
    await page.goto('/r/deccan-degh-house-old-city');
    const json = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}',
    ) as {
      '@graph': { '@type': string }[];
    };
    expect(json['@graph'].map((node) => node['@type'])).toEqual(['Restaurant', 'BreadcrumbList']);
  });

  test('links dishes to their branch dish page', async ({ page }) => {
    await page.goto('/r/noor-e-deccan-kitchen-old-city');
    await page.getByRole('link', { name: 'Mutton Haleem' }).first().click();
    await expect(page).toHaveURL(/\/r\/noor-e-deccan-kitchen-old-city\/dish\/mutton-haleem$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Mutton Haleem' })).toBeVisible();
  });

  test('unknown branch shows not found', async ({ page }) => {
    await page.goto('/r/no-such-place');
    await expect(page.getByRole('heading', { name: 'We couldn’t find that page' })).toBeVisible();
  });
});

test.describe('branch dish page', () => {
  test('shows breakdown with text labels and other places serving it', async ({ page }) => {
    await page.goto('/r/noor-e-deccan-kitchen-old-city/dish/mutton-haleem');
    const breakdown = page.getByRole('heading', { name: 'Rating breakdown' }).locator('xpath=..');
    for (const label of ['Loved', 'Good', 'Okay', 'Skip']) {
      await expect(breakdown.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.locator('header').getByText('Non-veg', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Same dish at other places' })).toBeVisible();
    await page.getByRole('link', { name: /See every Mutton Haleem in Hyderabad/ }).click();
    await expect(page).toHaveURL(/\/hyderabad\/dish\/mutton-haleem$/);
  });
});

test.describe('city dish ranking', () => {
  test('ranks every branch and filters by area', async ({ page }) => {
    await page.goto('/hyderabad/dish/mutton-haleem');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Best Mutton Haleem in Hyderabad' }),
    ).toBeVisible();
    await expect(page.getByText('4 places')).toBeVisible();
    await page.getByRole('group', { name: 'Filters' }).getByRole('button', { name: 'Old City' }).click();
    await expect(page).toHaveURL(/area=old-city/);
    await expect(page.getByText('2 places')).toBeVisible();
    await expect(page.getByRole('article').filter({ hasText: 'Banjara Hills' })).toHaveCount(0);
  });

  test('restores filters from the URL and clears them', async ({ page }) => {
    await page.goto('/hyderabad/dish/mutton-haleem?area=banjara-hills');
    await expect(page.getByText('2 places')).toBeVisible();
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText('4 places')).toBeVisible();
    await expect(page).toHaveURL(/\/hyderabad\/dish\/mutton-haleem$/);
  });

  test('ignores invalid filter values', async ({ page }) => {
    await page.goto('/hyderabad/dish/mutton-haleem?maxPrice=abc&area=../../x');
    await expect(page.getByText('4 places')).toBeVisible();
  });
});

test('area and cuisine pages list dishes and restaurants', async ({ page }) => {
  await page.goto('/hyderabad/area/madhapur');
  await expect(page.getByRole('heading', { level: 1, name: 'Food in Madhapur' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Top restaurants in Madhapur' })).toBeVisible();
  await page.goto('/hyderabad/cuisine/south-indian');
  await expect(page.getByRole('heading', { level: 1, name: 'South Indian food in Hyderabad' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pesarattu & Co.' })).toBeVisible();
});

test('discover home links to dishes and areas', async ({ page }) => {
  await page.goto('/hyderabad');
  await page.getByRole('link', { name: 'All Mutton Haleem ranked' }).click();
  await expect(page).toHaveURL(/\/hyderabad\/dish\/mutton-haleem$/);
  await page.goto('/hyderabad');
  await page
    .getByRole('region', { name: 'Explore areas' })
    .getByRole('link', { name: /Old City/ })
    .click();
  await expect(page).toHaveURL(/\/hyderabad\/area\/old-city$/);
});

test('branch OG image renders', async ({ request }) => {
  const html = await (await request.get('/r/deccan-degh-house-old-city')).text();
  const match = html.match(/<meta property="og:image" content="([^"]+)"/);
  expect(match?.[1]).toBeTruthy();
  const image = await request.get(new URL(match?.[1] ?? '').pathname + new URL(match?.[1] ?? '').search);
  expect(image.headers()['content-type']).toBe('image/png');
});

test('sitemap lists catalogue pages', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('/r/deccan-degh-house-old-city</loc>');
  expect(xml).toContain('/hyderabad/dish/mutton-haleem</loc>');
});

for (const path of [
  '/r/deccan-degh-house-old-city',
  '/r/noor-e-deccan-kitchen-old-city/dish/mutton-haleem',
  '/hyderabad/dish/mutton-haleem',
  '/hyderabad/area/old-city',
]) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expectNoSeriousViolations(page);
  });
}
