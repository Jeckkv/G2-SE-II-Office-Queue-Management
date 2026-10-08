import express from "express";
import { StatusCodes } from "http-status-codes";

import ServiceRepository from "#/models/services/repository.js";

const router = express.Router();

router.get("/", (_req, res) => {
  const services = ServiceRepository.getAll();
  return res.status(StatusCodes.OK).json(services);
});

export default router;
