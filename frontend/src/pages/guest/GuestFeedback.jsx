import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../auth";
import { useToast } from "../../components/Toast";
import { PageHeader, Loading, Empty, Field } from "../../components/ui";

export default function GuestFeedback() {
  const { user } = useAuth();
  const { push } = useToast();
  const [invites, setInvites] = useState(null);
  const [eventId, setEventId] = useState("");
  const [form, setForm] = useState({ overall: 5, food: 5, venue: 5, organization: 5, comments: "" });

  useEffect(() => {
    api.get("/guests/mine").then((list) => {
      setInvites(list);
      if (list.length) setEventId(list[0].event?._id || "");
    });
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: Number(e.target.value) });

  async function submit(e) {
    e.preventDefault();
    await api.post("/feedback", { ...form, event: eventId, guestName: user.name });
    push("Thank you for your feedback!");
    setForm({ overall: 5, food: 5, venue: 5, organization: 5, comments: "" });
  }

  if (!invites) return <Loading />;
  if (invites.length === 0) return <><PageHeader title="Feedback" /><Empty emoji="⭐" text="No events to give feedback on" /></>;

  const Rating = ({ label, field }) => (
    <Field label={label}>
      <select value={form[field]} onChange={set(field)}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
      </select>
    </Field>
  );

  return (
    <>
      <PageHeader title="Event Feedback" subtitle="Tell us about your experience" />
      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={submit}>
          <Field label="Event">
            <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
              {invites.map((g) => <option key={g._id} value={g.event?._id}>{g.event?.name}</option>)}
            </select>
          </Field>
          <div className="form-grid">
            <Rating label="Overall experience" field="overall" />
            <Rating label="Food & beverages" field="food" />
            <Rating label="Venue" field="venue" />
            <Rating label="Organization" field="organization" />
          </div>
          <Field label="Comments"><textarea value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} placeholder="Anything you'd like to share..." /></Field>
          <button className="btn btn-primary btn-block">Submit Feedback</button>
        </form>
      </div>
    </>
  );
}
