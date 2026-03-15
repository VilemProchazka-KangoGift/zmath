import { test, expect } from '@playwright/test';

test.describe('Profiles', () => {
  test('separate data per profile', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Create Alice
    await page.getByTestId('new-profile-name').fill('Alice');
    await page.getByTestId('create-profile-btn').click();
    await expect(page.getByTestId('main-menu')).toBeVisible();

    // Change Alice's settings (toggle sound off)
    await page.getByTestId('settings-btn').click();
    await page.getByTestId('sound-toggle').uncheck();
    await page.getByTestId('settings-back-btn').click();

    // Switch to profile select, create Bob
    await page.getByTestId('switch-profile-btn').click();
    await page.getByTestId('new-profile-name').fill('Bob');
    await page.getByTestId('create-profile-btn').click();

    // Bob's settings should have sound ON (default)
    await page.getByTestId('settings-btn').click();
    let checked = await page.getByTestId('sound-toggle').isChecked();
    expect(checked).toBe(true);
    await page.getByTestId('settings-back-btn').click();

    // Switch back to Alice
    await page.getByTestId('switch-profile-btn').click();
    await page.getByTestId('profile-Alice').click();

    // Alice's settings should have sound OFF
    await page.getByTestId('settings-btn').click();
    checked = await page.getByTestId('sound-toggle').isChecked();
    expect(checked).toBe(false);
  });
});
