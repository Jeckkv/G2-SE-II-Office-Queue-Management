import express from "express";
import { param, query } from "express-validator";
import { StatusCodes } from "http-status-codes";

import validate from "#src/middlewares/validate.js";
import { NOF_SERVICES } from "#src/models/services/service-types.js";
import TicketRepository from "#src/models/tickets/repository.js";
import Ticket from "#src/models/tickets/ticket.js";

const router = express.Router();

/**
 * Story "Call customer": returns today's called tickets, most recent first,
 * so the display board can show which ticket goes to which counter.
 */
router.get(
  "/called",
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit should be a value between 1 and 50.")
    .toInt(),
  validate,
  (req, res) => {
    const limit = /** @type {any} */ (req).cleanData.limit ?? 5;
    const tickets = TicketRepository.getCalledToday(limit);
    return res.status(StatusCodes.OK).json(tickets);
  },
);

/**
 * Creates a new ticket for the specified service.
 */
router.post(
  "/:serviceid",
  param("serviceid")
    .exists()
    .withMessage("Service ID is required.")
    .isInt({ min: 1, max: NOF_SERVICES })
    .withMessage(`Service ID should be a value between 1 and ${NOF_SERVICES}.`)
    .toInt(),
  validate,
  (req, res) => {
    const { serviceid } = /** @type {any} */ (req).cleanData;

    const ticket = Ticket.createNew(serviceid);
    const { id, code } = TicketRepository.save(ticket);
    ticket.id = id;
    ticket.code = code;

    return res.status(StatusCodes.OK).json({
      message: "Successfully created ticket.",
      id: ticket.id,
      code: ticket.code,
      serviceId: ticket.serviceId,
    });
  },
);

export default router;