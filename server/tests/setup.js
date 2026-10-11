// Set the DB_PATH to :memory: before any tests run,
// so that the database module uses an in-memory database by default.
// This prevents test files from needing to set it (which fails due to ESM import hoisting).
process.env.DB_PATH = ':memory:';
