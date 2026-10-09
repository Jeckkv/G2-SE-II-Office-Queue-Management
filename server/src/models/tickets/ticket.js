import TICKET_STATUS from "#src/models/tickets/ticket-status.js";
import dayjs from "dayjs";

export default class Ticket {
  /**
   * @param {Object} ticket
   * @param {*} ticket.id
   * @param {*} ticket.code
   * @param {*} ticket.serviceId
   * @param {*} ticket.status A value in ["WAITING", "CALLED", "SERVED"].
   * @param {*} ticket.counterId
   * @param {*} ticket.issueDate
   * @param {*} ticket.createdAt
   * @param {*} ticket.calledAt
   */
  constructor({
    id,
    code,
    serviceId,
    status,
    counterId,
    issueDate,
    createdAt,
    calledAt,
  }) {
    this.id = id;
    this.code = code;
    this.serviceId = serviceId;
    this.status = status;
    this.counterId = counterId;
    this.issueDate = issueDate;
    this.createdAt = createdAt;
    this.calledAt = calledAt;
  }

  /**
   * @param {number} serviceid The ID of the service the ticket needs to be created for.
   */
  static createNew(serviceid) {
    return new Ticket({
      // `id` and `code` will be assigned by the database
      id: undefined,
      code: undefined,
      serviceId: serviceid,
      status: TICKET_STATUS.WAITING,
      counterId: null,
      issueDate: dayjs().format("YYYY-MM-DD"),
      createdAt: dayjs().format("YYYY-MM-DD[T]HH:mm:ss"),
      calledAt: null,
    });
  }
}
