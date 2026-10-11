import { test, expect } from '@playwright/test'

// Story 2: Next customer
// As an officer, I want to call the next client to my counter so that I can serve him or her.

test.describe('Story 2 – Next customer: Officer page', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept counters list endpoint so Officer page can initialize
    await page.route('**/api/v1/counters', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, number: 1, name: 'Counter 1' },
          { id: 2, number: 2, name: 'Counter 2' },
        ]),
      })
    })

    // Also stub display board endpoint if polled
    await page.route('**/api/v1/display', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          calledTickets: [],
          queues: [],
        }),
      })
    })

    await page.goto('/officer')
  })

  // ── Page accessibility and navigation ──────────────────────────────────────

  test('Officer can access the counter page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Counter' })
    ).toBeVisible()
  })

  test('Officer button on home page navigates to /officer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /officer/i }).click()
    await expect(page).toHaveURL(/\/officer/)
  })

  // ── Counter selection ──────────────────────────────────────────────────────

  test('Officer can select a counter', async ({ page }) => {
    const select = page.getByLabel('Counter')
    await expect(select).toBeVisible()
    await select.selectOption('1')

    await expect(
      page.getByRole('button', { name: /Next/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Next/i })
    ).toBeEnabled()
  })

  // ── Calling next customer ──────────────────────────────────────────────────

  test('Officer can call the next customer', async ({ page }) => {
    await page.route('**/api/v1/counters/1/next', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          code: 'D001',
          serviceId: 1,
          counterId: 1,
        }),
      })
    })

    await page.getByLabel('Counter').selectOption('1')
    await page.getByRole('button', { name: /Next/i }).click()

    await expect(
      page.locator('.current-number')
    ).toContainText('D001')
  })

  test('Officer sees a message when queue is empty', async ({ page }) => {
    await page.route('**/api/v1/counters/1/next', async (route) => {
      await route.fulfill({
        status: 204,
      })
    })

    await page.getByLabel('Counter').selectOption('1')
    await page.getByRole('button', { name: /Next/i }).click()

    await expect(
      page.getByText('No customers waiting')
    ).toBeVisible()
  })

  // ── Error handling ─────────────────────────────────────────────────────────

  test('Officer sees an error message if calling next customer fails', async ({ page }) => {
    await page.route('**/api/v1/counters/1/next', async (route) => {
      await route.abort('failed')
    })

    await page.getByLabel('Counter').selectOption('1')
    await page.getByRole('button', { name: /Next/i }).click()

    const alert = page.locator('[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/unable to call next customer/i)
  })

  test('shows an error message if loading counters fails', async ({ page }) => {
    await page.route('**/api/v1/counters', async (route) => {
      await route.abort('failed')
    })
    await page.goto('/officer')

    const alert = page.locator('[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/cannot load counters/i)
  })
})
