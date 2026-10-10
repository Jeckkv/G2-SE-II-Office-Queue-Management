import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "data", "oqm-database.sqlite");
const SCHEMA_PATH = path.resolve(
  process.cwd(),
  "src",
  "database",
  "sql",
  "schema.sql",
);

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
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
  console.error(`Failed to create database: ${error.message}`);
}

export default db;
