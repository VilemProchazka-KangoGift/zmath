import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Avatar Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Create profile and go to settings
    await page.getByTestId('new-profile-name').fill('TestPlayer');
    await page.getByTestId('create-profile-btn').click();
    await page.getByTestId('settings-btn').click();
    await expect(page.getByTestId('settings-screen')).toBeVisible();
  });

  test('upload button is visible', async ({ page }) => {
    await expect(page.getByTestId('upload-avatar-btn')).toBeVisible();
  });

  test('upload an image and it appears as a selectable avatar', async ({ page }) => {
    // Use the existing player.png as a test image
    const filePath = path.resolve('public/assets/images/player.png');

    const fileInput = page.getByTestId('avatar-file-input');
    await fileInput.setInputFiles(filePath);

    // Wait for the custom avatar to appear (its button starts with avatar-custom-)
    const customAvatar = page.locator('[data-testid^="avatar-custom-"]');
    await expect(customAvatar).toBeVisible({ timeout: 5000 });

    // It should be auto-selected (has blue border - check via settings)
    // Verify it was saved by checking localStorage
    const savedAvatarId = await page.evaluate(() => {
      const activeId = localStorage.getItem('zombiemath_active_profile');
      if (!activeId) return null;
      const raw = localStorage.getItem(`zombiemath_profile_${activeId}_data`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.settings.avatarId;
    });

    expect(savedAvatarId).toBeTruthy();
    expect(savedAvatarId).toMatch(/^custom-/);
  });

  test('uploaded avatar persists after reload', async ({ page }) => {
    const filePath = path.resolve('public/assets/images/zombie.png');
    await page.getByTestId('avatar-file-input').setInputFiles(filePath);

    const customAvatar = page.locator('[data-testid^="avatar-custom-"]');
    await expect(customAvatar).toBeVisible({ timeout: 5000 });

    // Reload — should restore to settings screen via URL hash
    await page.reload();
    await expect(page.getByTestId('settings-screen')).toBeVisible({ timeout: 5000 });

    // Custom avatar should still be there
    const customAvatarAfterReload = page.locator('[data-testid^="avatar-custom-"]');
    await expect(customAvatarAfterReload).toBeVisible({ timeout: 5000 });
  });

  test('delete custom avatar reverts to default', async ({ page }) => {
    const filePath = path.resolve('public/assets/images/player.png');
    await page.getByTestId('avatar-file-input').setInputFiles(filePath);

    const customAvatar = page.locator('[data-testid^="avatar-custom-"]');
    await expect(customAvatar).toBeVisible({ timeout: 5000 });

    // Delete it
    const deleteBtn = page.locator('[data-testid^="delete-avatar-custom-"]');
    await deleteBtn.click();

    // Custom avatar should be gone
    await expect(customAvatar).not.toBeVisible();

    // Avatar should be reverted to default in storage
    const savedAvatarId = await page.evaluate(() => {
      const activeId = localStorage.getItem('zombiemath_active_profile');
      if (!activeId) return null;
      const raw = localStorage.getItem(`zombiemath_profile_${activeId}_data`);
      if (!raw) return null;
      return JSON.parse(raw).settings.avatarId;
    });
    expect(savedAvatarId).toBe('default');
  });

  test('can upload multiple avatars', async ({ page }) => {
    // Upload first
    await page.getByTestId('avatar-file-input').setInputFiles(
      path.resolve('public/assets/images/player.png'),
    );
    await expect(page.locator('[data-testid^="avatar-custom-"]')).toHaveCount(1, { timeout: 5000 });

    // Upload second
    await page.getByTestId('avatar-file-input').setInputFiles(
      path.resolve('public/assets/images/zombie.png'),
    );
    await expect(page.locator('[data-testid^="avatar-custom-"]')).toHaveCount(2, { timeout: 5000 });
  });
});
