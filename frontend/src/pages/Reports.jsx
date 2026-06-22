import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { PageHeader, Loading, Empty, Stat, Stars, Modal, Field } from "../components/ui";
import Icon from "../components/Icon";

export default function Reports() {
  const { push } = useToast();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [vendorPerf, setVendorPerf] = useState([]);
  const [rating, setRating] = useState(null); // vendor being rated

  useEffect(() => {
    api.get("/events").then((evs) => {
      setEvents(evs);
      if (evs.length) setEventId(evs[0]._id);
    });
    api.get("/reports/vendor-performance").then(setVendorPerf);
  }, []);

  useEffect(() => {
    if (eventId) api.get(`/reports/analytics/${eventId}`).then(setAnalytics);
  }, [eventId]);

  async function rateVendor(values) {
    await api.post(`/reports/vendor-rating/${rating.id}`, { ...values, event: eventId });
    push("Vendor rated");
    setRating(null);
    api.get("/reports/vendor-performance").then(setVendorPerf);
  }

  return (
    <>
      <PageHeader title="Reports & Analytics" subtitle="Costs, attendance and outcomes">
        <button className="btn btn-outline" onClick={() => window.print()}><Icon name="print" /> Print / PDF</button>
      </PageHeader>

      <div className="filters">
        <div className="form-row">
          <label className="label">Event</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        {eventId && (
          <>
            <button className="btn btn-outline" onClick={() => api.download(`/reports/attendance/${eventId}?format=csv`, "attendance.csv")}><Icon name="download" /> Attendance CSV</button>
            <button className="btn btn-outline" onClick={() => api.download(`/reports/financial/${eventId}?format=csv`, "financial.csv")}><Icon name="download" /> Financial CSV</button>
          </>
        )}
      </div>

      {!analytics ? <Loading /> : (
        <>
          <h3>{analytics.event.name} — {analytics.event.date}</h3>
          <div className="stat-grid">
            <Stat icon="users" value={analytics.attendance.invited} label="Invited" accent />
            <Stat icon="check" value={analytics.attendance.attending} label="Attending" />
            <Stat icon="door" value={analytics.attendance.checkedIn} label="Checked In" />
            <Stat icon="money" value={`$${analytics.costs.planned}`} label="Planned Cost" />
            <Stat icon="money" value={`$${analytics.costs.spent}`} label="Actual Spent" />
            <Stat icon="star" value={analytics.outcomes.avgOverall} label="Avg Rating" />
          </div>
          <div className="card mb">
            <h3>Outcome Summary</h3>
            <div className="kv">
              <span className="k">Feedback responses</span><span>{analytics.outcomes.feedbackCount}</span>
              <span className="k">Positive / Negative</span><span>{analytics.outcomes.positive} / {analytics.outcomes.negative}</span>
              <span className="k">Budget remaining</span><span>${analytics.costs.remaining}</span>
            </div>
          </div>
        </>
      )}

      <div className="card">
        <h3>Vendor Performance</h3>
        {vendorPerf.length === 0 ? <Empty emoji="🚚" text="No vendor data" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Vendor</th><th>Requests</th><th>Delivered</th><th>Invoices</th><th>Total $</th><th>Rating</th><th></th></tr></thead>
              <tbody>
                {vendorPerf.map((v) => (
                  <tr key={v.id}>
                    <td><b>{v.name}</b></td>
                    <td>{v.totalRequests}</td>
                    <td>{v.delivered}</td>
                    <td>{v.invoices}</td>
                    <td>${v.invoiceTotal}</td>
                    <td>{v.avgRating ? <><Stars value={Number(v.avgRating)} /> {v.avgRating}</> : "—"}</td>
                    <td><span className="btn btn-sm btn-outline" onClick={() => setRating(v)}>Rate</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rating && <RateModal vendor={rating} onClose={() => setRating(null)} onSave={rateVendor} />}
    </>
  );
}

function RateModal({ vendor, onClose, onSave }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <Modal title={`Rate ${vendor.name}`} onClose={onClose}>
      <Field label="Rating (1-5)">
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
        </select>
      </Field>
      <Field label="Comment"><textarea value={comment} onChange={(e) => setComment(e.target.value)} /></Field>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave({ rating, comment })}>Save Rating</button>
      </div>
    </Modal>
  );
}
