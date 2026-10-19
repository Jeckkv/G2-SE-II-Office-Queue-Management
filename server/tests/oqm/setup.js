// Loaded before test modules so database.js never opens the development database.
process.env.DB_PATH = ':memory:';
