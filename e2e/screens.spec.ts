import { test, expect } from '@playwright/test';

test.describe('Screen Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('profile select -> menu -> mode select -> level select -> back', async ({ page }) => {
    await expect(page.getByTestId('profile-select')).toBeVisible();

    await page.getByTestId('new-profile-name').fill('TestPlayer');
    await page.getByTestId('create-profile-btn').click();

    await expect(page.getByTestId('main-menu')).toBeVisible();
    await expect(page.getByText('TestPlayer')).toBeVisible();

    // Play -> mode select
    await page.getByTestId('play-btn').click();
    await expect(page.getByTestId('mode-select')).toBeVisible();

    // Levels -> level select
    await page.getByTestId('levels-btn').click();
    await expect(page.getByTestId('level-select')).toBeVisible();

    // Back -> mode select
    await page.getByTestId('back-btn').click();
    await expect(page.getByTestId('mode-select')).toBeVisible();

    // Back -> menu
    await page.getByTestId('mode-back-btn').click();
    await expect(page.getByTestId('main-menu')).toBeVisible();
  });

  test('menu -> settings -> menu', async ({ page }) => {
    await page.getByTestId('new-profile-name').fill('TestPlayer');
    await page.getByTestId('create-profile-btn').click();
    await expect(page.getByTestId('main-menu')).toBeVisible();

    await page.getByTestId('settings-btn').click();
    await expect(page.getByTestId('settings-screen')).toBeVisible();

    await page.getByTestId('settings-back-btn').click();
    await expect(page.getByTestId('main-menu')).toBeVisible();
  });

  test('menu -> leaderboard -> menu', async ({ page }) => {
    await page.getByTestId('new-profile-name').fill('TestPlayer');
    await page.getByTestId('create-profile-btn').click();

    await page.getByTestId('leaderboard-btn').click();
    await expect(page.getByTestId('leaderboard-screen')).toBeVisible();

    await page.getByTestId('leaderboard-back-btn').click();
    await expect(page.getByTestId('main-menu')).toBeVisible();
  });

  test('menu -> failed questions -> menu', async ({ page }) => {
    await page.getByTestId('new-profile-name').fill('TestPlayer');
    await page.getByTestId('create-profile-btn').click();

    await page.getByTestId('failed-questions-btn').click();
    await expect(page.getByTestId('failed-questions-screen')).toBeVisible();

    await page.getByTestId('failed-back-btn').click();
    await expect(page.getByTestId('main-menu')).toBeVisible();
  });
});
