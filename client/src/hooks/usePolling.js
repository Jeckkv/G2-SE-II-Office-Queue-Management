// usePolling: calls a function right away and then every `intervalMs` milliseconds,
// and keeps its latest result in React state. Used to keep the main display up to date.
//
// Example (main display board, story 3):
//
//   import usePolling from '../hooks/usePolling.js'
//   import { getDisplayBoard } from '../api/client.js'
//
//   export default function DisplayPage() {
//     const { data: board, error, loading } = usePolling(getDisplayBoard, 2000)
//
//     if (loading) return <p>Loading…</p>
//     return (
//       <>
//         {error && <p role="alert">Connection problem, showing the last data received.</p>}
//         {/* render board.calledTickets and board.queues here */}
//       </>
//     )
//   }
//
// What you get back:
// - data:    the last successful result (null until the first success).
//            On an error it is NOT cleared, so the display keeps showing the last valid data.
// - error:   the error of the last request, or null if the last request succeeded.
// - loading: true only until the first request has finished (success or error),
//            so the page does not flicker on every refresh.
//
// Notes:
// - A new request is never started while the previous one is still running:
//   if the server is slow, that tick is simply skipped.
// - Polling stops automatically when the component is unmounted.
// - fetchFn can be an inline arrow function, e.g. usePolling(() => getQueue(serviceId)):
//   the latest version is always used, and polling does not restart when it changes.
// - In development, React StrictMode mounts components twice, so you may see
//   two requests at startup. This does not happen in the production build.

import { useEffect, useEffectEvent, useState } from 'react'

export default function usePolling(fetchFn, intervalMs = 2000) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Always calls the latest fetchFn passed by the component,
  // without being a dependency of the effect (so a new fetchFn does not restart the polling)
  const callFetchFn = useEffectEvent(() => fetchFn())

  useEffect(() => {
    let cancelled = false // set by the cleanup: ignore results that arrive after unmount
    let inFlight = false // true while a request is running

    async function poll() {
      if (inFlight) return
      inFlight = true
      try {
        const result = await callFetchFn()
        if (cancelled) return
        setData(result)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err) // keep the last valid data
      } finally {
        inFlight = false
        if (!cancelled) setLoading(false)
      }
    }

    poll() // first call right away, without waiting for the first interval
    const timer = setInterval(poll, intervalMs)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [intervalMs])

  return { data, error, loading }
}
