# Testing Guide – Office Queue Management (Story 1 & Story 2)

This document describes the commands to run the complete test suite (Unit, Integration, and End-to-End) for:
- **Story 1 ("Get ticket")**: Customer selects a service and receives an issued ticket.
- **Story 2 ("Next customer")**: Officer calls the next customer to their service counter.

---

## 1. Backend Testing (Server) – Vitest & Supertest

Backend tests consist of unit tests (models, repositories, database initialization) and integration tests (Express API routes).

### Navigate to the `server` directory:
```bash
cd server
```

### Available Commands:

| Command | Description |
| :--- | :--- |
| `npm run test:coverage` | **Runs all tests with code coverage report** (Statements, Branches, Functions, Lines). |
| `npm test` | Runs all tests without coverage report (fastest execution). |
| `npm run test:watch` | Starts Vitest in interactive watch mode (re-runs tests on file changes). |

### Run by Specific User Story:

- **Run only Story 1 tests ("Get ticket"):**
  ```bash
  npx vitest run tests/unit/get-ticket tests/integration/get-ticket
  ```

- **Run only Story 2 tests ("Next customer"):**
  ```bash
  npx vitest run tests/unit/next-customer tests/integration/next-customer
  ```

> **Note on Test Environment**:  
> Backend tests run against an in-memory SQLite database (`DB_PATH=:memory:`). The development database file (`oqm.db`) is never modified.

---

## 2. Frontend Testing (Client) – End-to-End with Playwright

E2E tests simulate real user interactions in a browser (page routing, service selection, form submission, and UI validation).

### Prerequisites:
Make sure the backend server is running in a separate terminal:
```bash
cd server
npm run dev
```

### Navigate to the `client` directory:
```bash
cd client
```

### Available Commands:

| Command | Description |
| :--- | :--- |
| `npx playwright test --reporter=list` | **Runs all E2E tests with detailed terminal output** (recommended). |
| `npx playwright test` | Runs all E2E tests with standard compact summary. |
| `npx playwright test --ui` | Opens Playwright's interactive visual UI runner. |
| `npx playwright show-report` | Opens the HTML report from the last test run in your browser. |

### Run by Specific User Story:

- **Run only Story 1 E2E tests ("Get ticket"):**
  ```bash
  npx playwright test tests/e2e/get-ticket.spec.js --reporter=list
  ```

- **Run only Story 2 E2E tests ("Next customer"):**
  ```bash
  npx playwright test tests/e2e/next-customer.spec.js --reporter=list
  ```

- **Run navigation E2E tests:**
  ```bash
  npx playwright test tests/e2e/navigation.spec.js --reporter=list
  ```

---

## 3. Common Troubleshooting

### Port 9323 already in use (`EADDRINUSE`) when running `playwright show-report`:
If a previous report server instance is still occupying port 9323, specify an alternative port:
```bash
npx playwright show-report --port 9325
```
Or kill the process currently listening on port 9323 on macOS/Linux:
```bash
lsof -ti:9323 | xargs kill -9
```

---

## 4. Expected Results

- **Backend (`npm run test:coverage`)**:
  - `11` test files passed
  - `78` tests passed (0 failed)
  - **100% coverage** across all files related to Story 1 and Story 2 (`counters.js`, `CounterRepository`, `services.js`, `ServiceRepository`, `create-ticket`, `ticket.js`).
- **Frontend (`npx playwright test`)**:
  - `24` tests passed out of 24 (0 failed, 0 skipped).
