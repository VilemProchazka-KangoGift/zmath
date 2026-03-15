import { test, expect } from '@playwright/test';

test.describe('Persistence', () => {
  test('settings survive page reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Create profile
    await page.getByTestId('new-profile-name').fill('PersistPlayer');
    await page.getByTestId('create-profile-btn').click();

    // Go to settings and toggle sound off
    await page.getByTestId('settings-btn').click();
    await page.getByTestId('sound-toggle').uncheck();
    await page.getByTestId('settings-back-btn').click();

    // Reload page
    await page.reload();

    // Should still be at menu (profile persisted)
    await expect(page.getByTestId('main-menu')).toBeVisible();

    // Go to settings — sound should still be off
    await page.getByTestId('settings-btn').click();
    const checked = await page.getByTestId('sound-toggle').isChecked();
    expect(checked).toBe(false);
  });
});
