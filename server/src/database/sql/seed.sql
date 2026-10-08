-- =============================================================
-- Office Queue Management - Seed data
-- Run AFTER schema.sql
-- =============================================================
PRAGMA foreign_keys = ON;

-- Services (service_time in minutes).
-- 'Deposit' reproduces the example in the specification (5 min).
INSERT INTO
    services (id, tag, name, code_prefix, service_time)
VALUES
    (1, 'DEPOSIT', 'Deposit money', 'D', 5),
    (2, 'SHIPPING', 'Send a package', 'S', 10),
    (3, 'ACCOUNTS', 'Account management', 'A', 15),
    (4, 'PAYMENTS', 'Bill payments', 'P', 3);

INSERT INTO
    counters (id, number)
VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 4);

-- Counter 1: Deposit only           (as in the spec example)
-- Counter 2: Deposit + Shipping     (as in the spec example)
-- Counter 3: Shipping + Accounts
-- Counter 4: Accounts + Payments
INSERT INTO
    counter_services (counter_id, service_id)
VALUES
    (1, 1),
    (2, 1),
    (2, 2),
    (3, 2),
    (3, 3),
    (4, 3),
    (4, 4);

-- -------------------------------------------------------------
-- OPTIONAL demo tickets (today's date), useful to see non-empty
-- queues while developing the UI. Delete this block if not needed.
-- Queue lengths: Deposit 4, Shipping 2, Accounts 1, Payments 0
-- -------------------------------------------------------------
INSERT INTO
    tickets (code, service_id)
VALUES
    ('D001', 1),
    ('S001', 2),
    ('D002', 1),
    ('A001', 3),
    ('D003', 1),
    ('S002', 2),
    ('D004', 1);

