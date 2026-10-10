import { Link } from "react-router";

import { getDisplayBoard } from "../api/client.js";
import usePolling from "../hooks/usePolling.js";

export default function DisplayPage() {
  const { data: calls, error, loading } = usePolling(getDisplayBoard, 2000);
  // The newest call is "Now calling", the others are recent calls
  const [current, ...recent] = calls ?? [];

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

      {error && (
        <div role="alert" className="alert error">
          Connection problem, showing the last data received.
        </div>
      )}

      <div className="display-grid">
        <article className="panel">
          <h2>Now calling</h2>
          {loading ? (
            <p className="empty-state">Loading…</p>
          ) : current ? (
            <div className="display-call">
              <strong>{current.code}</strong>
              <span>Counter {current.counterNumber}</span>
            </div>
          ) : (
            <p className="empty-state">No called tickets yet.</p>
          )}
        </article>

        <article className="panel">
          <h2>Recent calls</h2>
          {recent.length ? (
            recent.map((call) => (
              <div key={call.id} className="display-call">
                <strong>{call.code}</strong>
                <span>Counter {call.counterNumber}</span>
              </div>
            ))
          ) : (
            <p className="empty-state">No recent calls.</p>
          )}
        </article>
      </div>
    </section>
  );
}