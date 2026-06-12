import { test, expect } from '@playwright/test';

test.describe('Kanban Board E2E Flow', () => {
  test('should_render_all_columns_and_drag_card_to_new_column_to_update_status', async ({ page }) => {
    // Arrange: Mock authentication to be already logged in as a handler
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'handler-uuid-123',
          email: 'handler@thecalling.com',
          role: 'handler',
        }),
      });
    });

    // Mock list users for assignee mappings and filters
    await page.route('**/api/users*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'handler-uuid-123', name: 'John Handler', email: 'handler@thecalling.com', role: 'handler' },
          { id: 'requester-uuid-456', name: 'Bob Requester', email: 'requester@thecalling.com', role: 'requester' }
        ]),
      });
    });

    // Initial mock requests (1 open request assigned to me)
    await page.route('**/api/requests?limit=500&scope=me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'req-uuid-111',
              title: 'Fix Login Bug',
              description: 'JWT token has incorrect lifespan',
              priority: 'high',
              status: 'open',
              assignee_id: 'handler-uuid-123',
              created_at: new Date().toISOString(),
            }
          ],
          total: 1,
        }),
      });
    });

    let patchCalled = false;
    let patchBody: any = null;
    await page.route('**/api/requests/req-uuid-111', async (route) => {
      if (route.request().method() === 'PATCH') {
        patchCalled = true;
        patchBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'req-uuid-111',
            title: 'Fix Login Bug',
            description: 'JWT token has incorrect lifespan',
            priority: 'high',
            status: patchBody.status,
            assignee_id: 'handler-uuid-123',
            created_at: new Date().toISOString(),
          }),
        });
      } else {
        await route.fallback();
      }
    });

    // Act: Navigate to dashboard
    await page.goto('/handler/dashboard');

    // Assert: Check column counts initially
    const openColumnBadge = page.locator('.kanban-board > div').filter({ has: page.locator('h2', { hasText: 'Open' }) }).locator('h2 + span');
    const inProgressColumnBadge = page.locator('.kanban-board > div').filter({ has: page.locator('h2', { hasText: 'In Progress' }) }).locator('h2 + span');
    await expect(openColumnBadge).toHaveText('1');
    await expect(inProgressColumnBadge).toHaveText('0');

    // Setup next requests list check to return the updated status
    await page.route('**/api/requests?limit=500&scope=me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'req-uuid-111',
              title: 'Fix Login Bug',
              description: 'JWT token has incorrect lifespan',
              priority: 'high',
              status: 'in_progress',
              assignee_id: 'handler-uuid-123',
              created_at: new Date().toISOString(),
            }
          ],
          total: 1,
        }),
      });
    });

    // Act: Drag open card to In Progress column by dispatching drag-and-drop events in the DOM
    await page.evaluate(() => {
      const cardEl = document.querySelector('.kanban-card');
      const columnEl = document.querySelectorAll('.kanban-board > div')[1];
      if (cardEl && columnEl) {
        const dataTransfer = new DataTransfer();
        Object.defineProperty(dataTransfer, 'getData', {
          value: (format: string) => format === 'text/plain' ? 'req-uuid-111' : '',
        });
        cardEl.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
        columnEl.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }));
        columnEl.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
      }
    });

    // Assert: Verify PATCH endpoint was called with status update and columns updated
    await expect.poll(() => patchCalled).toBe(true);
    expect(patchBody.status).toBe('in_progress');
    await expect(openColumnBadge).toHaveText('0');
    await expect(inProgressColumnBadge).toHaveText('1');
  });

  test('should_filter_requests_by_scope_when_toggle_switch_clicked', async ({ page }) => {
    // Arrange: Mock authentication
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'handler-uuid-123',
          email: 'handler@thecalling.com',
          role: 'handler',
        }),
      });
    });

    // Mock list users for assignee mappings and filters
    await page.route('**/api/users*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'handler-uuid-123', name: 'John Handler', email: 'handler@thecalling.com', role: 'handler' },
          { id: 'requester-uuid-456', name: 'Bob Requester', email: 'requester@thecalling.com', role: 'requester' }
        ]),
      });
    });

    // Initial mock requests for scope=me (1 request)
    await page.route('**/api/requests?limit=500&scope=me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'req-uuid-111',
              title: 'Fix Login Bug',
              description: 'JWT token has incorrect lifespan',
              priority: 'high',
              status: 'open',
              assignee_id: 'handler-uuid-123',
              created_at: new Date().toISOString(),
            }
          ],
          total: 1,
        }),
      });
    });

    // Mock requests for scope=all (2 requests)
    let allScopeCalled = false;
    await page.route('**/api/requests?limit=500&scope=all', async (route) => {
      allScopeCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'req-uuid-111',
              title: 'Fix Login Bug',
              description: 'JWT token has incorrect lifespan',
              priority: 'high',
              status: 'open',
              assignee_id: 'handler-uuid-123',
              created_at: new Date().toISOString(),
            },
            {
              id: 'req-uuid-222',
              title: 'External API Sync',
              description: 'Syncing user profiles fails periodically',
              priority: 'medium',
              status: 'open',
              assignee_id: 'handler-uuid-999',
              created_at: new Date().toISOString(),
            }
          ],
          total: 2,
        }),
      });
    });

    // Act: Navigate to dashboard
    await page.goto('/handler/dashboard');

    // Verify initial count
    const openColumnBadge = page.locator('.kanban-board > div').filter({ has: page.locator('h2', { hasText: 'Open' }) }).locator('h2 + span');
    await expect(openColumnBadge).toHaveText('1');

    // Click "Show All Requests" toggle switch
    await page.click('span:has-text("Show All Requests")');

    // Assert: Verify scope=all requests fetched and Kanban updated
    await expect.poll(() => allScopeCalled).toBe(true);
    await expect(openColumnBadge).toHaveText('2');
  });
});
