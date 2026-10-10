import db from "#src/database/database.js";

// Picks the next ticket for a counter and marks it as CALLED, in ONE statement:
// - among the services the counter handles, take the one with the longest queue today
//   (ties: lowest service time, then lowest service id so the result is deterministic);
// - in that queue, take the oldest ticket (lowest id);
// - set it to CALLED at this counter and return it (RETURNING).
// A single statement is atomic: two counters calling at the same time
// can never get the same ticket.
// If all the counter's queues are empty, the subquery gives NULL and no row is updated.
const callNextStatement = db.prepare(`
  UPDATE tickets
  SET status = 'CALLED',
      counter_id = @counterId,
      called_at = datetime('now', 'localtime')
  WHERE id = (
    SELECT t.id
    FROM tickets t
    JOIN (
      SELECT s.id AS service_id
      FROM counter_services cs
      JOIN services s ON s.id = cs.service_id
      JOIN tickets q ON q.service_id = s.id
                    AND q.status = 'WAITING'
                    AND q.issue_date = date('now', 'localtime')
      WHERE cs.counter_id = @counterId
      GROUP BY s.id
      ORDER BY COUNT(q.id) DESC, s.service_time ASC, s.id ASC
      LIMIT 1
    ) best ON best.service_id = t.service_id
    WHERE t.status = 'WAITING'
      AND t.issue_date = date('now', 'localtime')
    ORDER BY t.id
    LIMIT 1
  )
  RETURNING id, code, service_id, counter_id, called_at
`);

const existsStatement = db.prepare("SELECT 1 FROM counters WHERE id = ?");

export default class CounterRepository {
  /**
   * @param {number} counterId
   * @returns true if a counter with this id exists.
   */
  static exists(counterId) {
    return existsStatement.get(counterId) !== undefined;
  }

  /**
   * Calls the next customer to a counter (story "Next customer").
   * @param {number} counterId
   * @returns the called ticket, or null if all the counter's queues are empty.
   */
  static callNextCustomer(counterId) {
    const row = callNextStatement.get({ counterId });
    if (!row) return null;

    return {
      id: row.id,
      code: row.code,
      serviceId: row.service_id,
      counterId: row.counter_id,
      calledAt: row.called_at,
    };
  }
}
