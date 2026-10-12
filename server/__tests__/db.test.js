process.env.DB_PATH = ":memory:";

import { afterAll, beforeEach, describe, expect, it } from "vitest";

const { default: db } = await import("#src/database/database.js");
const { resetDb, closeDb } = await import("../tests/helpers/test-db.js");
const ServiceRepository = (await import("#src/models/services/repository.js")).default;
const CounterRepository = (await import("#src/models/counters/repository.js")).default;
const TicketRepository = (await import("#src/models/tickets/repository.js")).default;
const Ticket = (await import("#src/models/tickets/ticket.js")).default;

describe("Database helpers", () => {
  beforeEach(() => {
    resetDb({ seed: true });
  });

  it("should return seeded services", () => {
    const services = db.prepare("SELECT * FROM services").all();
    expect(services).toBeDefined();
    expect(services.length).toBe(4);
  });

  it("should return a single service by id", () => {
    const service = db.prepare("SELECT * FROM services WHERE id = ?").get(1);
    expect(service).toBeDefined();
    expect(service.id).toBe(1);
    expect(service.tag).toBe("DEPOSIT");
    expect(service.service_time).toBe(5);
  });

  it("should return seeded counters", () => {
    const counters = db.prepare("SELECT * FROM counters").all();
    expect(counters).toHaveLength(4);
  });

  it("should enforce counter-service relationships", () => {
    const cs = db
      .prepare(
        "SELECT service_id FROM counter_services WHERE counter_id = ? ORDER BY service_id",
      )
      .all(2);
    expect(cs.map((r) => r.service_id)).toEqual([1, 2]);
  });

  it("should insert and retrieve a ticket", () => {
    const { lastInsertRowid: lastID } = db
      .prepare("INSERT INTO tickets (code, service_id) VALUES (?, ?)")
      .run("TEST-001", 1);

    expect(lastID).toBeGreaterThan(0n);

    const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(Number(lastID));
    expect(ticket.code).toBe("TEST-001");
    expect(ticket.service_id).toBe(1);
    const status = ticket.STATUS ?? ticket.status;
    expect(status).toBe("WAITING");
    expect(ticket.counter_id).toBeNull();
  });
});

describe("Database & Repositories", () => {
  beforeEach(() => {
    resetDb({ seed: true });
  });

  it("should return seeded services", () => {
    const services = ServiceRepository.getAll();
    expect(services).toBeDefined();
    expect(services.length).toBe(4);
    expect(services[0].tag).toBe("DEPOSIT");
  });

  it("should return seeded counters and check existence", () => {
    expect(CounterRepository.exists(1)).toBe(true);
    expect(CounterRepository.exists(9999)).toBe(false);

    const counters = CounterRepository.getAll();
    expect(counters).toHaveLength(4);
    expect(counters[0]).toHaveProperty("number");
    expect(counters[0]).toHaveProperty("serviceIds");
  });

  it("should create a new ticket with properly formatted sequential code", () => {
    const ticket = Ticket.createNew(1);
    const result = TicketRepository.save(ticket);

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.code).toMatch(/^D\d{3}$/);
  });

  it("should call next customer for a counter", () => {
    const called = CounterRepository.callNextCustomer(1);
    expect(called).toBeDefined();
    expect(called.counterId).toBe(1);
    expect(called.calledAt).toBeDefined();

    const calledToday = TicketRepository.getCalledToday(5);
    expect(calledToday.length).toBeGreaterThan(0);
    expect(calledToday[0].code).toBe(called.code);
  });
});

afterAll(() => {
  closeDb();
});
