import { useEffect, useState } from "react";
import { api } from "../../api";
import { PageHeader, Loading, Empty } from "../../components/ui";
import LayoutDesigner from "../../components/LayoutDesigner";

export default function FloorPlan() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    api.get("/events/mine").then((evs) => { setEvents(evs); if (evs.length) setEventId(evs[0]._id); });
  }, []);
  useEffect(() => { if (eventId) api.get(`/events/${eventId}/layout`).then(setLayout); }, [eventId]);

  return (
    <>
      <PageHeader title="Floor Plan" subtitle="View the venue layout shared by the organizer" />
      <div className="filters">
        <div className="form-row"><label className="label">Event</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        <button className="btn btn-outline" onClick={() => window.print()}>🖨 Print</button>
      </div>

      {events.length === 0 ? <Empty emoji="🗺️" text="You are not assigned to any events" /> : !layout ? <Loading /> : (
        <div className="card">
          <LayoutDesigner key={eventId} value={layout.elements || []} readOnly />
        </div>
      )}
    </>
  );
}
