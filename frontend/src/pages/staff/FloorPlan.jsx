import { useEffect, useState } from "react";
import { api } from "../../api";
import { PageHeader, Loading, Empty } from "../../components/ui";
import LayoutDesigner from "../../components/LayoutDesigner";
import { exportLayoutPNG, exportLayoutPDF } from "../../lib/layoutExport";

export default function FloorPlan() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [layout, setLayout] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/events/mine").then((evs) => { setEvents(evs); if (evs.length) setEventId(evs[0]._id); });
  }, []);
  useEffect(() => { if (eventId) api.get(`/events/${eventId}/layout`).then(setLayout); }, [eventId]);

  const selectedEvent = events.find((e) => e._id === eventId);
  async function doExport(kind) {
    if (busy || !layout) return;
    setBusy(true);
    try {
      const base = (selectedEvent?.name || "venue-layout").replace(/\s+/g, "-").toLowerCase();
      if (kind === "png") await exportLayoutPNG(layout.elements || [], `${base}-layout.png`);
      else await exportLayoutPDF(layout.elements || [], `${base}-layout.pdf`, `${selectedEvent?.name || "Venue"} — Floor Plan`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Floor Plan" subtitle="View the venue layout shared by the organizer" />
      <div className="filters">
        <div className="form-row"><label className="label">Event</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        <button className="btn btn-outline" disabled={busy || !layout} onClick={() => doExport("png")}>🖼 Export PNG</button>
        <button className="btn btn-outline" disabled={busy || !layout} onClick={() => doExport("pdf")}>📄 Export PDF</button>
      </div>

      {events.length === 0 ? <Empty emoji="🗺️" text="You are not assigned to any events" /> : !layout ? <Loading /> : (
        <div className="card">
          <LayoutDesigner key={eventId} value={layout.elements || []} readOnly />
        </div>
      )}
    </>
  );
}
