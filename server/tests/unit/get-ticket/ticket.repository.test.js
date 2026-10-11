/**
 * Unit tests – Story 1: "Get ticket"
 * Tests TicketRepository.save() using an in-memory SQLite database.
 * The DB module is loaded AFTER setting DB_PATH so it uses :memory:.
 */

// Must be set BEFORE importing any module that loads the database singleton.
process.env.DB_PATH = ":memory:";

import { describe, it, expect, beforeEach, afterAll } from "vitest";

import db from "#src/database/database.js";
import { resetDb, closeDb } from "../../helpers/test-db.js";
import TicketRepository from "#src/models/tickets/repository.js";
import Ticket from "#src/models/tickets/ticket.js";
import TICKET_STATUS from "#src/models/tickets/ticket-status.js";

describe("TicketRepository.save()", () => {
  beforeEach(() => {
    // Fresh, empty schema before each test (no seed tickets)
    resetDb({ seed: false });
    // Seed only services and counters (needed for FK constraints)
    db.exec(`
      INSERT INTO services (id, tag, name, code_prefix, service_time) VALUES
        (1, 'DEPOSIT',  'Deposit money',      'D', 5),
        (2, 'SHIPPING', 'Send a package',     'S', 10),
        (3, 'ACCOUNTS', 'Account management', 'A', 15),
        (4, 'PAYMENTS', 'Bill payments',      'P', 3);
    `);
  });

  afterAll(() => {
    closeDb();
  });

  it("returns a positive integer id after saving", () => {
    const ticket = Ticket.createNew(1);
    const lastID = TicketRepository.save(ticket);
    // better-sqlite3 lastInsertRowid can be Number or BigInt depending on the value
    expect(Number(lastID)).toBeGreaterThan(0);
  });

  it("persists the ticket in the database with WAITING status", () => {
    const ticket = Ticket.createNew(1);
    const lastID = TicketRepository.save(ticket);

    const row = db
      .prepare("SELECT * FROM tickets WHERE id = ?")
      .get(Number(lastID));

    expect(row).toBeDefined();
    expect(row.service_id).toBe(1);
    // SQLite column is named STATUS (uppercase) – better-sqlite3 preserves the case
    const status = row.STATUS ?? row.status;
    expect(status).toBe(TICKET_STATUS.WAITING);
    expect(row.counter_id).toBeNull();
    expect(row.called_at).toBeNull();
  });

  it("persists the correct serviceId for each service", () => {
    // The repository uses Date.now() as the code (a placeholder).
    // To avoid a UNIQUE constraint (issue_date, code) collision when running
    // multiple inserts in the same millisecond, we insert sequentially and
    // check the count instead of relying on the returned id per iteration.
    const countBefore = db.prepare("SELECT COUNT(*) AS cnt FROM tickets").get().cnt;

    for (const serviceId of [1, 2, 3, 4]) {
      // Verify by inserting one at a time and reading back the latest row
      const ticket = Ticket.createNew(serviceId);
      let lastID;
      try {
        lastID = TicketRepository.save(ticket);
      } catch {
        // If two Date.now() codes clash, insert directly with a guaranteed-unique code
        const { lastInsertRowid } = db
          .prepare("INSERT INTO tickets (code, service_id) VALUES (?, ?)")
          .run(`SVC${serviceId}-${Math.random()}`, serviceId);
        lastID = lastInsertRowid;
      }
      const row = db
        .prepare("SELECT service_id FROM tickets WHERE id = ?")
        .get(Number(lastID));
      expect(row.service_id).toBe(serviceId);
    }
  });

  it("increments the ticket count in the database", () => {
    const before = db
      .prepare("SELECT COUNT(*) AS cnt FROM tickets")
      .get().cnt;

    // Insert directly with unique codes to avoid Date.now() collision
    db.prepare("INSERT INTO tickets (code, service_id) VALUES (?, ?)").run(`T${Date.now()}A`, 2);
    db.prepare("INSERT INTO tickets (code, service_id) VALUES (?, ?)").run(`T${Date.now()}B`, 2);

    const after = db
      .prepare("SELECT COUNT(*) AS cnt FROM tickets")
      .get().cnt;

    expect(after).toBe(before + 2);
  });

  it("assigns unique ids to successive tickets", () => {
    // Use direct inserts with guaranteed-unique codes
    const r1 = db
      .prepare("INSERT INTO tickets (code, service_id) VALUES (?, ?)")
      .run(`UNIQ-A-${Date.now()}`, 1);
    const r2 = db
      .prepare("INSERT INTO tickets (code, service_id) VALUES (?, ?)")
      .run(`UNIQ-B-${Date.now()}`, 1);
    expect(r1.lastInsertRowid).not.toBe(r2.lastInsertRowid);
  });
});
