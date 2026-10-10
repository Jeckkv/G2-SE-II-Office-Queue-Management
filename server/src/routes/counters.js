import express from "express";
import { StatusCodes } from "http-status-codes";

import CounterRepository from "#src/models/counters/repository.js";

const router = express.Router();

// Returns all counters with the service IDs each one handles.
// Used by the officer page to populate the counter dropdown.
router.get("/", (_req, res) => {
  const counters = CounterRepository.getAll();
  return res.status(StatusCodes.OK).json(counters);
});

// Story "Next customer": the officer calls the next customer to the counter.
// 200 + the called ticket | 204 if all the counter's queues are empty | 404 if the counter does not exist
router.post("/:counterId/next", (req, res) => {
  // Only plain digits: Number() alone would also accept "0x10", "1e1", " 3", "2.0"
  if (!/^[1-9]\d*$/.test(req.params.counterId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "BadRequest",
      message: "counterId must be a positive integer",
    });
  }
  const counterId = Number(req.params.counterId);

  if (!CounterRepository.exists(counterId)) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: "NotFound",
      message: `Counter ${counterId} does not exist`,
    });
  }

  const ticket = CounterRepository.callNextCustomer(counterId);
  if (!ticket) return res.status(StatusCodes.NO_CONTENT).end();

  return res.status(StatusCodes.OK).json(ticket);
});

export default router;
