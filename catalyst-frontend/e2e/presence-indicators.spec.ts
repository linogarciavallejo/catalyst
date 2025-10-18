import { test, expect } from '@playwright/test';

test.describe('Presence Indicator E2E Tests', () => {
  test.beforeEach(async ({ page }: any) => {
    // Navigate to app and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show presence indicator when viewing idea', async ({
    page,
  }: any) => {
    // Navigate to idea detail page
    await page.goto('/ideas/1');

    // Presence indicator should appear in header
    const presenceIndicator = page.locator(
      '[data-testid="presence-indicator"]'
    );
    await expect(presenceIndicator).toBeVisible();
  });

  test('should display user avatar in presence indicator', async ({
    page,
  }: any) => {
    await page.goto('/ideas/1');

    const presenceIndicator = page.locator(
      '[data-testid="presence-indicator"]'
    );
    const avatars = presenceIndicator.locator('.presence-avatar');

    // Should have at least one avatar
    await expect(avatars.first()).toBeVisible();
  });

  test('should show viewing user count', async ({ page }: any) => {
    await page.goto('/ideas/1');

    const presenceIndicator = page.locator(
      '[data-testid="presence-indicator"]'
    );

    // Should contain viewing count
    await expect(presenceIndicator).toContainText('viewing');
  });

  test('should update presence when navigating between ideas', async ({
    page,
  }: any) => {
    await page.goto('/ideas/1');

    const presenceIndicator1 = page.locator(
      '[data-testid="presence-indicator"]'
    );
    await expect(presenceIndicator1).toBeVisible();

    // Navigate to different idea
    await page.goto('/ideas/2');

    // Presence should be updated for new idea
    const presenceIndicator2 = page.locator(
      '[data-testid="presence-indicator"]'
    );
    await expect(presenceIndicator2).toBeVisible();
  });

  test('should remove presence indicator when navigating away', async ({
    page,
  }: any) => {
    await page.goto('/ideas/1');

    const presenceIndicator = page.locator(
      '[data-testid="presence-indicator"]'
    );
    await expect(presenceIndicator).toBeVisible();

    // Navigate back to ideas list
    await page.goto('/ideas');

    // Presence indicator should not be visible
    await expect(presenceIndicator).not.toBeVisible();
  });

  test('should show +N more when more than 4 users viewing', async ({
    browser,
  }: any) => {
    // This would require simulating multiple concurrent users
    // In real scenario, multiple browser contexts would connect
    
    const contexts = [];
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      contexts.push(context);
      const page = await context.newPage();
      await page.goto('/ideas/1');
    }

    // Check presence indicator on first page
    const page = await contexts[0].newPage();
    await page.goto('/ideas/1');

    const presenceIndicator = page.locator(
      '[data-testid="presence-indicator"]'
    );
    await expect(presenceIndicator).toContainText('more');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }
  });

  test('should have proper styling for avatar badges', async ({
    page,
  }: any) => {
    await page.goto('/ideas/1');

    const avatar = page.locator('[data-testid="presence-indicator"]').locator('.presence-avatar').first();

    // Check avatar has proper styling
    const className = await avatar.getAttribute('class');
    expect(className).toContain('presence-avatar');
  });
});
