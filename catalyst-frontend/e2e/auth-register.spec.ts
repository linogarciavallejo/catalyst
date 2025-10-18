import { test, expect } from '@playwright/test';

test.describe('Authentication - Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to register page before each test
    await page.goto('http://localhost:5173/register');
  });

  test('should display registration form with all required fields', async ({ page }) => {
    // Check for form elements
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Display Name')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account|sign up/i })).toBeVisible();
  });

  test('should display link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /sign in|already have/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('should display features list', async ({ page }) => {
    // Check for platform features
    await expect(page.getByText(/submit ideas/i)).toBeVisible();
    await expect(page.getByText(/vote & discuss/i)).toBeVisible();
    await expect(page.getByText(/real-time chat|chat/i)).toBeVisible();
  });

  test('should show validation error for empty email', async ({ page }) => {
    // Fill other fields but leave email empty
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show validation error
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.getByLabel('Email Address').fill('invalid-email');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('Please enter a valid email')).toBeVisible();
  });

  test('should show validation error for empty display name', async ({ page }) => {
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('Display name is required')).toBeVisible();
  });

  test('should show validation error for short display name', async ({ page }) => {
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Display Name').fill('A');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('Display name must be at least 2 characters')).toBeVisible();
  });

  test('should show validation error for empty password', async ({ page }) => {
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('short');
    await page.getByLabel('Confirm Password').fill('short');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('should show validation error when passwords do not match', async ({ page }) => {
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('DifferentPassword123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should require terms of service acceptance', async ({ page }) => {
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    
    // Try to submit without checking checkbox
    const submitButton = page.getByRole('button', { name: /create account/i });
    
    // Checkbox should be required
    const checkbox = page.getByRole('checkbox');
    const isChecked = await checkbox.isChecked();
    expect(isChecked).toBe(false);
  });

  test('should display loading state while registering', async ({ page }) => {
    // Mock delayed API response
    await page.route('**/api/auth/register', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    
    const submitButton = page.getByRole('button', { name: /create account/i });
    await submitButton.click();

    // Check for loading state
    await expect(submitButton).toContainText(/creating account|loading/i);
  });

  test('should display error on registration failure', async ({ page }) => {
    // Mock failed registration
    await page.route('**/api/auth/register', (route) => {
      route.abort('failed');
    });

    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    // Should display error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should handle duplicate email error', async ({ page }) => {
    // Mock duplicate email error
    await page.route('**/api/auth/register', (route) => {
      route.continue({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email already exists' })
      });
    });

    await page.getByLabel('Email Address').fill('existing@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    // Should display email error
    await expect(page.getByText(/email.*exists|already|duplicate/i)).toBeVisible();
  });

  test('should redirect to home after successful registration', async ({ page }) => {
    // Mock successful registration
    await page.route('**/api/auth/register', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: { 
            id: '1', 
            email: 'test@example.com', 
            displayName: 'Test User' 
          }
        })
      });
    });

    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect away from register page
    await page.waitForURL(/\/(chat|ideas|$)/);
    expect(page.url()).not.toContain('/register');
  });

  test('should store auth token after successful registration', async ({ page }) => {
    // Mock successful registration
    await page.route('**/api/auth/register', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'new-jwt-token-12345',
          user: { 
            id: '1', 
            email: 'test@example.com', 
            displayName: 'Test User' 
          }
        })
      });
    });

    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for redirect
    await page.waitForURL(/\/(chat|ideas|$)/);

    // Check localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('new-jwt-token-12345');
  });

  test('should clear validation error when user edits field', async ({ page }) => {
    // Trigger validation error
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Email is required')).toBeVisible();

    // Edit the field
    await page.getByLabel('Email Address').fill('test');

    // Error should be cleared
    await expect(page.getByText('Email is required')).not.toBeVisible();
  });
});

test.describe('Authentication - Registration Form Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/register');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email Address')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Display Name')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Confirm Password')).toBeFocused();
  });

  test('should have proper ARIA labels and attributes', async ({ page }) => {
    // Check input types
    await expect(page.getByLabel('Email Address')).toHaveAttribute('type', 'email');
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
    await expect(page.getByLabel('Confirm Password')).toHaveAttribute('type', 'password');
    await expect(page.getByRole('button', { name: /create account/i })).toHaveAttribute('type', 'submit');
  });
});
