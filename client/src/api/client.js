// All calls to the backend go through this file.
// Pages import these functions instead of calling fetch() directly,
// so if a URL or a response format changes, only this file needs updating.
//
// TODO(backend): the backend does not exist yet. Every endpoint below is a PROPOSAL
// based on the spec. Agree on paths and response shapes with the backend team
// and fix each line marked TODO(backend).

const BASE_URL = '/api' // forwarded to the backend by the Vite proxy (vite.config.js)

// Small fetch wrapper: sends/receives JSON and turns HTTP errors into exceptions.
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text() // TODO(backend): adapt to the backend's error format (e.g. { error: "..." })
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  // 204 No Content has no body to parse
  if (response.status === 204) return null
  return response.json()
}

// ---- Story 1: Get ticket ----

/** Service types offered by the office, e.g. [{ id, name, serviceTime }] */
export function getServices() {
  return request('/services') // TODO(backend): confirm path and response shape
}

/** Issue a new ticket for a service, e.g. returns { id, code, serviceId } */
export function createTicket(serviceId) {
  return request('/tickets', { // TODO(backend): confirm path, body and response shape
    method: 'POST',
    body: JSON.stringify({ serviceId }),
  })
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