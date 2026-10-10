import { useEffect, useState } from "react";
import { createTicket, getServices } from "../api/client.js";
export default function CustomerPage() {
  const [services, setServices] = useState([]),
    [serviceId, setServiceId] = useState(""),
    [ticket, setTicket] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    getServices()
      .then((data) => {
        if (active)
          setServices(Array.isArray(data) ? data : data?.services || []);
      })
      .catch((e) => {
        if (active) setError(`Cannot load services: ${e.message}`);
      });
    return () => {
      active = false;
    };
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (!serviceId) return;
    setLoading(true);
    setError("");
    setTicket(null);
    try {
      setTicket(await createTicket(serviceId));
    } catch (e) {
      setError(`Unable to issue ticket: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="registration">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CUSTOMER SERVICES</p>
          <h1>Get a ticket</h1>
          <p>Choose your service to receive a queue number.</p>
        </div>
      </div>
      <article className="panel registration-panel">
        <h2>Queue registration</h2>
        <p className="muted">
          Choose the service you need. We'll assign your ticket number.
        </p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="service-select">
            Service type
          </label>
          <select
            id="service-select"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            required
          >
            <option value="">Select service type</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="info-box">
            After registration, please wait for your ticket number to appear on
            the public display.
          </div>
          <button className="primary-btn" disabled={!serviceId || loading}>
            {loading ? "Creating ticket…" : "Get Queue Number →"}
          </button>
        </form>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        {ticket && (
          <div className="ticket-result" role="status">
            <p>Your queue number</p>
            <strong>{ticket.code || ticket.number || ticket.id}</strong>
            <span>Keep this number until you are called.</span>
          </div>
        )}
      </article>
    </section>
  );
}
