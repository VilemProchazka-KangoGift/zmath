import { test, expect } from '@playwright/test';

test.describe('Pause', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByTestId('new-profile-name').fill('TestPlayer');
    await page.getByTestId('create-profile-btn').click();
    await page.getByTestId('play-btn').click();
    await page.getByTestId('levels-btn').click();
    await page.getByTestId('level-level-1').click();
    await expect(page.getByTestId('game-canvas')).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test('Escape pauses, resume continues', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('pause-overlay')).toBeVisible();

    await page.getByTestId('resume-btn').click();
    await expect(page.getByTestId('pause-overlay')).not.toBeVisible();
  });

  test('Escape toggles pause', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('pause-overlay')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('pause-overlay')).not.toBeVisible();
  });
});
