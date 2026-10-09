import express from "express";
import { param } from "express-validator";
import { StatusCodes } from "http-status-codes";

import validate from "#src/middlewares/validate.js";
import Queue from "#src/lib/queue.js";
import {
  NOF_SERVICES,
  SERVICE_TYPES,
} from "#src/models/services/service-types.js";
import TicketRepository from "#src/models/tickets/repository.js";
import Ticket from "#src/models/tickets/ticket.js";

const TICKETS_FOR_SERVICE = Array.from(
  { length: NOF_SERVICES },
  (_) => new Queue(),
);

const router = express.Router();

/**
 * Creates a new ticket for the specified service.
 */
router.get(
  "/:serviceid",
  param("serviceid")
    .exists()
    .withMessage("Service ID is required.")
    .isInt({ min: 1, max: NOF_SERVICES })
    .withMessage(`Service ID should be a value between 1 and ${NOF_SERVICES}.`)
    .toInt(),
  validate,
  (req, res) => {
    const { serviceid } = req.cleanData;

    const ticket = Ticket.createNew(serviceid);
    const lastID = TicketRepository.save(ticket);
    // I'm not really a fan of this
    ticket.id = lastID;
    ticket.code = `S${lastID}`;

    TICKETS_FOR_SERVICE[serviceid - 1].push(ticket.id);

    console.log("---");
    TICKETS_FOR_SERVICE.forEach((queue, idx) =>
      console.log(
        `Queue for service ${SERVICE_TYPES[idx + 1]}: ${queue.toString()}`,
      ),
    );
    console.log("---");

    return res
      .status(StatusCodes.OK)
      .json({ message: `Successfully created ticket.`, id: ticket.id });
  },
);

export default router;
