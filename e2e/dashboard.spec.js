import { test, expect } from '@playwright/test';

test('dashboard loads and displays initial model values', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Stadtlabor' })).toBeVisible();
  await expect(page.locator('#indexValue')).not.toHaveText('');
  await expect(page.locator('#energy')).not.toHaveText('');
  await expect(page.locator('#city')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('sliders update values and calculated metrics', async ({ page }) => {
  await page.goto('/');
  const initial = await page.locator('#energy').textContent();
  await page.locator('#solar').evaluate((element) => { element.value = '80'; element.dispatchEvent(new Event('input', { bubbles: true })); });
  await expect(page.locator('#solarVal')).toHaveText('80 %');
  await expect(page.locator('#energy')).not.toHaveText(initial);
});

test('scenarios load and reset restores the initial values', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '2040' }).click();
  await expect(page.locator('#solar')).toHaveValue('72');
  await expect(page.locator('#green')).toHaveValue('70');
  await page.getByRole('button', { name: 'Zurücksetzen' }).click();
  await expect(page.locator('#solar')).toHaveValue('24');
  await expect(page.locator('#green')).toHaveValue('20');
  await expect(page.getByRole('button', { name: 'Heute' })).toHaveClass(/active/);
});

test('optimization updates controls and outputs', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Optimiere Fürth 2040/ }).click();
  await expect(page.locator('#solar')).toHaveValue('68');
  await expect(page.locator('#retrofit')).toHaveValue('62');
  await expect(page.locator('#green')).toHaveValue('72');
});

test('network and heatmap controls toggle their states', async ({ page }) => {
  await page.goto('/');
  const network = page.locator('#networkToggle');
  const heat = page.locator('#heatToggle');
  await expect(network).toHaveAttribute('aria-pressed', 'true');
  await network.click();
  await expect(network).toHaveAttribute('aria-pressed', 'false');
  await heat.click();
  await expect(heat).toHaveAttribute('aria-pressed', 'true');
});
