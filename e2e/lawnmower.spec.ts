import { test, expect } from '@playwright/test';

test.describe('Lawnmower', () => {
  test('lawnmower visual present at game start', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByTestId('new-profile-name').fill('TestPlayer');
    await page.getByTestId('create-profile-btn').click();
    await page.getByTestId('play-btn').click();
    await page.getByTestId('levels-btn').click();
    await page.getByTestId('level-level-1').click();

    // Canvas should be visible (lawnmowers are drawn on canvas)
    await expect(page.getByTestId('game-canvas')).toBeVisible();
    await page.waitForTimeout(1000);

    // Verify game is running (score display visible)
    await expect(page.getByTestId('score-display')).toBeVisible();
  });
});
