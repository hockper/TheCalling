import { test, expect } from '@playwright/test';

test.describe('Service Request Creation and Assignment Flow', () => {
  test('should_successfully_create_a_new_request_with_automatic_assignment_when_submitted_by_requester', async ({ page }) => {
    // Arrange: Mock authentication to be already logged in as a requester
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

    await page.route('**/api/users?role=handler', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'handler-uuid-123', name: 'John Handler', email: 'john@thecalling.com', role: 'handler' }
        ]),
      });
    });

    await page.route('**/api/requests?limit=10&offset=0', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          total: 0,
        }),
      });
    });

    let createRequestBody: any = null;
    await page.route('**/api/requests', async (route) => {
      if (route.request().method() === 'POST') {
        createRequestBody = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'req-uuid-456',
            title: createRequestBody.title,
            description: createRequestBody.description,
            priority: createRequestBody.priority,
            assignee_id: null,
            status: 'open',
            created_at: new Date().toISOString(),
          }),
        });
      } else {
        await route.fallback();
      }
    });

    // Act: Navigate to requests page and click new request
    await page.goto('/requester/requests');
    await page.click('button:has-text("New Request")');
    await expect(page).toHaveURL(/\/requester\/requests\/new/);

    // Fill the request form, keeping Assignee as '-- Automatic Distribution --'
    await page.fill('input[placeholder="Brief summary of the request"]', 'Database Migration Failure');
    await page.fill('textarea[placeholder="Detailed description of what you need..."]', 'Production postgres migration failed to apply migration 003.');
    await page.selectOption('select:near(label:has-text("Priority"))', 'high');
    await page.selectOption('select:near(label:has-text("Assignee"))', ''); // Selects automatic distribution (empty string)

    // Intercept/mock requests list after redirect
    await page.route('**/api/requests?limit=10&offset=0', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'req-uuid-456',
              title: 'Database Migration Failure',
              description: 'Production postgres migration failed to apply migration 003.',
              priority: 'high',
              status: 'open',
              assignee_id: null,
              created_at: new Date().toISOString(),
            }
          ],
          total: 1,
        }),
      });
    });

    await page.click('button[type="submit"]');

    // Assert: Verify redirect to requests list and presence of new request
    await expect(page).toHaveURL(/\/requester\/requests/);
    await expect(createRequestBody).not.toBeNull();
    expect(createRequestBody.title).toBe('Database Migration Failure');
    expect(createRequestBody.description).toBe('Production postgres migration failed to apply migration 003.');
    expect(createRequestBody.priority).toBe('high');
    expect(createRequestBody.assignee_id).toBeUndefined(); // Verify assignee_id is not set for automatic distribution

    const requestCardTitle = page.locator('span:has-text("Database Migration Failure")');
    await expect(requestCardTitle).toBeVisible();
  });
});
