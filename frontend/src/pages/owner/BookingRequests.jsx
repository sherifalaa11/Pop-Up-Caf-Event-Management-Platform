import { useEffect, useState } from "react";
import { api } from "../../api";
import { useToast } from "../../components/Toast";
import { PageHeader, Loading, Empty, Badge, Modal, Field } from "../../components/ui";

export default function BookingRequests() {
  const { push } = useToast();
  const [bookings, setBookings] = useState(null);
  const [status, setStatus] = useState("");
  const [venues, setVenues] = useState([]);
  const [venueId, setVenueId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [counter, setCounter] = useState(null); // booking for counter-proposal modal
  const [message, setMessage] = useState("");

  function load() { api.get("/bookings" + (status ? `?status=${status}` : "")).then(setBookings); }
  useEffect(load, [status]);
  useEffect(() => { api.get("/venues/mine").then(setVenues); }, []);

  const list = (bookings || []).filter((b) =>
    (!venueId || b.venue?._id === venueId) &&
    (!from || (b.date || "") >= from) &&
    (!to || (b.date || "") <= to)
  );

  async function respond(id, s, msg) {
    await api.patch(`/bookings/${id}/respond`, { status: s, message: msg });
    push(`Booking ${s}`);
    setCounter(null);
    setMessage("");
    load();
  }
  async function sendCounter(e) {
    e.preventDefault();
    await api.post(`/bookings/${counter._id}/messages`, { text: message });
    push("Message sent to organizer");
    setMessage("");
    const updated = await api.get(`/bookings/${counter._id}`);
    setCounter(updated);
    load();
  }

  return (
    <>
      <PageHeader title="Booking Requests" subtitle="Respond to organizers' requests" />
      <div className="filters">
        <div className="form-row"><label className="label">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="declined">Declined</option>
          </select>
        </div>
        <div className="form-row"><label className="label">Venue</label>
          <select value={venueId} onChange={(e) => setVenueId(e.target.value)}>
            <option value="">All venues</option>
            {venues.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
        </div>
        <div className="form-row"><label className="label">From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="form-row"><label className="label">To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        {(venueId || from || to) && <button className="btn btn-outline" onClick={() => { setVenueId(""); setFrom(""); setTo(""); }}>Clear</button>}
      </div>

      {!bookings ? <Loading /> : list.length === 0 ? <Empty icon="booking" text="No booking requests" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Organizer</th><th>Venue</th><th>Event</th><th>Date</th><th>Attendees</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((b) => (
                <tr key={b._id}>
                  <td><b>{b.organizer?.name}</b><div className="small muted">{b.organizer?.email}</div></td>
                  <td>{b.venue?.name}</td>
                  <td>{b.eventType}<div className="small muted">{b.specialRequirements}</div></td>
                  <td>{b.date}</td>
                  <td>{b.attendeesExpected}</td>
                  <td><Badge value={b.status} /></td>
                  <td className="row">
                    {b.status === "pending" && (
                      <>
                        <span className="btn btn-sm btn-success" onClick={() => respond(b._id, "approved")}>Approve</span>
                        <span className="btn btn-sm btn-danger" onClick={() => respond(b._id, "declined")}>Decline</span>
                      </>
                    )}
                    <span className="btn btn-sm btn-outline" onClick={() => setCounter(b)}>💬 {b.messages?.length || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {counter && (
        <Modal title={`Message · ${counter.organizer?.name}`} onClose={() => setCounter(null)}>
          {(counter.messages || []).length === 0 && <p className="muted small">No messages yet.</p>}
          {(counter.messages || []).map((m, i) => (
            <div className="list-item" key={i}>
              <div><b>{m.sender === "owner" ? "You" : "Organizer"}</b><div className="small">{m.text}</div></div>
            </div>
          ))}
          <form onSubmit={sendCounter} className="mt">
            <Field label="Counter-proposal / message"><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Could offer the 12th at $1800" required /></Field>
            <button className="btn btn-primary btn-block">Send</button>
          </form>
        </Modal>
      )}
    </>
  );
}
