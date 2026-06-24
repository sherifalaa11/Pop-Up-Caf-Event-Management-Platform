import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { PageHeader, Loading, Empty, Badge, Modal, Field } from "../components/ui";

export default function Bookings() {
  const { push } = useToast();
  const [bookings, setBookings] = useState(null);
  const [active, setActive] = useState(null); // booking for the message modal
  const [text, setText] = useState("");

  function load() { api.get("/bookings").then(setBookings); }
  useEffect(load, []);

  async function cancel(id) {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      push("Booking cancelled");
      load();
    } catch (err) { push(err.message, "error"); }
  }
  async function sendMessage(e) {
    e.preventDefault();
    await api.post(`/bookings/${active._id}/messages`, { text });
    setText("");
    const updated = await api.get(`/bookings/${active._id}`);
    setActive(updated);
    load();
  }

  return (
    <>
      <PageHeader title="My Bookings" subtitle="Track your venue booking requests" />
      {!bookings ? <Loading /> : bookings.length === 0 ? <Empty emoji="📝" text="No booking requests yet" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Venue</th><th>Event type</th><th>Date</th><th>Attendees</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td><b>{b.venue?.name}</b><div className="small muted">{b.venue?.city}</div></td>
                  <td>{b.eventType}</td>
                  <td>{b.date}</td>
                  <td>{b.attendeesExpected}</td>
                  <td><Badge value={b.status} /></td>
                  <td className="row">
                    <span className="btn btn-sm btn-outline" onClick={() => setActive(b)}>💬 {b.messages?.length || 0}</span>
                    {(b.status === "pending" || b.status === "declined") && (
                      <span className="btn btn-sm btn-danger" onClick={() => cancel(b._id)}>Cancel</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active && (
        <Modal title={`Conversation · ${active.venue?.name}`} onClose={() => setActive(null)}>
          {(active.messages || []).length === 0 && <p className="muted small">No messages yet.</p>}
          {(active.messages || []).map((m, i) => (
            <div className="list-item" key={i}>
              <div><b>{m.sender === "owner" ? "Venue Owner" : "You"}</b><div className="small">{m.text}</div></div>
            </div>
          ))}
          <form onSubmit={sendMessage} className="mt">
            <Field label="Send a message"><input value={text} onChange={(e) => setText(e.target.value)} required /></Field>
            <button className="btn btn-primary btn-block">Send</button>
          </form>
        </Modal>
      )}
    </>
  );
}
