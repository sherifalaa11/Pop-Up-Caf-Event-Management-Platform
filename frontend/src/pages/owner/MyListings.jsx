import { useEffect, useState } from "react";
import { api } from "../../api";
import { useToast } from "../../components/Toast";
import { PageHeader, Loading, Empty, Badge, Modal, Field } from "../../components/ui";

const BLANK = { name: "", description: "", city: "", capacity: "", sizeSqm: "", pricePerDay: "", amenities: "", images: "🏛️", unavailableDates: "" };

export default function MyListings() {
  const { push } = useToast();
  const [venues, setVenues] = useState(null);
  const [editing, setEditing] = useState(null); // venue or {} for new

  function load() { api.get("/venues/mine").then(setVenues); }
  useEffect(load, []);

  function openNew() { setEditing({ ...BLANK }); }
  function openEdit(v) {
    setEditing({
      ...v,
      amenities: (v.amenities || []).join(", "),
      images: (v.images || []).join(", "),
      unavailableDates: (v.unavailableDates || []).join(", "),
    });
  }

  async function save(e) {
    e.preventDefault();
    const body = {
      name: editing.name, description: editing.description, city: editing.city,
      capacity: Number(editing.capacity) || 0, sizeSqm: Number(editing.sizeSqm) || 0,
      pricePerDay: Number(editing.pricePerDay) || 0,
      amenities: String(editing.amenities || "").split(",").map((s) => s.trim()).filter(Boolean),
      images: String(editing.images || "").split(",").map((s) => s.trim()).filter(Boolean),
      unavailableDates: String(editing.unavailableDates || "").split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (editing._id) await api.put(`/venues/${editing._id}`, body);
    else await api.post("/venues", body);
    push("Listing saved");
    setEditing(null);
    load();
  }
  async function toggleActive(v) { await api.put(`/venues/${v._id}`, { isActive: !v.isActive }); load(); }
  async function remove(v) { if (confirm("Remove this listing?")) { await api.del(`/venues/${v._id}`); push("Listing removed"); load(); } }

  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });

  return (
    <>
      <PageHeader title="My Listings" subtitle="Manage your venue spaces">
        <button className="btn btn-primary" onClick={openNew}>+ New Listing</button>
      </PageHeader>

      {!venues ? <Loading /> : venues.length === 0 ? <Empty emoji="🏛️" text="No listings yet" /> : (
        <div className="card-grid">
          {venues.map((v) => (
            <div className="card" key={v._id}>
              <div className="between">
                <div style={{ fontSize: "2rem" }}>{v.images?.[0] || "🏛️"}</div>
                <Badge value={v.isActive ? "active" : "inactive"} />
              </div>
              <h3 className="mt" style={{ marginBottom: 2 }}>{v.name}</h3>
              <p className="small muted">{v.city} · Cap {v.capacity} · ${v.pricePerDay}/day</p>
              <p className="small">{v.description}</p>
              <div className="row mt">
                <button className="btn btn-sm btn-outline" onClick={() => openEdit(v)}>Edit</button>
                <button className="btn btn-sm btn-outline" onClick={() => toggleActive(v)}>{v.isActive ? "Deactivate" : "Activate"}</button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(v)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing._id ? "Edit Listing" : "New Listing"} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <Field label="Name"><input value={editing.name} onChange={set("name")} required /></Field>
            <Field label="Description"><textarea value={editing.description} onChange={set("description")} /></Field>
            <div className="form-grid">
              <Field label="City"><input value={editing.city} onChange={set("city")} /></Field>
              <Field label="Price / day ($)"><input type="number" value={editing.pricePerDay} onChange={set("pricePerDay")} /></Field>
            </div>
            <div className="form-grid">
              <Field label="Capacity"><input type="number" value={editing.capacity} onChange={set("capacity")} /></Field>
              <Field label="Size (m²)"><input type="number" value={editing.sizeSqm} onChange={set("sizeSqm")} /></Field>
            </div>
            <Field label="Amenities (comma separated)"><input value={editing.amenities} onChange={set("amenities")} /></Field>
            <div className="form-grid">
              <Field label="Icon / photo (emoji)"><input value={editing.images} onChange={set("images")} /></Field>
              <Field label="Unavailable dates (comma, YYYY-MM-DD)"><input value={editing.unavailableDates} onChange={set("unavailableDates")} /></Field>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
