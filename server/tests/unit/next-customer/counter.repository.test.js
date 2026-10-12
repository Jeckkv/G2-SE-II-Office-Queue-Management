process.env.DB_PATH = ":memory:";

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import db from "#src/database/database.js";
import { resetDb, closeDb } from "../../helpers/test-db.js";
import CounterRepository from "#src/models/counters/repository.js";

describe("CounterRepository", () => {
  beforeEach(() => {
    resetDb({ seed: true });
  });

  afterAll(() => {
    closeDb();
  });

  describe("exists()", () => {
    it("returns true for an existing counter", () => {
      expect(CounterRepository.exists(1)).toBe(true);
      expect(CounterRepository.exists(2)).toBe(true);
    });

    it("returns false for a non-existing counter", () => {
      expect(CounterRepository.exists(999)).toBe(false);
      expect(CounterRepository.exists(-1)).toBe(false);
    });
  });

  describe("callNextCustomer()", () => {
    it("returns null when all queues for the counter are empty", () => {
      // Clear all tickets
      db.exec("DELETE FROM tickets");
      const result = CounterRepository.callNextCustomer(1);
      expect(result).toBeNull();
    });

    it("calls the next ticket from the longest queue for the counter", () => {
      // Seed puts waiting tickets:
      // Service 1 (Shipping, 10m): 3 tickets (S001, S002, S003)
      // Service 2 (Accounts, 15m): 2 tickets (A001, A002)
      // Service 3 (Deposit, 5m): 1 ticket (D001)
      // Service 4 (Payments, 3m): 0 tickets
      // Counter 1 handles: Service 1 and Service 2.
      // Longest queue between S1 (3) and S2 (2) is Service 1.
      const ticket = CounterRepository.callNextCustomer(1);
      expect(ticket).not.toBeNull();
      expect(ticket.serviceId).toBe(1);
      expect(ticket.counterId).toBe(1);
      expect(ticket.calledAt).toBeDefined();

      // Check DB updated status to CALLED
      const row = db
        .prepare("SELECT * FROM tickets WHERE id = ?")
        .get(ticket.id);
      expect(row.STATUS).toBe("CALLED");
      expect(row.counter_id).toBe(1);
    });

    it("breaks ties using lowest service_time, then lowest service_id", () => {
      db.exec("DELETE FROM tickets");
      // Create 1 ticket for Service 1 (serviceTime: 10) and 1 ticket for Service 3 (serviceTime: 5)
      // Counter 4 handles all services (1, 2, 3, 4) in seed.sql
      db.exec(`
        INSERT INTO tickets (id, code, service_id, status) VALUES
          (101, 'S101', 1, 'WAITING'),
          (102, 'D102', 3, 'WAITING');
      `);

      // Both queues have length 1.
      // Service 3 has service_time = 5, Service 1 has service_time = 10.
      // Counter 4 should pick Service 3 because service_time 5 < 10.
      const ticket = CounterRepository.callNextCustomer(4);
      expect(ticket).not.toBeNull();
      expect(ticket.serviceId).toBe(3);
      expect(ticket.code).toBe("D102");
    });
  });
});
