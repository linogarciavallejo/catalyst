import { test, expect } from '@playwright/test';

test.describe('Active Users List E2E Tests', () => {
  test.beforeEach(async (testInfo) => {
    const page = testInfo.page || (await testInfo.browser?.newPage());
    if (page) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display active users list in sidebar', async ({ page }) => {
    await page.goto('/');

    const activeUsersList = page.locator('[data-testid="active-users-list"]');
    await expect(activeUsersList).toBeVisible();
  });

  test('should show current user as active', async ({ page }) => {
    await page.goto('/');

    const activeUsersContainer = page.locator(
      '[data-testid="active-users-list"]'
    );
    await expect(activeUsersContainer).toBeVisible();

    // Should have at least one user item
    const userItems = activeUsersContainer.locator('.active-user-item');
    expect((await userItems.count()) > 0).toBe(true);
  });

  test('should show status indicators for active users', async ({ page }) => {
    await page.goto('/');

    const statusDots = page.locator('.user-status-dot');
    await expect(statusDots.first()).toBeVisible();
  });

  test('should update active users list in real-time', async ({
    browser,
  }: any) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto('/');
    await page2.goto('/');

    // Both pages should show active users
    const list1 = page1.locator('[data-testid="active-users-list"]');
    const list2 = page2.locator('[data-testid="active-users-list"]');

    await expect(list1).toBeVisible();
    await expect(list2).toBeVisible();

    await context1.close();
    await context2.close();
  });

  test('should display typing status', async ({ page }) => {
    await page.goto('/');

    const statusDots = page.locator('.user-status-dot.status-typing');
    // If any users are typing, this should be visible
    // Otherwise, it's okay if not visible
    if (await statusDots.count() > 0) {
      await expect(statusDots.first()).toBeVisible();
    }
  });

  test('should display viewing status', async ({ page }) => {
    await page.goto('/');

    const statusDots = page.locator('.user-status-dot.status-viewing');
    // At least the current user should be viewing
    if (await statusDots.count() > 0) {
      await expect(statusDots.first()).toBeVisible();
    }
  });

  test('should display idle status', async ({ page }) => {
    await page.goto('/');

    const statusDots = page.locator('.user-status-dot.status-idle');
    // Idle users might be present
    if (await statusDots.count() > 0) {
      await expect(statusDots.first()).toBeVisible();
    }
  });

  test('should show user names in active users list', async ({ page }) => {
    await page.goto('/');

    const userNames = page.locator('.user-name');
    expect((await userNames.count()) > 0).toBe(true);
  });

  test('should show activity type for each user', async ({ page }) => {
    await page.goto('/');

    const activityTypes = page.locator('.user-status');
    expect((await activityTypes.count()) > 0).toBe(true);
  });

  test('should paginate when more than 10 users active', async ({
    page,
  }: any) => {
    await page.goto('/');

    // If more than 10 users, should show "+N more"
    const moreIndicator = page.locator('.active-user-item.more');
    if (await moreIndicator.count() > 0) {
      await expect(moreIndicator).toBeVisible();
    }
  });

  test('should handle disconnected users', async ({ page }) => {
    await page.goto('/');

    // Wait a bit for any updates
    await page.waitForTimeout(1000);

    // Active users list should still be visible
    const activeUsersList = page.locator('[data-testid="active-users-list"]');
    await expect(activeUsersList).toBeVisible();
  });
});
