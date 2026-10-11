/**
 * Unit tests – Story 1: "Get ticket"
 * Tests the Ticket domain model in isolation (no database, no HTTP).
 */
import { describe, it, expect, beforeEach } from "vitest";
import Ticket from "#src/models/tickets/ticket.js";
import TICKET_STATUS from "#src/models/tickets/ticket-status.js";

describe("Ticket – createNew()", () => {
  let ticket;

  beforeEach(() => {
    ticket = Ticket.createNew(2);
  });

  it("creates a ticket with the given serviceId", () => {
    expect(ticket.serviceId).toBe(2);
  });

  it("starts with WAITING status", () => {
    expect(ticket.status).toBe(TICKET_STATUS.WAITING);
  });

  it("has no counter assigned (null)", () => {
    expect(ticket.counterId).toBeNull();
  });

  it("has no calledAt timestamp (null)", () => {
    expect(ticket.calledAt).toBeNull();
  });

  it("id and code are undefined until the database assigns them", () => {
    expect(ticket.id).toBeUndefined();
    expect(ticket.code).toBeUndefined();
  });

  it("issueDate is today in YYYY-MM-DD format", () => {
    expect(ticket.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const today = new Date().toISOString().slice(0, 10);
    expect(ticket.issueDate).toBe(today);
  });

  it("createdAt is a valid ISO-like datetime string", () => {
    // Format: YYYY-MM-DDTHH:mm:ss
    expect(ticket.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });

  it("accepts any valid service id (1-4)", () => {
    for (const id of [1, 2, 3, 4]) {
      const t = Ticket.createNew(id);
      expect(t.serviceId).toBe(id);
    }
  });
});

describe("Ticket – constructor()", () => {
  it("stores all fields passed in", () => {
    const data = {
      id: 42,
      code: "D001",
      serviceId: 1,
      status: TICKET_STATUS.CALLED,
      counterId: 3,
      issueDate: "2026-10-10",
      createdAt: "2026-10-10T09:00:00",
      calledAt: "2026-10-10T10:30:00",
    };
    const t = new Ticket(data);
    expect(t.id).toBe(42);
    expect(t.code).toBe("D001");
    expect(t.serviceId).toBe(1);
    expect(t.status).toBe(TICKET_STATUS.CALLED);
    expect(t.counterId).toBe(3);
    expect(t.issueDate).toBe("2026-10-10");
    expect(t.createdAt).toBe("2026-10-10T09:00:00");
    expect(t.calledAt).toBe("2026-10-10T10:30:00");
  });
});

describe("TICKET_STATUS", () => {
  it("is frozen (immutable)", () => {
    expect(Object.isFrozen(TICKET_STATUS)).toBe(true);
  });

  it("has the three expected values", () => {
    expect(TICKET_STATUS.WAITING).toBe("WAITING");
    expect(TICKET_STATUS.CALLED).toBe("CALLED");
    expect(TICKET_STATUS.SERVED).toBe("SERVED");
  });
});
