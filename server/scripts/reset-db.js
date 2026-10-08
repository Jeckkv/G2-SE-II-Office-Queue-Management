// Creates (or resets) the local database: schema + seed data.
// Usage: npm run db:reset   (run it e.g. the morning of the demo to start from clean queues)

import { all, closeDb, resetDb } from '../db/db.js'

try {
  await resetDb()

  // Read the data back through the same connection module the backend uses,
  // so a successful run also proves that the backend can read the database.
  const queues = await all(`
    SELECT s.code_prefix, s.name, COUNT(t.id) AS length
    FROM services s
    LEFT JOIN tickets t ON t.service_id = s.id
                       AND t.status = 'WAITING'
                       AND t.issue_date = date('now', 'localtime')
    GROUP BY s.id
    ORDER BY s.id`)

  console.log('Database reset. Today\'s queues:')
  console.table(queues)
} catch (err) {
  console.error('Database reset failed:', err.message)
  process.exitCode = 1
} finally {
  await closeDb()
}
