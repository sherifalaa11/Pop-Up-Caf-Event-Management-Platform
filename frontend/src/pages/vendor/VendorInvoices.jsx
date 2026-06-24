import { useEffect, useState } from "react";
import { api } from "../../api";
import { useToast } from "../../components/Toast";
import { PageHeader, Loading, Empty, Badge, Modal, Field } from "../../components/ui";

export default function VendorInvoices() {
  const { push } = useToast();
  const [invoices, setInvoices] = useState(null);
  const [requests, setRequests] = useState([]);
  const [show, setShow] = useState(false);
  const [items, setItems] = useState([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [meta, setMeta] = useState({ event: "", organizer: "", notes: "", attachmentUrl: "" });

  function load() { api.get("/invoices").then(setInvoices); }
  useEffect(() => {
    load();
    api.get("/sourcing?status=accepted").then(setRequests);
  }, []);

  const total = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  function pickRequest(id) {
    const r = requests.find((x) => x._id === id);
    if (r) setMeta({ event: r.event?._id || "", organizer: r.organizer?._id || "", notes: "" });
  }

  async function submit(e) {
    e.preventDefault();
    await api.post("/invoices", {
      event: meta.event || undefined,
      organizer: meta.organizer || undefined,
      items: items.map((i) => ({ description: i.description, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
      notes: meta.notes,
      attachmentUrl: meta.attachmentUrl || undefined,
    });
    push("Invoice submitted");
    setShow(false);
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    setMeta({ event: "", organizer: "", notes: "", attachmentUrl: "" });
    load();
  }

  return (
    <>
      <PageHeader title="Invoices" subtitle="Submit and track your invoices">
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ New Invoice</button>
      </PageHeader>

      {!invoices ? <Loading /> : invoices.length === 0 ? <Empty emoji="🧾" text="No invoices yet" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Event</th><th>Items</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.event?.name || "—"}</td>
                  <td className="small">{inv.items.map((i) => i.description).join(", ")}</td>
                  <td><b>${inv.amount}</b></td>
                  <td><Badge value={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {show && (
        <Modal title="New Invoice" onClose={() => setShow(false)}>
          <form onSubmit={submit}>
            <Field label="For accepted request (optional)">
              <select onChange={(e) => pickRequest(e.target.value)}>
                <option value="">Select a request to auto-fill</option>
                {requests.map((r) => <option key={r._id} value={r._id}>{r.event?.name} — {r.organizer?.name}</option>)}
              </select>
            </Field>
            <label className="label">Line items</label>
            {items.map((it, i) => (
              <div className="row mb" key={i}>
                <input placeholder="Description" value={it.description} onChange={(e) => setItems(items.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} />
                <input type="number" placeholder="Qty" value={it.quantity} onChange={(e) => setItems(items.map((x, idx) => idx === i ? { ...x, quantity: e.target.value } : x))} style={{ maxWidth: 70 }} />
                <input type="number" placeholder="$ each" value={it.unitPrice} onChange={(e) => setItems(items.map((x, idx) => idx === i ? { ...x, unitPrice: e.target.value } : x))} style={{ maxWidth: 90 }} />
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline" onClick={() => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])}>+ Item</button>
            <Field label="Attachment link (optional)"><input value={meta.attachmentUrl} onChange={(e) => setMeta({ ...meta, attachmentUrl: e.target.value })} placeholder="https://... (itemized breakdown / receipt)" /></Field>
            <Field label="Notes"><textarea value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} /></Field>
            <p><b>Total: ${total}</b></p>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShow(false)}>Cancel</button>
              <button className="btn btn-primary">Submit Invoice</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
