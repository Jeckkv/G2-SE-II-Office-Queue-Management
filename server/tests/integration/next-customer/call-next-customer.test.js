/**
 * Integration tests – Story 2: "Next customer"
 * As an officer, I want to call the next client to my counter
 * so that I can serve him or her.
 *
 * Tests POST /api/v1/counters/:counterId/next
 * Uses supertest + in-memory SQLite (DB_PATH=:memory:).
 */

process.env.DB_PATH = ":memory:";

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import db from "#src/database/database.js";
import { resetDb, closeDb } from "../../helpers/test-db.js";
import { createApp } from "../../helpers/create-app.js";

const app = createApp();

describe("POST /api/v1/counters/:counterId/next", () => {
  beforeEach(() => {
    resetDb({ seed: true });
  });

  afterAll(() => {
    closeDb();
  });

  // ── Validation errors ───────────────────────────────────────────────────────

  it("returns 400 when counterId is not an integer ('abc')", async () => {
    const res = await request(app).post("/api/v1/counters/abc/next");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "BadRequest",
      message: "counterId must be a positive integer",
    });
  });

  it("returns 400 when counterId is 0", async () => {
    const res = await request(app).post("/api/v1/counters/0/next");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "BadRequest",
      message: "counterId must be a positive integer",
    });
  });

  it("returns 400 when counterId is negative (-1)", async () => {
    const res = await request(app).post("/api/v1/counters/-1/next");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "BadRequest",
      message: "counterId must be a positive integer",
    });
  });

  it("returns 400 when counterId is a float (1.5)", async () => {
    const res = await request(app).post("/api/v1/counters/1.5/next");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "BadRequest",
      message: "counterId must be a positive integer",
    });
  });

  it("returns 400 when counterId has non-digit characters (' 1' or '0x10')", async () => {
    const resHex = await request(app).post("/api/v1/counters/0x10/next");
    expect(resHex.status).toBe(400);
    expect(resHex.body.error).toBe("BadRequest");

    const resExp = await request(app).post("/api/v1/counters/1e1/next");
    expect(resExp.status).toBe(400);
    expect(resExp.body.error).toBe("BadRequest");
  });

  // ── Not found errors ────────────────────────────────────────────────────────

  it("returns 404 when counterId does not exist", async () => {
    const res = await request(app).post("/api/v1/counters/999/next");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "NotFound",
      message: "Counter 999 does not exist",
    });
  });

  // ── Empty queue (204 No Content) ───────────────────────────────────────────

  it("returns 204 No Content when all queues for the counter are empty", async () => {
    // Clear all waiting tickets
    db.exec("DELETE FROM tickets");

    const res = await request(app).post("/api/v1/counters/1/next");
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
  });

  it("returns 204 when counter only serves services that have no waiting tickets", async () => {
    db.exec("DELETE FROM tickets");
    // Counter 1 handles only Service 1 (Deposit).
    // Insert ticket for Service 2 (Shipping) only.
    db.exec("INSERT INTO tickets (code, service_id, status) VALUES ('S001', 2, 'WAITING')");

    const res = await request(app).post("/api/v1/counters/1/next");
    expect(res.status).toBe(204);
  });

  // ── Happy path (200 OK with called ticket) ──────────────────────────────────

  it("returns 200 and the called ticket from the longest queue", async () => {
    // Seed has tickets:
    // Service 1 (Deposit): D001, D002, D003, D004 (4 tickets)
    // Service 2 (Shipping): S001, S002 (2 tickets)
    // Counter 2 handles Service 1 and 2. Longest is Service 1.
    const res = await request(app).post("/api/v1/counters/2/next");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("code");
    expect(res.body).toHaveProperty("serviceId", 1);
    expect(res.body).toHaveProperty("counterId", 2);
    expect(res.body).toHaveProperty("calledAt");
    expect(res.body.code).toBe("D001"); // Oldest ticket in that queue
  });

  it("marks the called ticket as CALLED in the database with counterId and calledAt", async () => {
    const res = await request(app).post("/api/v1/counters/1/next");
    expect(res.status).toBe(200);

    const ticketId = res.body.id;
    const ticketRow = db.prepare("SELECT * FROM tickets WHERE id = ?").get(ticketId);
    expect(ticketRow.STATUS).toBe("CALLED");
    expect(ticketRow.counter_id).toBe(1);
    expect(ticketRow.called_at).not.toBeNull();
  });

  it("calling next customer successively serves tickets in proper queue order", async () => {
    // Counter 1 handles Service 1 (Deposit: D001, D002, D003, D004)
    const res1 = await request(app).post("/api/v1/counters/1/next");
    expect(res1.body.code).toBe("D001");

    const res2 = await request(app).post("/api/v1/counters/1/next");
    expect(res2.body.code).toBe("D002");

    const res3 = await request(app).post("/api/v1/counters/1/next");
    expect(res3.body.code).toBe("D003");

    const res4 = await request(app).post("/api/v1/counters/1/next");
    expect(res4.body.code).toBe("D004");

    const res5 = await request(app).post("/api/v1/counters/1/next");
    expect(res5.status).toBe(204);
  });
});
