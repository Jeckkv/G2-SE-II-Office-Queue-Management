import { Link } from "react-router";
import usePolling from "../hooks/usePolling.js";
import { getDisplayBoard } from "../api/client.js";

// getDisplayBoard returns a flat array:
// [{ id, code, serviceName, counterId, counterNumber, calledAt }, ...]
export default function DisplayPage() {
  const { data: calledTickets, error, loading } = usePolling(getDisplayBoard, 5_000);

  const calls = Array.isArray(calledTickets) ? calledTickets : [];

  return (
    <section className="public-board">
      <header>
        <div>
          <p className="eyebrow">LIVE SERVICE STATUS</p>
          <h1>Now serving</h1>
        </div>
        <Link className="outline-btn" to="/">
          ← Back
        </Link>
      </header>

      {loading && <p className="empty-state">Connecting to display board…</p>}

      {error && !loading && (
        <div role="alert" className="alert error">
          Display unavailable: {error.message}
        </div>
      )}

      <div className="display-grid">
        <article className="panel">
          <h2>Called numbers</h2>
          {calls.length ? (
            calls.map((t) => (
              <div key={t.id} className="display-call">
                <strong>{t.code ?? "—"}</strong>
                <span>Counter {t.counterNumber ?? "—"}</span>
              </div>
            ))
          ) : (
            !loading && <p className="empty-state">No called tickets yet.</p>
          )}
        </article>

        <article className="panel">
          <h2>Services</h2>
          {calls.length ? (
            // Group by service name to give a sense of which services are active
            [...new Map(calls.map((t) => [t.serviceName, t])).values()].map((t, i) => (
              <div className="queue-row" key={t.serviceName ?? i}>
                <span>{t.serviceName ?? `Service ${i + 1}`}</span>
              </div>
            ))
          ) : (
            !loading && <p className="empty-state">No queue information available.</p>
          )}
        </article>
      </div>
    </section>
  );
}
