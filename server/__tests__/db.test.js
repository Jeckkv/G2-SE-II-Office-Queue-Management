import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Use an in-memory database so tests never touch the real DB file.
process.env.DB_PATH = ':memory:'

import db from '#src/database/database.js'
import { resetDb, closeDb } from '../tests/helpers/test-db.js'


describe('Database helpers', () => {
  beforeAll(() => {
    resetDb({ seed: true }) // creates tables + loads seed data in :memory:
  })

  afterAll(() => {
    closeDb()
  })

  it('should return seeded services', () => {
    const services = db.prepare('SELECT * FROM services').all()
    expect(services).toBeDefined()
    expect(services.length).toBe(4) // DEPOSIT, SHIPPING, ACCOUNTS, PAYMENTS
  })

  it('should return a single service by id', () => {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(1)
    expect(service).toBeDefined()
    expect(service.id).toBe(1)
    expect(service.tag).toBe('DEPOSIT')
    expect(service.service_time).toBe(5)
  })

  it('should return seeded counters', () => {
    const counters = db.prepare('SELECT * FROM counters').all()
    expect(counters).toHaveLength(4)
  })

  it('should enforce counter-service relationships', () => {
    // Counter 2 handles Deposit (1) + Shipping (2)
    const cs = db
      .prepare('SELECT service_id FROM counter_services WHERE counter_id = ? ORDER BY service_id')
      .all(2)
    expect(cs.map((r) => r.service_id)).toEqual([1, 2])
  })

  it('should insert and retrieve a ticket', () => {
    const { lastInsertRowid: lastID } = db
      .prepare("INSERT INTO tickets (code, service_id) VALUES (?, ?)")
      .run('TEST-001', 1)
    expect(lastID).toBeGreaterThan(0n)

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(Number(lastID))
    expect(ticket.code).toBe('TEST-001')
    expect(ticket.service_id).toBe(1)
    // The schema defines the column as STATUS (uppercase); better-sqlite3 preserves the case
    const status = ticket.STATUS ?? ticket.status
    expect(status).toBe('WAITING')
    expect(ticket.counter_id).toBeNull()
  })
})

