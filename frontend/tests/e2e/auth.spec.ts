import { test, expect } from '@playwright/test';

test.describe('Authentication and Redirection Flow', () => {
  test('should_redirect_to_requester_requests_on_successful_requester_login', async ({ page }) => {
    // Arrange: Mock backend API calls
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'unauthorized' }),
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
            email: 'requester@thecalling.com',
            role: 'requester',
          },
        }),
      });
    });

    await page.route('**/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', database: 'connected', redis: 'connected' }),
      });
    });

    // Act: Navigate and log in
    await page.goto('/');
    await page.fill('input[type="email"]', 'requester@thecalling.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Stub the /api/users/me check call after login to return the logged-in requester user profile
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
          email: 'requester@thecalling.com',
          role: 'requester',
        }),
      });
    });

    await page.click('button[type="submit"]');

    // Assert: Verify url redirection
    await expect(page).toHaveURL(/\/requester\/requests/);
  });

  test('should_redirect_to_handler_dashboard_on_successful_handler_login', async ({ page }) => {
    // Arrange: Mock backend API calls
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'unauthorized' }),
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
            email: 'handler@thecalling.com',
            role: 'handler',
          },
        }),
      });
    });

    await page.route('**/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', database: 'connected', redis: 'connected' }),
      });
    });

    // Act: Navigate and log in
    await page.goto('/');
    await page.fill('input[type="email"]', 'handler@thecalling.com');
    await page.fill('input[type="password"]', 'password123');

    // Stub /api/users/me check call after login to return handler user profile
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
          email: 'handler@thecalling.com',
          role: 'handler',
        }),
      });
    });

    await page.click('button[type="submit"]');

    // Assert: Verify url redirection
    await expect(page).toHaveURL(/\/handler\/dashboard/);
  });

  test('should_display_error_message_on_invalid_credentials', async ({ page }) => {
    // Arrange: Mock auth failure
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'unauthorized' }),
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid email or password' }),
      });
    });

    await page.route('**/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', database: 'connected', redis: 'connected' }),
      });
    });

    // Act: Attempt login
    await page.goto('/');
    await page.fill('input[type="email"]', 'wrong@thecalling.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Assert: Check error message
    const errorText = page.getByText('Invalid email or password');
    await expect(errorText).toBeVisible();
  });
});
