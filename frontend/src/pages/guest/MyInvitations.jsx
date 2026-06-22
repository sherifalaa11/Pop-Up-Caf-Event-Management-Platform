import { useEffect, useState } from "react";
import { api } from "../../api";
import { useToast } from "../../components/Toast";
import { PageHeader, Loading, Empty, Badge, Field } from "../../components/ui";

export default function MyInvitations() {
  const { push } = useToast();
  const [invites, setInvites] = useState(null);

  function load() { api.get("/guests/mine").then(setInvites); }
  useEffect(load, []);

  async function rsvp(id, status, dietaryPreference) {
    await api.patch(`/guests/${id}/rsvp`, { status, dietaryPreference });
    push("RSVP saved — thank you!");
    load();
  }

  if (!invites) return <Loading />;

  return (
    <>
      <PageHeader title="My Invitations" subtitle="Respond to your event invitations" />
      {invites.length === 0 ? <Empty emoji="✉️" text="You have no invitations" /> : (
        <div className="card-grid">
          {invites.map((g) => <InviteCard key={g._id} g={g} onRsvp={rsvp} />)}
        </div>
      )}
    </>
  );
}

function InviteCard({ g, onRsvp }) {
  const [status, setStatus] = useState(g.status);
  const [diet, setDiet] = useState(g.dietaryPreference || "");
  const e = g.event || {};
  return (
    <div className="card">
      <div className="between">
        <h3 style={{ margin: 0 }}>{e.name}</h3>
        <Badge value={g.status} />
      </div>
      <div className="between mt">
        <span className="small muted">Check-in code: <b style={{ color: "var(--ink)", letterSpacing: "1px" }}>{g._id.slice(-5).toUpperCase()}</b></span>
        {g.checkedIn && <span className="badge green">✓ Checked in</span>}
      </div>
      <div className="kv mt small">
        <span className="k">Date</span><span>{e.date} {e.time}</span>
        <span className="k">Venue</span><span>{e.venueName || "—"}</span>
        <span className="k">Dress code</span><span>{e.dressCode || "—"}</span>
        <span className="k">Agenda</span><span>{e.agenda || "—"}</span>
      </div>
      <div className="divider" />
      <Field label="Will you attend?">
        <select value={status} onChange={(ev) => setStatus(ev.target.value)}>
          <option value="invited">No response</option>
          <option value="attending">Attending</option>
          <option value="maybe">Maybe</option>
          <option value="not-attending">Not attending</option>
        </select>
      </Field>
      <Field label="Dietary preference"><input value={diet} onChange={(ev) => setDiet(ev.target.value)} placeholder="e.g. Vegetarian" /></Field>
      <button className="btn btn-primary btn-block" onClick={() => onRsvp(g._id, status, diet)}>Submit RSVP</button>
    </div>
  );
}
