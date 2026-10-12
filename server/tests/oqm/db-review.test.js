import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDb } from './helpers.js';

describe('OQM-11: schema and seed review', () => {
  beforeEach(resetDb);

  it('seeds four services and four counters with valid assignments', () => {
    expect(db.prepare('SELECT COUNT(*) AS n FROM services').get().n).toBe(4);
    expect(db.prepare('SELECT COUNT(*) AS n FROM counters').get().n).toBe(4);
    expect(db.prepare('SELECT COUNT(*) AS n FROM counter_services').get().n).toBe(7);
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1);
    expect(db.pragma('foreign_key_check')).toEqual([]);
  });

  it('seeds daily demo tickets in WAITING state without a counter', () => {
    const tickets = db.prepare('SELECT code, STATUS, counter_id, called_at FROM tickets ORDER BY id').all();
    expect(tickets.map((ticket) => ticket.code)).toEqual(['D001','S001','D002','A001','D003','S002','D004']);
    expect(tickets.every((ticket) => ticket.STATUS === 'WAITING' && ticket.counter_id === null && ticket.called_at === null)).toBe(true);
  });

  it('rejects an unknown service reference', () => {
    expect(() => db.prepare("INSERT INTO tickets (code, service_id) VALUES ('X001', 999)").run()).toThrow();
  });

  it('rejects duplicate codes for the same day', () => {
    expect(() => db.prepare("INSERT INTO tickets (code, service_id) VALUES ('D001', 1)").run()).toThrow();
  });

  it('rejects invalid ticket status and inconsistent state', () => {
    expect(() => db.prepare("INSERT INTO tickets (code, service_id, STATUS) VALUES ('D099', 1, 'UNKNOWN')").run()).toThrow();
    expect(() => db.prepare("UPDATE tickets SET STATUS = 'CALLED' WHERE code = 'D001'").run()).toThrow();
  });

  it('rejects invalid counter number and invalid service duration', () => {
    expect(() => db.prepare('INSERT INTO counters (number) VALUES (0)').run()).toThrow();
    expect(() => db.prepare("INSERT INTO services (tag, name, code_prefix, service_time) VALUES ('TEST', 'Test', 'T', 0)").run()).toThrow();
  });
});
