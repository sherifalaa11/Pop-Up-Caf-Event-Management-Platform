import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { PageHeader, Loading, Empty, Modal, Field } from "../components/ui";

export default function Vendors() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [vendors, setVendors] = useState(null);
  const [q, setQ] = useState("");
  const [events, setEvents] = useState([]);
  const [requestVendor, setRequestVendor] = useState(null); // vendor for the "Request supplies" modal

  function load() {
    api.get("/users?role=vendor" + (q ? `&q=${encodeURIComponent(q)}` : "")).then(setVendors);
  }
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);
  useEffect(() => { api.get("/events").then(setEvents); }, []);

  return (
    <>
      <PageHeader title="Vendors" subtitle="Browse suppliers, request supplies, and coordinate deliveries">
        <input placeholder="Search vendors..." value={q} onChange={(e) => setQ(e.target.value)} />
      </PageHeader>

      {!vendors ? <Loading /> : vendors.length === 0 ? <Empty emoji="🚚" text="No vendors found" /> : (
        <div className="card-grid">
          {vendors.map((v) => (
            <div className="card" key={v._id}>
              <h3 style={{ marginBottom: 2 }}>🏪 {v.companyName || v.name}</h3>
              <p className="small muted">📍 {v.mainLocation || "—"} · ✉ {v.email}</p>
              <div className="mb">{(v.suppliesOffered || []).map((s) => <span className="tag" key={s}>{s}</span>)}</div>
              {(v.pricingList || []).length > 0 && (
                <div className="kv small">
                  {v.pricingList.map((p, i) => (
                    <span key={i} style={{ display: "contents" }}>
                      <span className="k">{p.item}</span><span>${p.price}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="row mt">
                <button className="btn btn-sm btn-primary" onClick={() => setRequestVendor(v)}>📦 Request supplies</button>
                <button className="btn btn-sm btn-outline" onClick={() => navigate("/messages")}>💬 Message</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {requestVendor && (
        <RequestModal
          vendor={requestVendor}
          events={events}
          onClose={() => setRequestVendor(null)}
          onSent={() => { setRequestVendor(null); push("Sourcing request sent to " + (requestVendor.companyName || requestVendor.name)); }}
        />
      )}
    </>
  );
}

// Create & submit a sourcing request to a vendor (FR-28 / journey 4) — straight from the vendor card.
function RequestModal({ vendor, events, onClose, onSent }) {
  const { push } = useToast();
  const priceItems = (vendor.pricingList || []).map((p) => p.item);
  const supplyItems = vendor.suppliesOffered || [];
  const suggestions = [...new Set([...priceItems, ...supplyItems])];
  const [form, setForm] = useState({
    event: events[0]?._id || "",
    itemName: "",
    quantity: 1,
    deliveryDate: "",
    location: "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (!form.event) { push("Create an event first to source supplies", "error"); return; }
    try {
      await api.post("/sourcing", {
        event: form.event,
        vendor: vendor._id,
        items: [{ name: form.itemName, quantity: Number(form.quantity) || 1 }],
        deliveryDate: form.deliveryDate,
        location: form.location,
      });
      onSent();
    } catch (err) {
      push(err.message, "error");
    }
  }

  return (
    <Modal title={`Request supplies · ${vendor.companyName || vendor.name}`} onClose={onClose}>
      {events.length === 0 ? (
        <p className="muted small">You have no events yet. Create an event first, then you can send sourcing requests.</p>
      ) : (
        <form onSubmit={submit}>
          <Field label="For event">
            <select value={form.event} onChange={set("event")} required>
              {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.name} — {ev.date}</option>)}
            </select>
          </Field>
          <Field label="Item">
            <input list="vendor-items" value={form.itemName} onChange={set("itemName")} placeholder="e.g. Coffee Beans (kg)" required />
            <datalist id="vendor-items">
              {suggestions.map((s) => <option key={s} value={s} />)}
            </datalist>
          </Field>
          <div className="form-grid">
            <Field label="Quantity"><input type="number" min="1" value={form.quantity} onChange={set("quantity")} /></Field>
            <Field label="Delivery date"><input type="date" value={form.deliveryDate} onChange={set("deliveryDate")} /></Field>
          </div>
          <Field label="Delivery location"><input value={form.location} onChange={set("location")} placeholder="Venue / address" /></Field>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary">Send Request</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
