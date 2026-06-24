import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { Loading, Field } from "../components/ui";

const isUrl = (s) => typeof s === "string" && s.startsWith("http");

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [venue, setVenue] = useState(null);
  const [form, setForm] = useState({ eventType: "", date: "", attendeesExpected: "", specialRequirements: "" });

  useEffect(() => { api.get(`/venues/${id}`).then(setVenue); }, [id]);
  if (!venue) return <Loading />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function book(e) {
    e.preventDefault();
    try {
      await api.post("/bookings", { ...form, venue: id, attendeesExpected: Number(form.attendeesExpected) || 0 });
      push("Booking request sent!");
      navigate("/bookings");
    } catch (err) {
      push(err.message, "error");
    }
  }

  return (
    <>
      <span className="btn btn-sm btn-outline" onClick={() => navigate("/venues")}>← Venues</span>
      <div className="card-grid mt" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div className="card">
          {isUrl(venue.images?.[0])
            ? <img className="venue-photo lg mb" src={venue.images[0]} alt={venue.name} />
            : <div style={{ fontSize: "3rem" }}>{venue.images?.[0] || "🏛️"}</div>}
          <h1>{venue.name}</h1>
          <p className="muted">{venue.city}</p>
          <p>{venue.description}</p>
          <div className="kv mt">
            <span className="k">Capacity</span><span>{venue.capacity} people</span>
            <span className="k">Size</span><span>{venue.sizeSqm} m²</span>
            <span className="k">Price</span><span>${venue.pricePerDay} / day</span>
            <span className="k">Owner</span><span>{venue.owner?.companyName || venue.owner?.name}</span>
            <span className="k">Contact</span><span>{venue.owner?.contact || "—"}</span>
          </div>
          <div className="mt">{(venue.amenities || []).map((a) => <span className="tag" key={a}>{a}</span>)}</div>
        </div>

        <div className="card">
          <h3>Request a Booking</h3>
          <form onSubmit={book}>
            <Field label="Event type"><input value={form.eventType} onChange={set("eventType")} placeholder="e.g. Pop-up café" required /></Field>
            <Field label="Date"><input type="date" value={form.date} onChange={set("date")} required /></Field>
            <Field label="Expected attendees"><input type="number" value={form.attendeesExpected} onChange={set("attendeesExpected")} /></Field>
            <Field label="Special requirements"><textarea value={form.specialRequirements} onChange={set("specialRequirements")} /></Field>
            <button className="btn btn-primary btn-block">Send Booking Request</button>
          </form>
        </div>
      </div>
    </>
  );
}
