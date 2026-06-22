import { useEffect, useState } from "react";
import { api } from "../../api";
import { useToast } from "../../components/Toast";
import { PageHeader, Loading, Empty, Badge } from "../../components/ui";

export default function CheckIn() {
  const { push } = useToast();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [guests, setGuests] = useState(null);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/events/mine").then((evs) => { setEvents(evs); if (evs.length) setEventId(evs[0]._id); });
  }, []);
  function load() {
    if (!eventId) return;
    let p = `?event=${eventId}`;
    if (status) p += `&status=${status}`;
    api.get("/guests" + p).then(setGuests);
  }
  useEffect(load, [eventId, status]);

  async function toggle(g) {
    await api.patch(`/guests/${g._id}/checkin`, { checkedIn: !g.checkedIn });
    push(g.checkedIn ? "Check-in removed" : `${g.name} checked in!`);
    load();
  }

  const list = (guests || []).filter((g) => !q || g.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Guest Check-In" subtitle="Check guests in at the entrance" />
      <div className="filters">
        <div className="form-row"><label className="label">Event</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        <div className="form-row"><label className="label">RSVP</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option><option value="attending">Attending</option><option value="maybe">Maybe</option><option value="invited">Invited</option>
          </select>
        </div>
        <div className="form-row"><label className="label">Search</label><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name..." /></div>
      </div>

      {!guests ? <Loading /> : list.length === 0 ? <Empty emoji="🎟️" text="No guests" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>RSVP</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((g) => (
                <tr key={g._id}>
                  <td><b>{g.name}</b><div className="small muted">{g.email}</div></td>
                  <td><Badge value={g.status} /></td>
                  <td>{g.checkedIn ? <Badge value="arrived" /> : <span className="muted small">Not arrived</span>}</td>
                  <td>
                    <button className={`btn btn-sm ${g.checkedIn ? "btn-outline" : "btn-success"}`} onClick={() => toggle(g)}>
                      {g.checkedIn ? "Undo" : "Check In"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
