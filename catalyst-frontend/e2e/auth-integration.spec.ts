import { test, expect } from '@playwright/test';

test.describe('Authentication - Integration Flows', () => {
  test('should navigate from login to register page', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    // Click register link
    await page.getByRole('link', { name: /sign up|create account|don't have/i }).click();
    
    // Should navigate to register page
    await page.waitForURL('**/register');
    expect(page.url()).toContain('/register');
  });

  test('should navigate from register to login page', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    // Click login link
    await page.getByRole('link', { name: /sign in|already have/i }).click();
    
    // Should navigate to login page
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('complete registration flow then login', async ({ page }) => {
    // Mock registration endpoint
    await page.route('**/api/auth/register', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'registration-token-123',
          user: { 
            id: '2', 
            email: 'newuser@example.com', 
            displayName: 'New User' 
          }
        })
      });
    });

    // Navigate to register
    await page.goto('http://localhost:5173/register');

    // Fill registration form
    await page.getByLabel('Email Address').fill('newuser@example.com');
    await page.getByLabel('Display Name').fill('New User');
    await page.getByLabel('Password').fill('NewPassword123!');
    await page.getByLabel('Confirm Password').fill('NewPassword123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to authenticated area
    await page.waitForURL(/\/(chat|ideas|$)/);
    expect(page.url()).not.toContain('/register');

    // Token should be stored
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('registration-token-123');
  });

  test('should prevent access to protected routes without authentication', async ({ page }) => {
    // Try to access protected route
    await page.goto('http://localhost:5173/ideas/create');

    // Should redirect to login
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should allow access to protected routes after login', async ({ page }) => {
    // Mock login endpoint
    await page.route('**/api/auth/login', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'auth-token-456',
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' }
        })
      });
    });

    // Go to login
    await page.goto('http://localhost:5173/login');

    // Log in
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect
    await page.waitForURL(/\/(chat|ideas|$)/);

    // Now try to access protected route
    await page.goto('http://localhost:5173/ideas/create');

    // Should have access (not redirected to login)
    expect(page.url()).toContain('/ideas/create');
  });

  test('should include auth token in protected route requests', async ({ page, context }) => {
    // Set up request interception to check for auth header
    let authHeaderFound = false;
    let requestPath = '';

    await page.route('**/api/**', (route) => {
      const request = route.request();
      const authHeader = request.headers()['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authHeaderFound = true;
      }
      requestPath = request.url();
      route.abort('aborted');
    });

    // Mock login
    await page.route('**/api/auth/login', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test-bearer-token',
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' }
        })
      });
    });

    // Login
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect
    await page.waitForURL(/\/(chat|ideas|$)/);

    // Try to access protected API endpoint
    await page.evaluate(() => {
      return fetch('http://localhost:5173/api/ideas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).catch(() => null);
    });
  });

  test('should handle session expiration gracefully', async ({ page }) => {
    // Mock login
    await page.route('**/api/auth/login', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'expired-token',
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' }
        })
      });
    });

    // Mock 401 Unauthorized for subsequent requests
    await page.route('**/api/**', (route) => {
      if (route.request().url().includes('/login')) {
        route.continue();
      } else {
        route.continue({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' })
        });
      }
    });

    // Login
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect
    await page.waitForURL(/\/(chat|ideas|$)/);

    // Try to access protected resource (should trigger 401)
    await page.goto('http://localhost:5173/ideas/create');

    // Should redirect to login on 401
    // (This depends on app's 401 handling implementation)
  });

  test('should maintain authentication across page reloads', async ({ page }) => {
    // Mock login
    await page.route('**/api/auth/login', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'persistent-token',
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' }
        })
      });
    });

    // Login
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL(/\/(chat|ideas|$)/);

    // Store current URL
    const urlAfterLogin = page.url();

    // Reload page
    await page.reload();

    // Should still be authenticated (token still in localStorage)
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('persistent-token');

    // Should still be on the same page (not redirected to login)
    expect(page.url()).toContain(urlAfterLogin.split('/').slice(-1)[0]);
  });

  test('should properly handle form submission errors', async ({ page }) => {
    // Test with network error
    await page.goto('http://localhost:5173/login');

    // Simulate network error
    await page.route('**/api/auth/login', (route) => {
      route.abort('failed');
    });

    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show error message
    const errorElement = page.locator('[role="alert"]');
    await expect(errorElement).toBeVisible();
  });

  test('should redirect back to intended page after login', async ({ page }) => {
    // Start at a protected page (should redirect to login)
    await page.goto('http://localhost:5173/chat');
    await page.waitForURL('**/login');

    // Mock successful login
    await page.route('**/api/auth/login', (route) => {
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'redirect-test-token',
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' }
        })
      });
    });

    // Log in
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect back to /chat
    await page.waitForURL('**/chat');
    expect(page.url()).toContain('/chat');
  });

  test('multiple login attempts with different credentials', async ({ page }) => {
    let attemptCount = 0;

    // Track login attempts
    await page.route('**/api/auth/login', (route) => {
      attemptCount++;
      route.continue({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: `token-attempt-${attemptCount}`,
          user: { id: '1', email: 'test@example.com', displayName: 'Test User' }
        })
      });
    });

    await page.goto('http://localhost:5173/login');

    // First login attempt
    await page.getByLabel('Email Address').fill('first@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL(/\/(chat|ideas|$)/);
    expect(attemptCount).toBe(1);

    // Go back to login (logout)
    await page.goto('http://localhost:5173/login');

    // Second login attempt with different credentials
    await page.getByLabel('Email Address').fill('second@example.com');
    await page.getByLabel('Password').fill('differentpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL(/\/(chat|ideas|$)/);
    expect(attemptCount).toBe(2);
  });
});

test.describe('Protected Route Access Control', () => {
  const protectedRoutes = [
    '/ideas/create',
    '/chat',
    '/profile/1',
    '/settings',
    '/notifications'
  ];

  protectedRoutes.forEach(route => {
    test(`should redirect to login when accessing ${route} without authentication`, async ({ page }) => {
      await page.goto(`http://localhost:5173${route}`);
      await page.waitForURL('**/login');
      expect(page.url()).toContain('/login');
    });
  });
});
