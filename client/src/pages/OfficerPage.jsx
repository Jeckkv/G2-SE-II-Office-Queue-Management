import { useEffect, useState } from "react";
import { getCounters, callNextCustomer, getDisplayBoard } from "../api/client.js";

export default function OfficerPage() {
  const [counters, setCounters] = useState([]);
  const [counterId, setCounterId] = useState("");
  const [calledTickets, setCalledTickets] = useState([]);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [countersError, setCountersError] = useState("");
  const [notice, setNotice] = useState("");
  const [calling, setCalling] = useState(false);

  // 1. Fetch counters on mount
  useEffect(() => {
    let active = true;
    getCounters()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setCounters(list);
        if (list.length > 0) {
          setCounterId(String(list[0].id));
        }
      })
      .catch((err) => {
        if (active) setCountersError(err.message);
      });

    return () => {
      active = false;
    };
  }, []);

  // 2. Poll display board every 5s
  useEffect(() => {
    let active = true;

    const fetchBoard = () => {
      getDisplayBoard()
        .then((data) => {
          if (active && Array.isArray(data)) {
            setCalledTickets(data);
          }
        })
        .catch(() => {});
    };

    fetchBoard();
    const timer = setInterval(fetchBoard, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  async function handleCallNext() {
    if (!counterId || calling) return;
    setCalling(true);
    setError("");
    setNotice("");

    try {
      const ticket = await callNextCustomer(counterId);
      if (!ticket) {
        // HTTP 204 — all queues empty
        setNotice("No customers waiting.");
        return;
      }
      setCurrent(ticket);
      setHistory((prev) =>
        [{ ...ticket, calledAt: new Date().toLocaleTimeString() }, ...prev].slice(0, 10),
      );

      // Refresh display board immediately after calling
      getDisplayBoard()
        .then((data) => {
          if (Array.isArray(data)) setCalledTickets(data);
        })
        .catch(() => {});
    } catch (e) {
      setError(`Unable to call next customer: ${e.message}`);
    } finally {
      setCalling(false);
    }
  }

  // The counter's display number from the loaded list
  const activeCounter = (counters || []).find((c) => String(c.id) === counterId);
  const counterLabel = activeCounter ? `Counter ${activeCounter.number}` : (counterId || "—");

  // Ticket shown in the "Now serving" card
  const servingCode = current?.code ?? "—";

  // "Recent calls" panel: prefer local history (has calledAt timestamp),
  // fall back to what the display board returns.
  const displayed = history.length
    ? history
    : (calledTickets || []).map((t, i) => ({ ...t, id: t.id ?? i }));

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
          <div className="stat-icon green">✓</div>
          <p>Called today</p>
          <strong>{(calledTickets || []).length}</strong>
          <small>From display board</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon amber">◷</div>
          <p>Active counter</p>
          <strong>{counterLabel}</strong>
          <small>Selected service desk</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon blue">♧</div>
          <p>Served this session</p>
          <strong>{history.length}</strong>
          <small>Since page load</small>
        </article>
      </div>

      {(countersError || error) && (
        <div className="alert error" role="alert">
          {countersError ? `Cannot load counters: ${countersError}` : error}
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
            {(counters || []).map((c) => (
              <option key={c.id} value={c.id}>
                Counter {c.number}
              </option>
            ))}
          </select>

          <div className="current-number">
            <span>NOW SERVING</span>
            <strong>{servingCode}</strong>
            <span>{counterLabel}</span>
          </div>

          <button
            className="primary-btn"
            onClick={handleCallNext}
            disabled={!counterId || calling}
          >
            {calling ? "Calling…" : "Next →"}
          </button>
          <p className="help-text">
            Calls the next customer from the longest waiting queue for this counter.
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
                    <strong>{t.code ?? "—"}</strong>
                    <small>{t.serviceName ?? "Service request"}</small>
                  </div>
                  <span>{t.calledAt ?? ""}</span>
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
