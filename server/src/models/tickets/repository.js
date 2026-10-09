import db from "#src/database/database.js";
import Ticket from "#src/models/tickets/ticket.js";

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
}
