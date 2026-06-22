import { useEffect, useState } from "react";
import { api } from "../api";
import { PageHeader, Loading, Empty, Badge } from "../components/ui";

export default function Guests() {
  const [guests, setGuests] = useState(null);
  const [events, setEvents] = useState([]);
  const [f, setF] = useState({ event: "", status: "", dietary: "", q: "" });

  useEffect(() => { api.get("/events").then(setEvents); }, []);
  function load() {
    const q = Object.entries(f).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    api.get("/guests" + (q ? "?" + q : "")).then(setGuests);
  }
  useEffect(load, [f]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Guests" subtitle="All guests across your events" />
      <div className="filters">
        <div className="form-row"><label className="label">Event</label>
          <select value={f.event} onChange={set("event")}>
            <option value="">All events</option>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        <div className="form-row"><label className="label">RSVP</label>
          <select value={f.status} onChange={set("status")}>
            <option value="">All</option>
            <option value="invited">Invited</option>
            <option value="attending">Attending</option>
            <option value="maybe">Maybe</option>
            <option value="not-attending">Not attending</option>
          </select>
        </div>
        <div className="form-row"><label className="label">Dietary</label><input value={f.dietary} onChange={set("dietary")} placeholder="e.g. Vegan" /></div>
        <div className="form-row"><label className="label">Search</label><input value={f.q} onChange={set("q")} placeholder="Name..." /></div>
      </div>

      {!guests ? <Loading /> : guests.length === 0 ? <Empty emoji="🎟️" text="No guests match" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Event</th><th>RSVP</th><th>Dietary</th><th>Checked in</th></tr></thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g._id}>
                  <td><b>{g.name}</b><div className="small muted">{g.email}</div></td>
                  <td>{g.event?.name || "—"}</td>
                  <td><Badge value={g.status} /></td>
                  <td>{g.dietaryPreference || "—"}</td>
                  <td>{g.checkedIn ? "✅" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
