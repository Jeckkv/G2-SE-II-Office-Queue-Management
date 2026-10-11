/**
 * Builds the Express application without starting the HTTP server.
 * Import this in integration tests and pass the result to supertest().
 *
 * Mirrors index.js exactly — no production code is modified.
 */
import express from "express";
import configureCORS from "#src/middlewares/cors.js";
import ticketRouter from "#src/routes/tickets.js";
import serviceRouter from "#src/routes/services.js";
import counterRouter from "#src/routes/counters.js";
import errorHandler from "#src/middlewares/errorHandler.js";

const BASE_URL = "/api/v1";

export function createApp() {
  const app = express();

  app.use(express.json());
  configureCORS(app);

  app.use(`${BASE_URL}/tickets`, ticketRouter);
  app.use(`${BASE_URL}/services`, serviceRouter);
  app.use(`${BASE_URL}/counters`, counterRouter);

  app.use(errorHandler);

  return app;
}
