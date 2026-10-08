-- =============================================================
-- Office Queue Management - Database schema (SQLite)
-- =============================================================
-- NOTE for the backend: SQLite does NOT enforce foreign keys by
-- default. Run "PRAGMA foreign_keys = ON;" on every new connection.
-- =============================================================
PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------
-- Service types offered by the office (defined at configuration time)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY,
    tag TEXT NOT NULL UNIQUE,  -- e.g. 'SHIPPING'
    name TEXT NOT NULL,  -- label shown to customers
    code_prefix TEXT NOT NULL UNIQUE -- letter used in ticket codes, e.g. 'S'
    CHECK (length(code_prefix) = 1),
    service_time INTEGER NOT NULL -- average service time, in minutes
    CHECK (service_time > 0)
);

-- -------------------------------------------------------------
-- Counters (Counter 1, Counter 2, ...)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS counters (
    id INTEGER PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE CHECK (number > 0)
);

-- -------------------------------------------------------------
-- Which services each counter can handle (many-to-many)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS counter_services (
    counter_id INTEGER NOT NULL REFERENCES counters(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (counter_id, service_id)
);

-- -------------------------------------------------------------
-- Tickets. A queue = the WAITING tickets of one service, issued today.
--   status WAITING -> in queue
--   status CALLED  -> called to a counter (= served, removed from queue)
--   status SERVED  -> reserved for the future story "Notify customer served"
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL,  -- e.g. 'S003'
    service_id INTEGER NOT NULL REFERENCES services(id),
    STATUS TEXT NOT NULL DEFAULT 'WAITING' CHECK (STATUS IN ('WAITING', 'CALLED', 'SERVED')),
    counter_id INTEGER REFERENCES counters(id),  -- NULL until the ticket is called
    issue_date TEXT NOT NULL DEFAULT (date('now', 'localtime')),  -- 'YYYY-MM-DD'
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    called_at TEXT,  -- NULL until the ticket is called
    UNIQUE (issue_date, code),  -- codes are unique in the office (per day)
    CHECK (
        (
            STATUS = 'WAITING'
            AND counter_id IS NULL
            AND called_at IS NULL
        )
        OR (
            STATUS <> 'WAITING'
            AND counter_id IS NOT NULL
            AND called_at IS NOT NULL
        )
    )
);

-- Speeds up the most frequent query: waiting tickets of a service today
CREATE INDEX IF NOT EXISTS idx_tickets_queue ON tickets (issue_date, STATUS, service_id, id);
