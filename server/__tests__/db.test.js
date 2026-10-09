import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Use an in-memory database so tests never touch the real DB file.
process.env.DB_PATH = ':memory:'

import { all, get, run, resetDb, closeDb } from '../db/db.js'

describe('Database helpers', () => {
  beforeAll(async () => {
    await resetDb() // creates tables + loads seed data in :memory:
  })

  afterAll(async () => {
    await closeDb()
  })

  it('should return seeded services', async () => {
    const services = await all('SELECT * FROM services')
    expect(services).toBeDefined()
    expect(services.length).toBe(4) // DEPOSIT, SHIPPING, ACCOUNTS, PAYMENTS
  })

  it('should return a single service by id', async () => {
    const service = await get('SELECT * FROM services WHERE id = ?', [1])
    expect(service).toBeDefined()
    expect(service.id).toBe(1)
    expect(service.tag).toBe('DEPOSIT')
    expect(service.service_time).toBe(5)
  })

  it('should return seeded counters', async () => {
    const counters = await all('SELECT * FROM counters')
    expect(counters).toHaveLength(4)
  })

  it('should enforce counter-service relationships', async () => {
    // Counter 2 handles Deposit (1) + Shipping (2)
    const cs = await all(
      'SELECT service_id FROM counter_services WHERE counter_id = ? ORDER BY service_id',
      [2]
    )
    expect(cs.map((r) => r.service_id)).toEqual([1, 2])
  })

  it('should insert and retrieve a ticket', async () => {
    const { lastID } = await run(
      "INSERT INTO tickets (code, service_id) VALUES (?, ?)",
      ['TEST-001', 1]
    )
    expect(lastID).toBeGreaterThan(0)

    const ticket = await get('SELECT * FROM tickets WHERE id = ?', [lastID])
    expect(ticket.code).toBe('TEST-001')
    expect(ticket.service_id).toBe(1)
    expect(ticket.status).toBe('WAITING')
    expect(ticket.counter_id).toBeNull()
  })
})
