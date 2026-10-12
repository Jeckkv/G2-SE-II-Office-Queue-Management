/**
 * Integration tests – Story 1: "Get ticket"
 * Tests POST /api/v1/tickets/:serviceid – the customer selects a service
 * and the server creates and returns a ticket.
 *
 * Uses supertest + in-memory SQLite (DB_PATH=:memory:).
 */

// Must be set BEFORE importing any module that loads the database singleton.
process.env.DB_PATH = ":memory:";

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";

import { resetDb, closeDb } from "../../helpers/test-db.js";
import { createApp } from "../../helpers/create-app.js";

const app = createApp();

describe("POST /api/v1/tickets/:serviceid", () => {
  beforeEach(() => {
    // Reset to a clean slate + seed services and counters before every test.
    resetDb({ seed: true });
  });

  afterAll(() => {
    closeDb();
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("responds with HTTP 200 when a valid serviceId is provided", async () => {
    const res = await request(app).post("/api/v1/tickets/1");
    expect(res.status).toBe(200);
  });

  it("responds with JSON", async () => {
    const res = await request(app).post("/api/v1/tickets/1");
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("returns a body with a message and an id", async () => {
    const res = await request(app).post("/api/v1/tickets/1");
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("id");
  });

  it("the returned id is a positive number", async () => {
    const res = await request(app).post("/api/v1/tickets/1");
    expect(Number(res.body.id)).toBeGreaterThan(0);
  });

  it("creates a ticket for serviceId=1 (DEPOSIT)", async () => {
    const res = await request(app).post("/api/v1/tickets/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });

  it("creates a ticket for serviceId=2 (SHIPPING)", async () => {
    const res = await request(app).post("/api/v1/tickets/2");
    expect(res.status).toBe(200);
  });

  it("creates a ticket for serviceId=3 (ACCOUNTS)", async () => {
    const res = await request(app).post("/api/v1/tickets/3");
    expect(res.status).toBe(200);
  });

  it("creates a ticket for serviceId=4 (PAYMENTS)", async () => {
    const res = await request(app).post("/api/v1/tickets/4");
    expect(res.status).toBe(200);
  });

  it("each successive call produces a different ticket id", async () => {
    const res1 = await request(app).post("/api/v1/tickets/1");
    const res2 = await request(app).post("/api/v1/tickets/1");
    expect(res1.body.id).not.toBe(res2.body.id);
  });

  // ── Validation errors ────────────────────────────────────────────────────────

  it("returns 400 when serviceId is 0 (out of range)", async () => {
    const res = await request(app).post("/api/v1/tickets/0");
    expect(res.status).toBe(400);
  });

  it("returns 400 when serviceId exceeds NOF_SERVICES (5)", async () => {
    const res = await request(app).post("/api/v1/tickets/5");
    expect(res.status).toBe(400);
  });

  it("returns 400 when serviceId is a string (not a number)", async () => {
    const res = await request(app).post("/api/v1/tickets/abc");
    expect(res.status).toBe(400);
  });

  it("returns 400 when serviceId is a float (1.5)", async () => {
    const res = await request(app).post("/api/v1/tickets/1.5");
    expect(res.status).toBe(400);
  });

  it("returns 400 when serviceId is negative", async () => {
    const res = await request(app).post("/api/v1/tickets/-1");
    expect(res.status).toBe(400);
  });

  it("error response has 'error' and 'message' fields", async () => {
    const res = await request(app).post("/api/v1/tickets/99");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("message");
  });
});
