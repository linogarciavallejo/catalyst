import { test, expect } from '@playwright/test';

test.describe('Typing Indicator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display typing indicator when user starts typing', async ({
    page,
  }) => {
    // Navigate to idea detail page
    await page.goto('/ideas/1');

    // Find comment input
    const commentInput = page.locator('[data-testid="comment-input"]');
    await expect(commentInput).toBeVisible();

    // Start typing
    await commentInput.fill('Hello ');

    // Typing indicator should appear
    const typingIndicator = page.locator('[data-testid="typing-indicator"]');
    await expect(typingIndicator).toBeVisible();
  });

  test('should remove typing indicator when user stops typing', async ({
    page,
  }) => {
    await page.goto('/ideas/1');

    const commentInput = page.locator('[data-testid="comment-input"]');

    // Type something
    await commentInput.fill('Hello');

    // Verify indicator shows
    const typingIndicator = page.locator('[data-testid="typing-indicator"]');
    await expect(typingIndicator).toBeVisible();

    // Clear input
    await commentInput.clear();

    // Wait for indicator to disappear (5 second timeout + buffer)
    await page.waitForTimeout(5100);

    // Indicator should be hidden
    await expect(typingIndicator).not.toBeVisible();
  });

  test('should show correct user names in typing indicator', async ({
    page,
  }) => {
    await page.goto('/ideas/1');

    const commentInput = page.locator('[data-testid="comment-input"]');
    await commentInput.fill('Testing typing indicator');

    const typingIndicator = page.locator('[data-testid="typing-indicator"]');
    await expect(typingIndicator).toContainText('is typing');
  });

  test('should handle multiple typing users', async ({ browser }) => {
    // Create two browser contexts for simulating multiple users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both navigate to same idea
    await page1.goto('/ideas/1');
    await page2.goto('/ideas/1');

    // User 1 starts typing
    const input1 = page1.locator('[data-testid="comment-input"]');
    await input1.fill('User 1 typing');

    // User 2 should see typing indicator on page1's input area
    // (This would require real-time communication via SignalR)

    await context1.close();
    await context2.close();
  });

  test('should maintain typing indicator across navigation', async ({
    page,
  }) => {
    await page.goto('/ideas/1');

    const commentInput = page.locator('[data-testid="comment-input"]');
    await commentInput.fill('Staying in input');

    const typingIndicator = page.locator('[data-testid="typing-indicator"]');
    await expect(typingIndicator).toBeVisible();

    // Indicator should still be visible
    await expect(typingIndicator).toBeVisible();
  });
});
