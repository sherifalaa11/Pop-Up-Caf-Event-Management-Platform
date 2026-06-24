import { useEffect, useState } from "react";
import { api } from "../../api";
import { useToast } from "../../components/Toast";
import { PageHeader, Loading, Empty, Badge } from "../../components/ui";

export default function VendorArrivals() {
  const { push } = useToast();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    api.get("/events/mine").then((evs) => { setEvents(evs); if (evs.length) setEventId(evs[0]._id); });
  }, []);
  function load() { if (eventId) api.get(`/sourcing?event=${eventId}`).then(setRequests); }
  useEffect(load, [eventId]);

  async function markArrived(id) {
    await api.patch(`/sourcing/${id}/arrived`);
    push("Vendor marked as arrived");
    load();
  }

  return (
    <>
      <PageHeader title="Vendor Arrivals" subtitle="Mark vendor deliveries as arrived" />
      <div className="filters">
        <div className="form-row"><label className="label">Event</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {!requests ? <Loading /> : requests.length === 0 ? <Empty emoji="🚚" text="No vendor deliveries for this event" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Vendor</th><th>Items</th><th>Delivery status</th><th></th></tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td><b>{r.vendor?.companyName || r.vendor?.name}</b></td>
                  <td className="small">{r.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}</td>
                  <td><Badge value={r.deliveryStatus} /></td>
                  <td>
                    {r.deliveryStatus === "arrived" ? <span className="muted small">✓ Arrived</span> :
                      <button className="btn btn-sm btn-success" onClick={() => markArrived(r._id)}>Mark Arrived</button>}
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
