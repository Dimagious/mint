import { expect, test } from '@playwright/test';

test('app loads and shows MINT title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('app-title')).toBeVisible();
});

test('can add text layer', async ({ page }) => {
  await page.goto('/');
  // First-run empty-state CTA is the natural entry point; use its testid to
  // disambiguate from the top-bar and mobile-bar "Add Text" buttons.
  await page.getByTestId('empty-cta-add-text').click();
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
  // Add a layer via the empty-state CTA, then the properties button becomes
  // enabled — confirms the mobile properties drawer opens.
  await page.getByTestId('empty-cta-add-text').click();
  await page.getByTestId('mobile-properties-button').click();
  await expect(page.getByTestId('properties-panel-mobile')).toBeVisible();
});

test('templates dialog loads a curated composition into the editor', async ({
  page,
}) => {
  await page.goto('/');
  // Clear any prior autosave so the empty-state overlay shows up.
  await page.evaluate(() => localStorage.removeItem('mint-project'));
  await page.reload();

  // Open via the empty-state link.
  await page.getByTestId('empty-cta-templates').click();
  await expect(page.getByTestId('templates-dialog')).toBeVisible();

  // Switch to Quotes and pick the classic quote.
  await page.getByTestId('templates-tab-quote').click();
  await page.getByTestId('template-card-quote-classic').click();

  // Dialog closes, the editor now has the template's two text layers.
  await expect(page.getByTestId('templates-dialog')).toBeHidden();
  const layers = page.locator('[data-testid^="layer-item-"]');
  await expect(layers).toHaveCount(2);
});

test('share link copies a URL that re-opens the design on a fresh visit', async ({
  page,
  context,
}) => {
  // Grant clipboard so the Share action can write without a permission prompt.
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('mint-project'));
  await page.reload();

  // Compose a tiny doc: one text layer is enough to make the share non-empty.
  await page.getByTestId('empty-cta-add-text').click();

  // Trigger Share via overflow menu (no autosave to preserve through reload).
  await page.evaluate(() => localStorage.removeItem('mint-project'));
  await page.getByRole('button', { name: /more actions/i }).click();
  await page.getByTestId('toolbar-share').click();

  // Pull the copied URL out of the clipboard, then navigate to it.
  const sharedUrl = await page.evaluate(() => navigator.clipboard.readText());
  expect(sharedUrl).toMatch(/#mint=/);

  await page.goto(sharedUrl);
  // The empty-state CTA disappears once a layer is loaded.
  await expect(page.getByTestId('empty-cta-add-text')).toHaveCount(0);
  await expect(
    page.getByTestId('layers-panel').getByText('New Text'),
  ).toBeVisible();
});

test('command palette opens via overflow menu and executes a command', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('mint-project'));
  await page.reload();

  // Open via overflow menu — Playwright's headless keyboard doesn't
  // reliably reach the window-level keydown listener for Cmd+K.
  await page.getByRole('button', { name: /more actions/i }).click();
  await page.getByRole('menuitem', { name: /command palette/i }).click();
  await expect(page.getByTestId('command-palette')).toBeVisible();

  // Fuzzy-search "add" then activate the top match.
  await page.getByTestId('command-palette-input').fill('add');
  await page.keyboard.press('Enter');

  // Palette closes; the editor has a fresh text layer.
  await expect(page.getByTestId('command-palette')).toBeHidden();
  await expect(
    page.getByTestId('layers-panel').getByText('New Text'),
  ).toBeVisible();
});
