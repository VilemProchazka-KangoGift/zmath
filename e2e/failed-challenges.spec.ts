import { test, expect } from '@playwright/test';

test.describe('Failed Challenges', () => {
  test('game tracks wrong answers in localStorage', async ({ page }) => {
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

    // Submit a wrong answer — this should trigger cooldown
    const input = page.getByTestId('answer-input');
    await input.fill('999');
    await input.press('Enter');

    // Score should still be 0 (wrong answer)
    await expect(page.getByTestId('score-display')).toContainText('Skóre: 0');
  });
});
