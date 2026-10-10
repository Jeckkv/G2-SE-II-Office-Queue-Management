import db from "#src/database/database.js";
import Ticket from "#src/models/tickets/ticket.js";
import dayjs from "dayjs";

export default class TicketRepository {
  static TABLE_NAME = "tickets";

  /**
   * @param {Ticket} ticket The ticket that needs to be saved in the database.
   * @returns The ID assigned to the ticket.
   */
  static save(ticket) {
    const query =
      `INSERT INTO ${this.TABLE_NAME} (code, service_id, status, counter_id, created_at, called_at) ` +
      "VALUES (@code, @serviceID, @status, @counterID, @createdAt, @calledAt)";
    const lastID = db.prepare(query).run({
      code: String(Date.now()), // FIXME. This is just a placeholder.
      serviceID: ticket.serviceId,
      status: ticket.status,
      counterID: ticket.counterId,
      createdAt: ticket.createdAt,
      calledAt: ticket.calledAt,
    }).lastInsertRowid;

    return lastID;
  }

 /**
   * Story "Call customer": tickets called today, most recent first,
   * with the counter number and service name for the display board.
   * @param {number} limit Maximum number of tickets to return.
   */
  static getCalledToday(limit) {
    const today = dayjs().format("YYYY-MM-DD");
    const query =
      "SELECT t.id, t.code, t.service_id, s.name AS service_name, " +
      "t.counter_id, c.number AS counter_number, t.called_at " +
      `FROM ${this.TABLE_NAME} t ` +
      "JOIN counters c ON c.id = t.counter_id " +
      "JOIN services s ON s.id = t.service_id " +
      "WHERE t.issue_date = @today AND t.called_at IS NOT NULL " +
      "ORDER BY t.called_at DESC, t.id DESC LIMIT @limit";

    return db
      .prepare(query)
      .all({ today, limit })
      .map((/** @type {any} */ row) => ({
        id: row.id,
        code: row.code,
        serviceId: row.service_id,
        serviceName: row.service_name,
        counterId: row.counter_id,
        counterNumber: row.counter_number,
        calledAt: row.called_at,
      }));
  }
}