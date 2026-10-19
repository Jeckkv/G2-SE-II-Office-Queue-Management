/**
 * Test-only database helpers.
 *
 * resetDb() and closeDb() belong here — in the test helpers — not in the
 * production database module. The production module stays unchanged.
 *
 * The db singleton is shared because all imports of
 * #src/database/database.js resolve to the same module instance within a
 * single vitest worker (pool: 'forks' guarantees one worker per file, so
 * there is no cross-file contamination).
 */
import path from "path";
import fs from "fs";
import db from "#src/database/database.js";

const SCHEMA_PATH = path.resolve(
  process.cwd(),
  "src",
  "database",
  "sql",
  "schema.sql",
);

const SEED_PATH = path.resolve(
  process.cwd(),
  "src",
  "database",
  "sql",
  "seed.sql",
);

/**
 * Drops all tables, re-applies the schema, and optionally re-seeds.
 * Call in beforeAll() or beforeEach() to start each test from a clean state.
 * @param {{ seed?: boolean }} [opts]
 */
export function resetDb({ seed = true } = {}) {
  db.pragma("foreign_keys = OFF");
  db.exec(`
    DROP TABLE IF EXISTS tickets;
    DROP TABLE IF EXISTS counter_services;
    DROP TABLE IF EXISTS counters;
    DROP TABLE IF EXISTS services;
  `);
  db.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);

  if (seed) {
    const seedSql = fs.readFileSync(SEED_PATH, "utf8");
    db.exec(seedSql);
  }
}

/** Closes the database connection. Call in afterAll(). */
export function closeDb() {
  db.close();
}
