import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getDisplayBoard } from "../api/client.js";
export default function DisplayPage() {
  const [board, setBoard] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = () =>
      getDisplayBoard()
        .then((d) => {
          if (active) {
            setBoard(d);
            setError("");
          }
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  const calls = Array.isArray(board?.calledTickets)
    ? board.calledTickets
    : Array.isArray(board?.recentCalls)
      ? board.recentCalls
      : [];
  const queues = Array.isArray(board?.queues) ? board.queues : [];
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
          Display unavailable: {error}
        </div>
      )}
      <div className="display-grid">
        <article className="panel">
          <h2>Called numbers</h2>
          {calls.length ? (
            calls.map((c, i) => (
              <div key={c.id ?? i} className="display-call">
                <strong>{c.code || c.number || "—"}</strong>
                <span>
                  {c.counter?.name ||
                    `Counter ${c.counter?.number ?? c.counter ?? "—"}`}
                </span>
              </div>
            ))
          ) : (
            <p className="empty-state">No called tickets yet.</p>
          )}
        </article>
        <article className="panel">
          <h2>Waiting queues</h2>
          {queues.length ? (
            queues.map((q, i) => (
              <div className="queue-row" key={q.serviceId ?? i}>
                <span>
                  {q.serviceName || q.name || `Service ${q.serviceId ?? i + 1}`}
                </span>
                <strong>{q.length ?? q.waiting ?? "—"} waiting</strong>
              </div>
            ))
          ) : (
            <p className="empty-state">No queue information available.</p>
          )}
        </article>
      </div>
    </section>
  );
}
