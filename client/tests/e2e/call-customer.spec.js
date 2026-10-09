
import { test, expect } from '@playwright/test'

// Story 2: Officer calls the next customer
// Pending implementation of Officer UI and backend API.

test.describe('Call Customer', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/officer')
  })

  test('Officer can access the counter page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Counter' })
    ).toBeVisible()
  })

  test('Officer can select a counter', async ({ page }) => {
    test.fixme(true, 'Counter selection not implemented')

    await page.getByLabel('Counter').selectOption('1')

    await expect(
      page.getByRole('button', { name: 'Next' })
    ).toBeVisible()
  })

  test('Officer can call the next customer', async ({ page }) => {
    test.fixme(true, 'Call Customer functionality not implemented')

    await page.getByLabel('Counter').selectOption('1')
    await page.getByRole('button', { name: 'Next' }).click()

    await expect(
      page.getByText('D001')
    ).toBeVisible()
  })

  test('Officer sees a message when queue is empty', async ({ page }) => {
    test.fixme(true, 'Empty queue handling not implemented')

    await page.getByLabel('Counter').selectOption('1')
    await page.getByRole('button', { name: 'Next' }).click()

    await expect(
      page.getByText('No customers waiting')
    ).toBeVisible()
  })

})
