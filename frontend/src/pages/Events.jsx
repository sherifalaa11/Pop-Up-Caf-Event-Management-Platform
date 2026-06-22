import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { PageHeader, Badge, Loading, Empty, Modal, Field } from "../components/ui";

const BLANK = { name: "", description: "", date: "", time: "", venueName: "", dressCode: "", agenda: "", status: "planning" };

export default function Events() {
  const { push } = useToast();
  const [events, setEvents] = useState(null);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(BLANK);

  function load() {
    let q = [];
    if (status) q.push(`status=${status}`);
    if (date) q.push(`date=${date}`);
    api.get("/events" + (q.length ? "?" + q.join("&") : "")).then(setEvents);
  }
  useEffect(load, [status, date]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function create(e) {
    e.preventDefault();
    try {
      await api.post("/events", form);
      push("Event created");
      setShowCreate(false);
      setForm(BLANK);
      load();
    } catch (err) {
      push(err.message, "error");
    }
  }

  return (
    <>
      <PageHeader title="Events" subtitle="Plan and manage your pop-up café events">
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Event</button>
      </PageHeader>

      <div className="filters">
        <div className="form-row">
          <label className="label">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="planning">Planning</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="form-row">
          <label className="label">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {(status || date) && (
          <button className="btn btn-outline" onClick={() => { setStatus(""); setDate(""); }}>Clear</button>
        )}
      </div>

      {!events ? (
        <Loading />
      ) : events.length === 0 ? (
        <Empty emoji="📅" text="No events yet. Create your first one!" />
      ) : (
        <div className="card-grid">
          {events.map((e) => (
            <Link to={`/events/${e._id}`} key={e._id} className="card card-hover">
              <div className="between">
                <h3 style={{ margin: 0 }}>{e.name}</h3>
                <Badge value={e.status} />
              </div>
              <p className="muted small mt">{e.description}</p>
              <div className="kv mt">
                <span className="k">Date</span><span>{e.date} {e.time}</span>
                <span className="k">Venue</span><span>{e.venue?.name || e.venueName || "—"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="New Event" onClose={() => setShowCreate(false)}>
          <form onSubmit={create}>
            <Field label="Event name"><input value={form.name} onChange={set("name")} required /></Field>
            <Field label="Description"><textarea value={form.description} onChange={set("description")} /></Field>
            <div className="form-grid">
              <Field label="Date"><input type="date" value={form.date} onChange={set("date")} required /></Field>
              <Field label="Time"><input type="time" value={form.time} onChange={set("time")} /></Field>
            </div>
            <Field label="Venue name"><input value={form.venueName} onChange={set("venueName")} /></Field>
            <div className="form-grid">
              <Field label="Dress code"><input value={form.dressCode} onChange={set("dressCode")} /></Field>
              <Field label="Status">
                <select value={form.status} onChange={set("status")}>
                  <option value="planning">Planning</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="today">Today</option>
                  <option value="completed">Completed</option>
                </select>
              </Field>
            </div>
            <Field label="Agenda"><textarea value={form.agenda} onChange={set("agenda")} /></Field>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary">Create Event</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
