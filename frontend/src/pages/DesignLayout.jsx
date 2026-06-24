import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { PageHeader, Loading, Empty, Field } from "../components/ui";
import Icon from "../components/Icon";
import LayoutDesigner from "../components/LayoutDesigner";
import { exportLayoutPNG, exportLayoutPDF } from "../lib/layoutExport";

// Organizer "Design Venue Layout" journey: access digital floor-plan tools,
// design the layout by dragging/dropping elements, share it with the setup
// team, and export it as a picture (PNG) or PDF file.
export default function DesignLayout() {
  const { push } = useToast();
  const [events, setEvents] = useState(null);
  const [eventId, setEventId] = useState("");
  const [elements, setElements] = useState([]);
  const [loadingLayout, setLoadingLayout] = useState(false);
  const [busy, setBusy] = useState(false);

  // load organizer's events for the picker
  useEffect(() => {
    api.get("/events").then((evs) => {
      setEvents(evs);
      if (evs.length) setEventId(evs[0]._id);
    });
  }, []);

  // load the selected event's saved layout
  useEffect(() => {
    if (!eventId) return;
    setLoadingLayout(true);
    api
      .get(`/events/${eventId}/layout`)
      .then((l) => setElements(l.elements || []))
      .finally(() => setLoadingLayout(false));
  }, [eventId]);

  const selectedEvent = (events || []).find((e) => e._id === eventId);

  async function save() {
    await api.put(`/events/${eventId}/layout`, { elements });
    push("Layout saved & shared with the setup team");
  }

  async function doExport(kind) {
    if (busy) return;
    setBusy(true);
    try {
      const base = (selectedEvent?.name || "venue-layout").replace(/\s+/g, "-").toLowerCase();
      if (kind === "png") await exportLayoutPNG(elements, `${base}-layout.png`);
      else await exportLayoutPDF(elements, `${base}-layout.pdf`, `${selectedEvent?.name || "Venue"} — Floor Plan`);
      push(`Exported layout as ${kind.toUpperCase()}`);
    } catch {
      push("Could not export the layout");
    } finally {
      setBusy(false);
    }
  }

  if (!events) return <Loading />;

  return (
    <>
      <PageHeader title="Design Venue Layout" subtitle="Drag and drop elements to design your floor plan, then share or export it" />

      {events.length === 0 ? (
        <Empty icon="events" text="Create an event first to design its venue layout" />
      ) : (
        <>
          <div className="card mb">
            <div className="between wrap" style={{ gap: 12 }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <Field label="Event">
                  <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
                    {events.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.name} — {e.date}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="row wrap" style={{ alignItems: "flex-end" }}>
                <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => doExport("png")}>
                  <Icon name="download" size={16} /> Export PNG
                </button>
                <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => doExport("pdf")}>
                  <Icon name="download" size={16} /> Export PDF
                </button>
                <button className="btn btn-primary btn-sm" onClick={save}>
                  Save &amp; Share
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            {loadingLayout ? (
              <Loading />
            ) : (
              <LayoutDesigner key={eventId} value={elements} onChange={setElements} />
            )}
          </div>
        </>
      )}
    </>
  );
}
