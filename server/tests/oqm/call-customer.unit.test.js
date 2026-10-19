import { beforeEach, describe, expect, it, vi } from 'vitest';

// Repository-facing unit tests: substitute the prepared statement and avoid SQLite.
const state = vi.hoisted(() => ({ nextRow: null, counterExists: true, counters: [] }));
vi.mock('../../src/database/database.js', () => ({
  default: {
    prepare(sql) {
      if (sql.includes('UPDATE tickets')) return { get: () => state.nextRow };
      if (sql.includes('SELECT 1 FROM counters')) return { get: () => state.counterExists ? { 1: 1 } : undefined };
      if (sql.includes('GROUP_CONCAT')) return { all: () => state.counters };
      throw new Error('Unexpected SQL in mocked unit test');
    },
  },
}));
import CounterRepository from '../../src/models/counters/repository.js';

describe('OQM-34: CounterRepository unit tests (database mocked)', () => {
  beforeEach(() => { state.nextRow = null; state.counterExists = true; state.counters = []; });

  it('returns null when the prepared statement matches no ticket', () => {
    expect(CounterRepository.callNextCustomer(1)).toBeNull();
  });

  it('maps a selected ticket row to the API representation', () => {
    state.nextRow = { id: 9, code: 'D009', service_id: 1, counter_id: 2, called_at: '2026-10-12 10:00:00' };
    expect(CounterRepository.callNextCustomer(2)).toEqual({
      id: 9, code: 'D009', serviceId: 1, counterId: 2, calledAt: '2026-10-12 10:00:00',
    });
  });

  it('checks existence using the repository query', () => {
    expect(CounterRepository.exists(1)).toBe(true);
    state.counterExists = false;
    expect(CounterRepository.exists(999)).toBe(false);
  });

  it('transforms comma-separated service IDs into numbers', () => {
    state.counters = [{ id: 2, number: 2, service_ids: '1,2' }, { id: 3, number: 3, service_ids: null }];
    expect(CounterRepository.getAll()).toEqual([
      { id: 2, number: 2, serviceIds: [1, 2] },
      { id: 3, number: 3, serviceIds: [] },
    ]);
  });
});
