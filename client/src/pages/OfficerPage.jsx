import { useEffect, useState } from "react";
import {
  getCounters,
  callNextCustomer,
  getDisplayBoard,
} from "../api/client.js";

const asList = (value, key) =>
  Array.isArray(value) ? value : Array.isArray(value?.[key]) ? value[key] : [];
export default function OfficerPage() {
  const [counters, setCounters] = useState([]);
  const [counterId, setCounterId] = useState("");
  const [board, setBoard] = useState(null);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    getCounters()
      .then((data) => {
        if (active) {
          const list = asList(data, "counters");
          setCounters(list);
          if (list.length) setCounterId(String(list[0].id));
        }
      })
      .catch((e) => {
        if (active) setError(`Cannot load counters: ${e.message}`);
      });
    const refresh = () =>
      getDisplayBoard()
        .then((data) => {
          if (active) setBoard(data);
        })
        .catch(() => {});
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  async function next() {
    if (!counterId || loading) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const ticket = await callNextCustomer(counterId);
      if (!ticket || ticket.empty) {
        setNotice("No customers waiting");
        return;
      }
      setCurrent(ticket);
      setHistory((prev) =>
        [
          { ...ticket, calledAt: new Date().toLocaleTimeString() },
          ...prev,
        ].slice(0, 10),
      );
      getDisplayBoard()
        .then(setBoard)
        .catch(() => {});
    } catch (e) {
      setError(`Unable to call next customer: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }
  const called = asList(
    board?.calledTickets || board?.recentCalls,
    "calledTickets",
  );
  const waiting = asList(board?.queues, "queues").reduce(
    (sum, q) => sum + Number(q.length ?? q.waiting ?? 0),
    0,
  );
  const displayed = history.length
    ? history
    : called.map((t, i) => ({ ...t, id: t.id ?? i, calledAt: t.time || "" }));
  const number = current?.code || current?.number || "—";
  return (
    <section className="dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow">OFFICER WORKSPACE</p>
          <h1>Counter</h1>
          <p>Manage customers and keep your service queue moving.</p>
        </div>
        <span className="live-label">
          <i /> Live queue
        </span>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon blue">♧</div>
          <p>Customers waiting</p>
          <strong>{board ? waiting : "—"}</strong>
          <small>Across all services</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon green">✓</div>
          <p>Called tickets</p>
          <strong>{board ? called.length : "—"}</strong>
          <small>Reported by display API</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon amber">◷</div>
          <p>Active counter</p>
          <strong>
            {counterId
              ? (counters.find((c) => String(c.id) === counterId)?.number ??
                counterId)
              : "—"}
          </strong>
          <small>Selected service desk</small>
        </article>
      </div>
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="alert" role="status">
          {notice}
        </div>
      )}
      <div className="officer-grid">
        <article className="panel">
          <div className="panel-title">
            <h2>Current number being served</h2>
            <span>Now serving</span>
          </div>
          <label className="field-label" htmlFor="counter-select">
            Counter
          </label>
          <select
            id="counter-select"
            value={counterId}
            onChange={(e) => setCounterId(e.target.value)}
          >
            <option value="">Select a counter</option>
            {counters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || `Counter ${c.number ?? c.id}`}
              </option>
            ))}
          </select>
          <div className="current-number">
            <span>NOW SERVING</span>
            <strong>{number}</strong>
            <span>
              Counter{" "}
              {counters.find((c) => String(c.id) === counterId)?.number ??
                (counterId || "—")}
            </span>
          </div>
          <button
            className="primary-btn"
            onClick={next}
            disabled={!counterId || loading}
          >
            {loading ? "Calling…" : "Next →"}
          </button>
          <p className="help-text">
            Calls are sent to the configured backend. No demo tickets are
            generated.
          </p>
        </article>
        <article className="panel">
          <div className="panel-title">
            <h2>Recent calls</h2>
            <span>{displayed.length} entries</span>
          </div>
          <div className="call-list">
            {displayed.length ? (
              displayed.map((t, i) => (
                <div className="call-row" key={`${t.id ?? t.code}-${i}`}>
                  <div>
                    <strong>{t.code || t.number || "—"}</strong>
                    <small>
                      {t.service?.name || t.service || "Service request"}
                    </small>
                  </div>
                  <span>{t.calledAt || t.counter || ""}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No recent calls available.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
