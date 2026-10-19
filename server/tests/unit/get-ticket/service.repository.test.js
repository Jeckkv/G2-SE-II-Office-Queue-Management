/**
 * Unit tests – Story 1: "Get ticket"
 * Tests ServiceRepository.getAll() using an in-memory SQLite database.
 * The DB module is loaded AFTER setting DB_PATH so it uses :memory:.
 */

// Must be set BEFORE importing any module that loads the database singleton.
process.env.DB_PATH = ":memory:";

import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { resetDb, closeDb } from "../../helpers/test-db.js";
import ServiceRepository from "#src/models/services/repository.js";
import Service from "#src/models/services/service.js";

describe("ServiceRepository.getAll()", () => {
  beforeAll(() => {
    resetDb({ seed: true }); // loads schema + seed data
  });

  afterAll(() => {
    closeDb();
  });

  it("returns an array", () => {
    const result = ServiceRepository.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns 4 services (matching the seed data)", () => {
    const result = ServiceRepository.getAll();
    expect(result).toHaveLength(4);
  });

  it("each element is an instance of Service", () => {
    const result = ServiceRepository.getAll();
    result.forEach((s) => expect(s).toBeInstanceOf(Service));
  });

  it("includes the DEPOSIT service with correct fields", () => {
    const result = ServiceRepository.getAll();
    const deposit = result.find((s) => s.tag === "DEPOSIT");
    expect(deposit).toBeDefined();
    expect(deposit.id).toBe(1);
    expect(deposit.name).toBe("Deposit money");
    expect(deposit.codePrefix).toBe("D");
    expect(deposit.serviceTime).toBe(5);
  });

  it("includes SHIPPING, ACCOUNTS and PAYMENTS", () => {
    const result = ServiceRepository.getAll();
    const tags = result.map((s) => s.tag);
    expect(tags).toContain("SHIPPING");
    expect(tags).toContain("ACCOUNTS");
    expect(tags).toContain("PAYMENTS");
  });

  it("every service has id, tag, name, codePrefix and serviceTime", () => {
    const result = ServiceRepository.getAll();
    result.forEach((s) => {
      expect(s.id).toBeTypeOf("number");
      expect(s.tag).toBeTypeOf("string");
      expect(s.name).toBeTypeOf("string");
      expect(s.codePrefix).toBeTypeOf("string");
      expect(s.serviceTime).toBeTypeOf("number");
      expect(s.serviceTime).toBeGreaterThan(0);
    });
  });
});
