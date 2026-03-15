import { test, expect } from '@playwright/test';

test.describe('Level Complete', () => {
  test('timer display is visible during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByTestId('new-profile-name').fill('TestPlayer');
    await page.getByTestId('create-profile-btn').click();
    await page.getByTestId('play-btn').click();
    await page.getByTestId('levels-btn').click();
    await page.getByTestId('level-level-1').click();

    await expect(page.getByTestId('game-canvas')).toBeVisible();
    await page.waitForTimeout(2000);

    // Timer display should be visible and counting
    await expect(page.getByTestId('timer-display')).toBeVisible();
    const timerText = await page.getByTestId('timer-display').textContent();
    expect(timerText).toMatch(/\d+:\d+/);
  });
});
