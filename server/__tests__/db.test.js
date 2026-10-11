import { describe, it, expect, beforeAll } from "vitest";

import db from "#src/database/database.js";
import ServiceRepository from "#src/models/services/repository.js";
import CounterRepository from "#src/models/counters/repository.js";
import TicketRepository from "#src/models/tickets/repository.js";
import Ticket from "#src/models/tickets/ticket.js";

describe("Database & Repositories", () => {

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
    // Counter 1 serves service 1 (Deposit)
    const called = CounterRepository.callNextCustomer(1);
    expect(called).toBeDefined();
    expect(called.counterId).toBe(1);
    expect(called.calledAt).toBeDefined();

    // Verify it appears in called tickets for today
    const calledToday = TicketRepository.getCalledToday(5);
    expect(calledToday.length).toBeGreaterThan(0);
    expect(calledToday[0].code).toBe(called.code);
  });
});
