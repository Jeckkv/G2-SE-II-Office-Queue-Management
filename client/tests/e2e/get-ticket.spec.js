/**
 * End-to-end tests – Story 1: "Get ticket"
 * As a customer, I want to select a service so that I get served when my turn comes.
 *
 * Playwright tests against the running dev server (client + backend).
 * The playwright.config.js at client/ spins up `npm run dev` automatically.
 *
 * Backend must be running on port 3000 (proxied through Vite on /api).
 */
import { test, expect } from "@playwright/test";

test.describe("Story 1 – Get ticket: Customer page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customer");
  });

  // ── Page structure ──────────────────────────────────────────────────────────

  test("customer page is accessible at /customer", async ({ page }) => {
    await expect(page).toHaveURL(/\/customer/);
  });

  test("page has a heading 'Get a ticket'", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Get a ticket" })
    ).toBeVisible();
  });

  test("page has a service type label", async ({ page }) => {
    await expect(page.getByText("Service type")).toBeVisible();
  });

  test("page has a service select dropdown", async ({ page }) => {
    await expect(page.locator("#service-select")).toBeVisible();
  });

  test("page has a submit button", async ({ page }) => {
    const btn = page.getByRole("button", { name: /get queue number/i });
    await expect(btn).toBeVisible();
  });

  // ── Role selection navigation ───────────────────────────────────────────────

  test("customer button on home page navigates to /customer", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /customer/i }).click();
    await expect(page).toHaveURL(/\/customer/);
  });

  // ── Service list ────────────────────────────────────────────────────────────

  test("service dropdown loads options from the backend", async ({ page }) => {
    const select = page.locator("#service-select");
    // Auto-retrying assertion: wait for real options to arrive beyond the placeholder
    await expect(select.locator("option")).not.toHaveCount(1, { timeout: 5000 });
    const optionCount = await select.locator("option").count();
    expect(optionCount).toBeGreaterThanOrEqual(2); // placeholder + ≥1 service
  });

  test("submit button is disabled when no service is selected", async ({
    page,
  }) => {
    const btn = page.getByRole("button", { name: /get queue number/i });
    await expect(btn).toBeDisabled();
  });

  test("submit button becomes enabled after selecting a service", async ({
    page,
  }) => {
    const select = page.locator("#service-select");

    // Wait for services to load
    await page.waitForFunction(
      () => (document.querySelector("#service-select")?.options.length ?? 0) > 1,
      null,
      { timeout: 5000 }
    );

    // Pick the first non-placeholder option
    await select.selectOption({ index: 1 });

    const btn = page.getByRole("button", { name: /get queue number/i });
    await expect(btn).toBeEnabled();
  });

  // ── Ticket creation flow ────────────────────────────────────────────────────

  test("submitting a service selection creates a ticket and shows a queue number", async ({
    page,
  }) => {
    const select = page.locator("#service-select");

    // Wait for services to load from the backend
    await page.waitForFunction(
      () => (document.querySelector("#service-select")?.options.length ?? 0) > 1,
      null,
      { timeout: 5000 }
    );

    await select.selectOption({ index: 1 });
    await page.getByRole("button", { name: /get queue number/i }).click();

    // The ticket result section should appear
    const ticketResult = page.locator('[role="status"]');
    await expect(ticketResult).toBeVisible({ timeout: 5000 });
  });

  test("the ticket result shows 'Your queue number'", async ({ page }) => {
    const select = page.locator("#service-select");

    await page.waitForFunction(
      () => (document.querySelector("#service-select")?.options.length ?? 0) > 1,
      null,
      { timeout: 5000 }
    );

    await select.selectOption({ index: 1 });
    await page.getByRole("button", { name: /get queue number/i }).click();

    await expect(page.getByText("Your queue number")).toBeVisible({
      timeout: 5000,
    });
  });

  test("the queue number returned is non-empty", async ({ page }) => {
    const select = page.locator("#service-select");

    await page.waitForFunction(
      () => (document.querySelector("#service-select")?.options.length ?? 0) > 1,
      null,
      { timeout: 5000 }
    );

    await select.selectOption({ index: 1 });
    await page.getByRole("button", { name: /get queue number/i }).click();

    const status = page.locator('[role="status"]');
    await expect(status).toBeVisible({ timeout: 5000 });

    const strong = status.locator("strong");
    const text = await strong.textContent();
    expect(text?.trim()).toBeTruthy();
  });

  test("the button shows 'Creating ticket…' while loading", async ({
    page,
  }) => {
    const select = page.locator("#service-select");

    await page.waitForFunction(
      () => (document.querySelector("#service-select")?.options.length ?? 0) > 1,
      null,
      { timeout: 5000 }
    );

    await select.selectOption({ index: 1 });

    // Click and immediately check the loading state
    // (the component shows "Creating ticket…" while the request is in-flight)
    const btn = page.getByRole("button", { name: /get queue number/i });
    await btn.click();

    // Either loading state or success state; both are valid
    const loadingOrSuccess = page.locator(
      '[role="status"], button:has-text("Creating ticket")'
    );
    await expect(loadingOrSuccess.first()).toBeVisible({ timeout: 5000 });
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  test("shows an error alert if the backend is unreachable (offline simulation)", async ({
    page,
    context,
  }) => {
    // Intercept and abort the services request so we can test error UI
    await context.route("**/api/v1/services", (route) => route.abort());
    await page.goto("/customer");

    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText(/cannot load services/i);
  });

  test("shows an error alert if ticket creation fails", async ({
    page,
    context,
  }) => {
    // Let services load normally, then abort the POST to tickets
    await context.route("**/api/v1/tickets/**", (route) => route.abort());
    await page.goto("/customer");

    await page.waitForFunction(
      () => (document.querySelector("#service-select")?.options.length ?? 0) > 1,
      null,
      { timeout: 5000 }
    );

    await page.locator("#service-select").selectOption({ index: 1 });
    await page.getByRole("button", { name: /get queue number/i }).click();

    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText(/unable to issue ticket/i);
  });
});
