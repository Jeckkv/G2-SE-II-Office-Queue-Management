// All calls to the backend go through this file.
// Pages import these functions instead of calling fetch() directly,
// so if a URL or a response format changes, only this file needs updating.

const BASE_URL = '/api' // forwarded to the backend by the Vite proxy (vite.config.js)

// Small fetch wrapper: sends/receives JSON and turns HTTP errors into exceptions.
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    // The backend sends errors as { error, message }
    const body = await response.json().catch(() => null)
    throw new Error(
      body?.message ?? `Request failed with status ${response.status}`,
    )
  }

  // 204 No Content has no body to parse
  if (response.status === 204) return null
  return response.json()
}

// ---- Story 1: Get ticket ----

/**
 * Service types offered by the office.
 * @returns {Promise<Array<{ id: number, tag: string, name: string, codePrefix: string, serviceTime: number }>>}
 */
export function getServices() {
  return request('/v1/services')
}

/**
 * Issues a new ticket for the given service.
 * @param {number | string} serviceId
 * @returns {Promise<{ message: string, id: number }>}
 */
export function createTicket(serviceId) {
  return request(`/v1/tickets/${serviceId}`, { method: 'POST' })
}

// ---- Story 2: Next customer ----

/**
 * All counters with the service IDs each one handles.
 * @returns {Promise<Array<{ id: number, number: number, serviceIds: number[] }>>}
 */
export function getCounters() {
  return request('/v1/counters')
}

/**
 * Calls the next customer to a counter.
 * Returns the called ticket, or null (HTTP 204) if all the counter's queues are empty.
 * @param {number | string} counterId
 * @returns {Promise<{ id: number, code: string, serviceId: number, counterId: number, calledAt: string } | null>}
 */
export function callNextCustomer(counterId) {
  return request(`/v1/counters/${counterId}/next`, { method: 'POST' })
}

// ---- Story 3: Call customer ----

/**
 * Today's called tickets, most recent first, for the display board.
 * @param {number} [limit=5]
 * @returns {Promise<Array<{ id: number, code: string, serviceName: string, counterId: number, counterNumber: number, calledAt: string }>>}
 */
export function getDisplayBoard(limit = 5) {
  return request(`/v1/tickets/called?limit=${limit}`)
}