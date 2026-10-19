/**
 * Unit tests – Story 1: "Get ticket"
 * Tests the Service domain model in isolation (no database, no HTTP).
 */
import { describe, it, expect } from "vitest";
import Service from "#src/models/services/service.js";
import { SERVICE_TYPES, NOF_SERVICES } from "#src/models/services/service-types.js";

describe("Service – constructor()", () => {
  it("stores all fields passed in", () => {
    const s = new Service({
      id: 1,
      tag: "DEPOSIT",
      name: "Deposit money",
      codePrefix: "D",
      serviceTime: 5,
    });
    expect(s.id).toBe(1);
    expect(s.tag).toBe("DEPOSIT");
    expect(s.name).toBe("Deposit money");
    expect(s.codePrefix).toBe("D");
    expect(s.serviceTime).toBe(5);
  });

  it("creates the four seeded services without error", () => {
    const fixtures = [
      { id: 1, tag: "DEPOSIT",  name: "Deposit money",      codePrefix: "D", serviceTime: 5  },
      { id: 2, tag: "SHIPPING", name: "Send a package",     codePrefix: "S", serviceTime: 10 },
      { id: 3, tag: "ACCOUNTS", name: "Account management", codePrefix: "A", serviceTime: 15 },
      { id: 4, tag: "PAYMENTS", name: "Bill payments",      codePrefix: "P", serviceTime: 3  },
    ];
    fixtures.forEach((data) => {
      const s = new Service(data);
      expect(s.id).toBe(data.id);
      expect(s.tag).toBe(data.tag);
    });
  });
});

describe("SERVICE_TYPES", () => {
  it("is frozen (immutable)", () => {
    expect(Object.isFrozen(SERVICE_TYPES)).toBe(true);
  });

  it("contains exactly 4 services", () => {
    expect(NOF_SERVICES).toBe(4);
  });

  it("maps ids 1-4 to the correct service tags", () => {
    expect(SERVICE_TYPES[1]).toBe("DEPOSIT");
    expect(SERVICE_TYPES[2]).toBe("SHIPPING");
    expect(SERVICE_TYPES[3]).toBe("ACCOUNTS");
    expect(SERVICE_TYPES[4]).toBe("PAYMENTS");
  });

  it("NOF_SERVICES equals the number of keys in SERVICE_TYPES", () => {
    expect(NOF_SERVICES).toBe(Object.keys(SERVICE_TYPES).length);
  });
});
