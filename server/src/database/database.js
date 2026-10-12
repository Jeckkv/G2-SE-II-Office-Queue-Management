import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// DB_PATH env var: use another file (or :memory: for tests).
// The README already documents this: "With DB_PATH=:memory: the database lives in memory, useful for tests."
const DB_PATH = process.env.DB_PATH ?? path.resolve(process.cwd(), "data", "oqm-database.sqlite");

const SCHEMA_PATH = path.resolve(
  process.cwd(),
  "src",
  "database",
  "sql",
  "schema.sql",
);

const dbDir = path.dirname(DB_PATH);
if (DB_PATH !== ":memory:" && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const db = new Database(DB_PATH, {
  // verbose: console.log
});

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

try {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to create database: ${message}`);
}

export default db;

