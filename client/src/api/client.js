// All calls to the backend go through this file.
// Pages import these functions instead of calling fetch() directly,
// so if a URL or a response format changes, only this file needs updating.

const BASE_URL = '/api' 

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    // The backend sends errors as { error, message }
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message ?? `Request failed with status ${response.status}`,
    );
  }

  // 204 No Content has no body to parse
  if (response.status === 204) return null;
  return response.json();
}

// ---- Story 1: Get ticket ----

/**
 * Service types offered by the office.
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export function getServices() {
  return request('/v1/services')
}

/**
 * Issues a new ticket for the given service.
 * @param {number | string} serviceId
 * @returns {Promise<{ id: number, code: string, serviceId: number }>}
 */
export function createTicket(serviceId) {
  return request(`/v1/tickets/${serviceId}`, { method: 'POST' })
}

// ---- Story 2: Next customer ----

/** Counters with the services each one handles, e.g. [{ id, number, serviceIds }] */
export function getCounters() {
  return request('/counters') // TODO(backend): confirm path and response shape
}

/** Next ticket for a counter, or null if all its queues are empty */
export function callNextCustomer(counterId) {
  return request(`/counters/${counterId}/next`, { method: 'POST' }) // TODO(backend): confirm path and "empty queues" response (null / 204?)
}

// ---- Story 3: Call customer ----

/** Main display board data, e.g. { calledTickets: [{ code, counter }], queues: [{ serviceId, length }] } */
export function getDisplayBoard() {
  return request('/display') // TODO(backend): confirm path and shape; may become a WebSocket
}