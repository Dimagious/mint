import { test, expect } from '@playwright/test';

test('app loads and shows CaptionForge title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=CaptionForge')).toBeVisible();
});

test('can add text layer', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Add Text")');
  await expect(page.locator('text=New Text')).toBeVisible();
});
