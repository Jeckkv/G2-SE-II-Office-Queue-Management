import { test, expect } from '@playwright/test';

// OQM-34 browser-level tests: API responses are controlled so tests are
// deterministic and never alter the developer's SQLite database.
test.describe('OQM-34 Officer – Call Customer', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/counters', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([{ id: 1, number: 1, serviceIds: [1] }, { id: 2, number: 2, serviceIds: [1, 2] }]),
    }));
    await page.route('**/api/v1/tickets/called*', route => route.fulfill({
      status: 200, contentType: 'application/json', body: '[]',
    }));
    await page.route('**/api/v1/tickets/waiting*', route => route.fulfill({
      status: 200, contentType: 'application/json', body: '[]',
    }));
    await page.goto('/officer');
  });

  test('shows the officer workspace and counter selector', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Counter', exact: true })).toBeVisible();
    await expect(page.getByLabel('Counter')).toBeVisible();
    await expect(page.getByRole('button', { name: /Next/i })).toBeEnabled();
  });

  test('allows choosing a different counter', async ({ page }) => {
    await page.getByLabel('Counter').selectOption('2');
    await expect(page.getByLabel('Counter')).toHaveValue('2');
    await expect(page.locator('.current-number')).toContainText('Counter 2');
  });

  test('displays a successfully called ticket', async ({ page }) => {
    await page.route('**/api/v1/counters/1/next', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ id: 1, code: 'D001', serviceId: 1, counterId: 1, calledAt: '2026-10-12 10:00:00' }),
    }));
    await page.getByLabel('Counter').selectOption('1');
    await page.getByRole('button', { name: /Next/i }).click();
    await expect(page.locator('.current-number')).toContainText('D001');
  });

  test('shows an empty-queue message for 204', async ({ page }) => {
    await page.route('**/api/v1/counters/1/next', route => route.fulfill({ status: 204 }));
    await page.getByLabel('Counter').selectOption('1');
    await page.getByRole('button', { name: /Next/i }).click();
    await expect(page.getByRole('status')).toContainText('No customers waiting.');
  });

  test('reports an API failure', async ({ page }) => {
    await page.route('**/api/v1/counters/1/next', route => route.fulfill({
      status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'InternalServerError' }),
    }));
    await page.getByLabel('Counter').selectOption('1');
    await page.getByRole('button', { name: /Next/i }).click();
    await expect(page.getByRole('alert')).toContainText('Unable to call next customer');
  });
});
