/**
 * Integration tests – Story 1: "Get ticket"
 * Tests GET /api/v1/services – returns the list of services for the customer
 * to choose from before requesting a ticket.
 *
 * Uses supertest + in-memory SQLite (DB_PATH=:memory:).
 */

// Must be set BEFORE importing any module that loads the database singleton.
process.env.DB_PATH = ":memory:";

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

import { resetDb, closeDb } from "../../helpers/test-db.js";
import { createApp } from "../../helpers/create-app.js";

const app = createApp();

describe("GET /api/v1/services", () => {
  beforeAll(() => {
    resetDb({ seed: true });
  });

  afterAll(() => {
    closeDb();
  });

  it("responds with HTTP 200", async () => {
    const res = await request(app).get("/api/v1/services");
    expect(res.status).toBe(200);
  });

  it("responds with JSON", async () => {
    const res = await request(app).get("/api/v1/services");
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("returns an array", async () => {
    const res = await request(app).get("/api/v1/services");
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns exactly 4 services (seeded fixture)", async () => {
    const res = await request(app).get("/api/v1/services");
    expect(res.body).toHaveLength(4);
  });

  it("each service has id, tag, name, codePrefix and serviceTime", async () => {
    const res = await request(app).get("/api/v1/services");
    res.body.forEach((s) => {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("tag");
      expect(s).toHaveProperty("name");
      expect(s).toHaveProperty("codePrefix");
      expect(s).toHaveProperty("serviceTime");
    });
  });

  it("contains the DEPOSIT service", async () => {
    const res = await request(app).get("/api/v1/services");
    const deposit = res.body.find((s) => s.tag === "DEPOSIT");
    expect(deposit).toBeDefined();
    expect(deposit.id).toBe(1);
    expect(deposit.name).toBe("Deposit money");
    expect(deposit.codePrefix).toBe("D");
    expect(deposit.serviceTime).toBe(5);
  });

  it("contains SHIPPING, ACCOUNTS and PAYMENTS", async () => {
    const res = await request(app).get("/api/v1/services");
    const tags = res.body.map((s) => s.tag);
    expect(tags).toContain("SHIPPING");
    expect(tags).toContain("ACCOUNTS");
    expect(tags).toContain("PAYMENTS");
  });
});
