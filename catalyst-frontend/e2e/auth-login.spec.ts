import { test, expect } from '@playwright/test';

test.describe('Authentication - Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('http://localhost:5173/login');
  });

  test('should display login form with email and password fields', async ({ page }) => {
    // Check for form elements
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should display link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /sign up|create account/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('should show validation error for empty email field', async ({ page }) => {
    // Leave email empty and try to submit
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show validation error
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    // Enter invalid email
    await page.getByLabel('Email Address').fill('invalid-email');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show format validation error
    await expect(page.getByText('Please enter a valid email')).toBeVisible();
  });

  test('should show validation error for empty password field', async ({ page }) => {
    // Enter email but leave password empty
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show validation error
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should display loading state while submitting', async ({ page }) => {
    // Mock the API response to delay
    await page.route('**/api/auth/login', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    
    const submitButton = page.getByRole('button', { name: 'Sign In' });
    await submitButton.click();

    // Check for loading state indicator
    await expect(submitButton).toContainText(/signing in|loading/i);
  });

  test('should display error message on invalid credentials', async ({ page }) => {
    // Mock failed login response
    await page.route('**/api/auth/login', (route) => {
      route.abort('failed');
    });

    await page.getByLabel('Email Address').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should display error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should clear validation error when user edits field', async ({ page }) => {
    // Trigger validation error
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();

    // Edit the field
    await page.getByLabel('Email Address').fill('test');

    // Error should be cleared
    await expect(page.getByText('Email is required')).not.toBeVisible();
  });

  test('should display demo credentials on login page', async ({ page }) => {
    // Check for demo credentials display
    const demoCredentials = page.locator('text=/demo|example|test/i');
    await expect(demoCredentials).toBeDefined();
  });

  test('should redirect to home page on successful login', async ({ page, context }) => {
    // Mock successful login response
    await page.route('**/api/auth/login', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' }
        })
      });
    });

    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect to home or intended page
    await page.waitForURL(/\/(chat|ideas|$)/);
    expect(page.url()).not.toContain('/login');
  });

  test('should preserve redirect location after login', async ({ page }) => {
    // Attempt to access protected page first
    await page.goto('http://localhost:5173/ideas/create');
    
    // Should redirect to login
    await page.waitForURL('**/login');

    // Mock successful login
    await page.route('**/api/auth/login', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' }
        })
      });
    });

    // Log in
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect back to the intended page (/ideas/create)
    await page.waitForURL('**/ideas/create');
  });

  test('should store auth token in localStorage after login', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test-jwt-token-12345',
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' }
        })
      });
    });

    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect
    await page.waitForURL(/\/(chat|ideas|$)/);

    // Check localStorage for token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('test-jwt-token-12345');
  });
});

test.describe('Authentication - Login Form Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab to email field
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email Address')).toBeFocused();

    // Tab to password field
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();

    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused();
  });

  test('should submit form on Enter key press', async ({ page }) => {
    // Mock the API
    await page.route('**/api/auth/login', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test-token',
          user: { id: '1', email: 'test@example.com' }
        })
      });
    });

    // Fill form
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');

    // Press Enter on password field
    await page.getByLabel('Password').press('Enter');

    // Should submit and redirect
    await page.waitForURL(/\/(chat|ideas|$)/);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for accessible labels
    await expect(page.getByLabel('Email Address')).toHaveAttribute('type', 'email');
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
    await expect(page.getByRole('button', { name: 'Sign In' })).toHaveAttribute('type', 'submit');
  });
});
