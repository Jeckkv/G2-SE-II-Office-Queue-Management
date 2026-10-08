# Office Queue Management System

System that manages the queues of an office with several counters (e.g. a post office): customers get a ticket for a service, officers call the next customer, and a main display board shows the called tickets and queue lengths.

## Repository structure

```
.
├── client/   # Frontend (React + Vite, JavaScript)
├── server/   # Backend (Node.js; for now only the database module)
└── db/       # SQL scripts: schema.sql (tables) and seed.sql (initial data)
```

## Requirements

- Node.js 22.22 or newer (required by React Router 8). Check with `node -v`.

## Frontend

### Run

```bash
cd client
npm install
npm run dev
```

The app opens at http://localhost:5173.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `client/dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Check the code with ESLint |

### Routes

| Path | Page | Story |
|---|---|---|
| `/` | Role selection (customer / officer / display) | — |
| `/customer` | Get a ticket | Story 1 |
| `/officer` | Counter: call the next customer | Story 2 |
| `/display` | Main display board (full screen, no header) | Story 3 |

### Folder structure

```
client/src/
├── main.jsx         # Entry point, wraps the app in the router
├── App.jsx          # All route definitions
├── index.css        # Global styles
├── api/client.js    # All calls to the backend (pages never call fetch directly)
├── components/      # Shared components (Layout with header and nav)
└── pages/           # One component per route
```

### Talking to the backend

The frontend calls the backend through relative `/api/...` URLs. In development, Vite forwards them to the backend (proxy in `client/vite.config.js`), so there are no CORS issues and no hardcoded backend URL.

The backend doesn't exist yet: the backend port and every endpoint in `src/api/client.js` are proposals marked with `TODO(backend)`. Search the project for `TODO(backend)` to find everything to update once the API is agreed.

### Conventions

- Line endings are normalized to LF via `.gitattributes`.
- Each story's page has `TODO(story N)` comments showing where to start.

## Backend

TODO(backend): add setup and run instructions.

### Database

SQLite, accessed with the [`sqlite3`](https://www.npmjs.com/package/sqlite3) package. The database file (`server/oqm.db`) is created locally and ignored by git: only the SQL scripts in `db/` are committed.

Create the database, or reset it to the initial data (e.g. the morning of the demo):

```bash
cd server
npm install
npm run db:reset
```

This runs `db/schema.sql` (drops and recreates all tables) and then `db/seed.sql` (4 services, 4 counters, a few waiting tickets for today), and prints today's queue lengths.

#### Using the database in the backend

Always go through `server/db/db.js`, never open a `sqlite3.Database` directly: the module enables `PRAGMA foreign_keys = ON` on the connection (SQLite ignores foreign keys otherwise) and wraps the callback API in Promises.

```js
import { all, get, run } from './db/db.js'

const services = await all('SELECT * FROM services')                // array of rows
const service = await get('SELECT * FROM services WHERE id = ?', [id]) // one row or undefined
const { lastID, changes } = await run('INSERT INTO tickets (code, service_id) VALUES (?, ?)', [code, serviceId])
```

- Always pass values as `?` parameters, never by concatenating strings into the SQL.
- `DB_PATH` environment variable: use another database file. With `DB_PATH=:memory:` the database lives in memory, useful for tests: call `await resetDb()` before each test (or `resetDb({ seed: false })` for empty tables) and `await closeDb()` at the end.
- A queue is "the `WAITING` tickets of a service with `issue_date` = today", so queues start empty every day without deleting anything.