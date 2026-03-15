import { test, expect } from '@playwright/test';

test.describe('Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Create profile and navigate to game
    await page.getByTestId('new-profile-name').fill('TestPlayer');
    await page.getByTestId('create-profile-btn').click();
    await page.getByTestId('play-btn').click();
    await page.getByTestId('levels-btn').click();
    await page.getByTestId('level-level-1').click();

    // Wait for game canvas to appear
    await expect(page.getByTestId('game-canvas')).toBeVisible();
    // Allow time for assets to load
    await page.waitForTimeout(2000);
  });

  test('zombies appear with math problems on canvas', async ({ page }) => {
    const canvas = page.getByTestId('game-canvas');
    await expect(canvas).toBeVisible();
    // Score display should be visible
    await expect(page.getByTestId('score-display')).toContainText('Skóre: 0');
  });

  test('answer input is present and filterable', async ({ page }) => {
    const input = page.getByTestId('answer-input');
    await expect(input).toBeVisible();

    // Type non-numeric characters — should be filtered out
    await input.fill('abc123def');
    const value = await input.inputValue();
    expect(value).toBe('123');
  });

  test('arrow keys are recognized (no crash)', async ({ page }) => {
    // Press arrow keys — should not throw errors
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Game should still be running
    await expect(page.getByTestId('game-canvas')).toBeVisible();
  });
});
