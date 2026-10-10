import dayjs from "dayjs";

import db from "#src/database/database.js";
import Ticket from "#src/models/tickets/ticket.js";

export default class TicketRepository {
  static TABLE_NAME = "tickets";

  /**
   * Saves a new ticket and assigns it a code made of the service prefix and a
   * daily counter for that service, e.g. "D003" (codes restart every day).
   * Runs in a transaction so two tickets can never get the same code.
   * @param {Ticket} ticket The ticket that needs to be saved in the database.
   * @returns {{ id: number, code: string }} The ID and code assigned to the ticket.
   */
  static save(ticket) {
    const insertTicket = db.transaction(() => {
      const service = /** @type {any} */ (
        db
          .prepare("SELECT code_prefix FROM services WHERE id = ?")
          .get(ticket.serviceId)
      );
      const { count } = /** @type {any} */ (
        db
          .prepare(
            `SELECT COUNT(*) AS count FROM ${this.TABLE_NAME} WHERE service_id = ? AND issue_date = ?`,
          )
          .get(ticket.serviceId, ticket.issueDate)
      );
      const code = `${service.code_prefix}${String(count + 1).padStart(3, "0")}`;

      const query =
        `INSERT INTO ${this.TABLE_NAME} (code, service_id, status, counter_id, issue_date, created_at, called_at) ` +
        "VALUES (@code, @serviceID, @status, @counterID, @issueDate, @createdAt, @calledAt)";
      const id = Number(
        db.prepare(query).run({
          code,
          serviceID: ticket.serviceId,
          status: ticket.status,
          counterID: ticket.counterId,
          issueDate: ticket.issueDate,
          createdAt: ticket.createdAt,
          calledAt: ticket.calledAt,
        }).lastInsertRowid,
      );

      return { id, code };
    });

    return insertTicket();
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