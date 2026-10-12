import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp, db, resetDb } from './helpers.js';

const app = createApp();
const endpoint = (id) => `/api/v1/counters/${id}/next`;

describe('OQM-34: Call Customer API + SQLite integration', () => {
  beforeEach(resetDb);

  it.each(['abc', '0', '-1', '1.5', '0x10', '1e1'])('rejects invalid counter ID %s with 400', async (id) => {
    const response = await request(app).post(endpoint(id));
    expect(response.status).toBe(400);
  });

  it('returns 404 for an unknown counter', async () => {
    const response = await request(app).post(endpoint(999));
    expect(response.status).toBe(404);
  });

  it('calls the oldest ticket of the longest eligible queue', async () => {
    const response = await request(app).post(endpoint(2)); // Deposit 4, Shipping 2
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ code: 'D001', serviceId: 1, counterId: 2 });
    expect(response.body.calledAt).toBeTruthy();
    const ticket = db.prepare('SELECT STATUS, counter_id, called_at FROM tickets WHERE id = ?').get(response.body.id);
    expect(ticket.STATUS).toBe('CALLED');
    expect(ticket.counter_id).toBe(2);
    expect(ticket.called_at).toBeTruthy();
  });

  it('calls tickets once, in FIFO order, then returns 204', async () => {
    const codes = [];
    for (let i = 0; i < 4; i++) {
      const response = await request(app).post(endpoint(1));
      expect(response.status).toBe(200);
      codes.push(response.body.code);
    }
    expect(codes).toEqual(['D001', 'D002', 'D003', 'D004']);
    const empty = await request(app).post(endpoint(1));
    expect(empty.status).toBe(204);
    expect(empty.text).toBe('');
  });

  it('cannot call a ticket for a service not supported by the counter', async () => {
    db.exec('DELETE FROM tickets');
    db.prepare('INSERT INTO tickets (code, service_id) VALUES (?, ?)').run('S001', 2);
    expect((await request(app).post(endpoint(1))).status).toBe(204);
    expect(db.prepare('SELECT STATUS FROM tickets WHERE code = ?').get('S001').STATUS).toBe('WAITING');
  });

  it('ignores tickets issued on a previous day', async () => {
    db.exec('DELETE FROM tickets');
    db.prepare("INSERT INTO tickets (code, service_id, issue_date) VALUES ('D001', 1, date('now', 'localtime', '-1 day'))").run();
    expect((await request(app).post(endpoint(1))).status).toBe(204);
  });

  it('prefers shorter service time when queues tie', async () => {
    db.exec('DELETE FROM tickets');
    // Counter 2 serves Deposit (5m) and Shipping (10m).
    db.prepare('INSERT INTO tickets (code, service_id) VALUES (?, ?)').run('S001', 2);
    db.prepare('INSERT INTO tickets (code, service_id) VALUES (?, ?)').run('D001', 1);
    const response = await request(app).post(endpoint(2));
    expect(response.status).toBe(200);
    expect(response.body.code).toBe('D001');
  });
});
