import path from "path";
import fs from "fs";

import db from "#/database/database.js";

const SEED_PATH = path.resolve(
  process.cwd(),
  "src",
  "database",
  "sql",
  "seed.sql",
);

export default function seed() {
  try {
    const seed = fs.readFileSync(SEED_PATH, "utf8");
    db.exec(seed);
  } catch (error) {
    console.error(`Failed to seed database: ${error.message}`);
  }
}

seed();
