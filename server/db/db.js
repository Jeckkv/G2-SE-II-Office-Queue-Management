// Database connection (SQLite via the "sqlite3" package).
// The rest of the backend imports the helpers below (all, get, run, ...)
// instead of using sqlite3 directly: they return Promises, so routes can use async/await.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sqlite3 from 'sqlite3'

// DB file location. Paths are resolved from this file, not from the current directory,
// so the backend works no matter where it is started from.
// Set DB_PATH to use another file, or ':memory:' for tests.
const DEFAULT_DB_PATH = fileURLToPath(new URL('../oqm.db', import.meta.url))
const SCHEMA_PATH = fileURLToPath(new URL('../../db/schema.sql', import.meta.url))
const SEED_PATH = fileURLToPath(new URL('../../db/seed.sql', import.meta.url))

// We keep the Promise (not the connection) so that concurrent callers
// during startup share the same connection instead of opening several.
let dbPromise = null

/** Returns the shared connection, opening it the first time. */
export function getDb() {
  if (!dbPromise) dbPromise = openDb(process.env.DB_PATH || DEFAULT_DB_PATH)
  return dbPromise
}

async function openDb(path) {
  const db = await new Promise((resolve, reject) => {
    const conn = new sqlite3.Database(path, (err) => (err ? reject(err) : resolve(conn)))
  })
  // SQLite does NOT enforce foreign keys by default: the setting is per connection,
  // so it must be enabled every time a connection is opened.
  // We await it before handing out the connection, so no query can run before it.
  await execOn(db, 'PRAGMA foreign_keys = ON')
  return db
}

function execOn(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()))
  })
}

/** All rows of a SELECT, e.g. await all('SELECT * FROM services') */
export async function all(sql, params = []) {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  })
}

/** First row of a SELECT, or undefined if there are no rows */
export async function get(sql, params = []) {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
  })
}

/** INSERT / UPDATE / DELETE. Resolves to { lastID, changes } */
export async function run(sql, params = []) {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    // Classic function (not arrow): sqlite3 puts lastID and changes on "this"
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

/** Runs a script with several statements (no parameters, no results) */
export async function exec(sql) {
  return execOn(await getDb(), sql)
}

/**
 * Recreates all tables from db/schema.sql and, by default, loads db/seed.sql.
 * Used by "npm run db:reset" and by tests (with DB_PATH=':memory:').
 */
export async function resetDb({ seed = true } = {}) {
  await exec(await readFile(SCHEMA_PATH, 'utf8'))
  if (seed) await exec(await readFile(SEED_PATH, 'utf8'))
}

/** Closes the connection (end of a script or of a test suite) */
export async function closeDb() {
  if (!dbPromise) return
  const db = await dbPromise
  dbPromise = null
  await new Promise((resolve, reject) => db.close((err) => (err ? reject(err) : resolve())))
}
