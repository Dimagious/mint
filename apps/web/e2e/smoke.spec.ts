import { expect, test } from '@playwright/test';

test('app loads and shows MINT title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('app-title')).toBeVisible();
});

test('can add text layer', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /add text/i }).click();
  await expect(
    page.getByTestId('layers-panel').getByText('New Text'),
  ).toBeVisible();
});

test('mobile panels open via bottom actions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByTestId('mobile-layers-button').click();
  await expect(page.getByTestId('layers-panel-mobile')).toBeVisible();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /add text/i }).click();
  await expect(page.getByTestId('properties-panel-mobile')).toBeVisible();
});
