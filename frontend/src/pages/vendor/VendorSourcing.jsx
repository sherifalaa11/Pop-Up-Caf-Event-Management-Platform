import { useEffect, useState } from "react";
import { api } from "../../api";
import { useToast } from "../../components/Toast";
import { PageHeader, Loading, Empty, Badge } from "../../components/ui";

const DELIVERY = ["preparing", "out-for-delivery", "delivered"];

export default function VendorSourcing() {
  const { push } = useToast();
  const [requests, setRequests] = useState(null);
  const [status, setStatus] = useState("");

  function load() { api.get("/sourcing" + (status ? `?status=${status}` : "")).then(setRequests); }
  useEffect(load, [status]);

  async function respond(id, s) {
    await api.patch(`/sourcing/${id}/respond`, { status: s });
    push(`Request ${s}`);
    load();
  }
  async function setDelivery(id, deliveryStatus) {
    await api.patch(`/sourcing/${id}/delivery`, { deliveryStatus });
    push("Delivery status updated");
    load();
  }

  return (
    <>
      <PageHeader title="Sourcing Requests" subtitle="Incoming supply requests from organizers" />
      <div className="filters">
        <div className="form-row"><label className="label">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {!requests ? <Loading /> : requests.length === 0 ? <Empty emoji="📦" text="No sourcing requests" /> : (
        <div className="card-grid">
          {requests.map((r) => (
            <div className="card" key={r._id}>
              <div className="between">
                <b>{r.event?.name || "Event"}</b>
                <Badge value={r.status} />
              </div>
              <p className="small muted">For {r.organizer?.name} · deliver by {r.deliveryDate || "—"}</p>
              <div className="mb">{r.items.map((i, idx) => <span className="tag" key={idx}>{i.name} ×{i.quantity}</span>)}</div>
              <p className="small">📍 {r.location || "—"}</p>

              {r.status === "pending" && (
                <div className="row">
                  <button className="btn btn-sm btn-success" onClick={() => respond(r._id, "accepted")}>Accept</button>
                  <button className="btn btn-sm btn-danger" onClick={() => respond(r._id, "declined")}>Decline</button>
                </div>
              )}
              {r.status === "accepted" && (
                <div>
                  <label className="label">Delivery status</label>
                  <div className="row">
                    <Badge value={r.deliveryStatus} />
                    <select value="" onChange={(e) => e.target.value && setDelivery(r._id, e.target.value)}>
                      <option value="">Update...</option>
                      {DELIVERY.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
