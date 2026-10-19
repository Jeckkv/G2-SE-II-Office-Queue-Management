import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import db from '../../src/database/database.js';
import configureCORS from '../../src/middlewares/cors.js';
import ticketRouter from '../../src/routes/tickets.js';
import serviceRouter from '../../src/routes/services.js';
import counterRouter from '../../src/routes/counters.js';
import errorHandler from '../../src/middlewares/errorHandler.js';

export function resetDb() {
  // Only ever reset the SQLite database created by the test process.
  if (process.env.DB_PATH !== ':memory:') throw new Error('Unsafe test DB_PATH');
  db.pragma('foreign_keys = OFF');
  db.exec('DROP TABLE IF EXISTS tickets; DROP TABLE IF EXISTS counter_services; DROP TABLE IF EXISTS counters; DROP TABLE IF EXISTS services;');
  db.pragma('foreign_keys = ON');
  db.exec(fs.readFileSync(path.resolve(process.cwd(), 'src/database/sql/schema.sql'), 'utf8'));
  db.exec(fs.readFileSync(path.resolve(process.cwd(), 'src/database/sql/seed.sql'), 'utf8'));
}

export function createApp() {
  const app = express();
  app.use(express.json());
  configureCORS(app);
  app.use('/api/v1/tickets', ticketRouter);
  app.use('/api/v1/services', serviceRouter);
  app.use('/api/v1/counters', counterRouter);
  app.use(errorHandler);
  return app;
}

export { db };
