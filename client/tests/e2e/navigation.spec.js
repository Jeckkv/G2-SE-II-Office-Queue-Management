
import { test, expect } from '@playwright/test'

test('Officer page is accessible', async ({ page }) => {
  await page.goto('/officer')

  await expect(
    page.getByRole('heading', { name: 'Counter' })
  ).toBeVisible()
})

test('Customer page is accessible', async ({ page }) => {
  await page.goto('/customer')

  await expect(
    page.getByRole('heading', { name: 'Get a ticket' })
  ).toBeVisible()
})
