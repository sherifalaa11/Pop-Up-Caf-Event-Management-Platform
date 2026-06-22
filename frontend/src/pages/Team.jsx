import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { PageHeader, Loading, Empty, Badge, Modal, Field } from "../components/ui";

const ROLES = [
  { key: "staff", label: "Team / Staff" },
  { key: "vendor", label: "Vendors" },
  { key: "guest", label: "Guests" },
  { key: "venueOwner", label: "Venue Owners" },
];
const PERMISSIONS = ["tasks", "budget", "guests", "vendors", "reports"];
const BLANK = { name: "", email: "", password: "password123", role: "staff", speciality: "Catering", employmentType: "full-time", age: "", companyName: "", mainLocation: "", suppliesOffered: "", contact: "", dietaryPreference: "" };

export default function Team() {
  const { push } = useToast();
  const [role, setRole] = useState("staff");
  const [users, setUsers] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [permUser, setPermUser] = useState(null);
  const [sf, setSf] = useState({ speciality: "", employmentType: "" });

  function load() {
    let q = `?role=${role}`;
    if (role === "staff") {
      if (sf.speciality) q += `&speciality=${sf.speciality}`;
      if (sf.employmentType) q += `&employmentType=${sf.employmentType}`;
    }
    api.get("/users" + q).then(setUsers);
  }
  useEffect(load, [role, sf]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function create(e) {
    e.preventDefault();
    const body = { ...form };
    if (body.suppliesOffered) body.suppliesOffered = body.suppliesOffered.split(",").map((s) => s.trim());
    if (body.age) body.age = Number(body.age);
    try {
      await api.post("/users", body);
      push("Account created");
      setShowCreate(false);
      setForm({ ...BLANK, role });
      load();
    } catch (err) { push(err.message, "error"); }
  }
  async function toggleActive(u) {
    await api.patch(`/users/${u._id}/active`, { isActive: !u.isActive });
    push(u.isActive ? "Account deactivated" : "Account reactivated");
    load();
  }
  async function savePermissions(perms) {
    await api.put(`/users/${permUser._id}`, { permissions: perms });
    push("Permissions updated");
    setPermUser(null);
    load();
  }

  return (
    <>
      <PageHeader title="Team & Accounts" subtitle="Create and manage stakeholder accounts">
        <button className="btn btn-primary" onClick={() => { setForm({ ...BLANK, role }); setShowCreate(true); }}>+ New Account</button>
      </PageHeader>

      <div className="tabs">
        {ROLES.map((r) => <div key={r.key} className={`tab ${role === r.key ? "active" : ""}`} onClick={() => setRole(r.key)}>{r.label}</div>)}
      </div>

      {role === "staff" && (
        <div className="filters">
          <div className="form-row"><label className="label">Speciality</label>
            <select value={sf.speciality} onChange={(e) => setSf({ ...sf, speciality: e.target.value })}>
              <option value="">All specialities</option><option>Catering</option><option>Seating</option><option>Logistics</option>
            </select>
          </div>
          <div className="form-row"><label className="label">Employment</label>
            <select value={sf.employmentType} onChange={(e) => setSf({ ...sf, employmentType: e.target.value })}>
              <option value="">All types</option><option value="full-time">Full-time</option><option value="part-time">Part-time</option>
            </select>
          </div>
        </div>
      )}

      {!users ? <Loading /> : users.length === 0 ? <Empty emoji="👥" text="No accounts in this group" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Details</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><b>{u.name}</b></td>
                  <td>{u.email}</td>
                  <td className="small">
                    {role === "staff" && `${u.speciality || "—"} · ${u.employmentType || "—"}${u.age ? " · " + u.age + "y" : ""}`}
                    {role === "vendor" && (u.suppliesOffered || []).join(", ")}
                    {role === "venueOwner" && (u.companyName || "—")}
                    {role === "guest" && (u.dietaryPreference || "—")}
                  </td>
                  <td><Badge value={u.isActive ? "active" : "inactive"} /></td>
                  <td className="row">
                    {role === "staff" && <span className="btn btn-sm btn-outline" onClick={() => setPermUser(u)}>Permissions</span>}
                    <span className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-success"}`} onClick={() => toggleActive(u)}>
                      {u.isActive ? "Deactivate" : "Activate"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Create Account" onClose={() => setShowCreate(false)}>
          <form onSubmit={create}>
            <div className="form-grid">
              <Field label="Name"><input value={form.name} onChange={set("name")} required /></Field>
              <Field label="Role">
                <select value={form.role} onChange={set("role")}>
                  {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Email"><input type="email" value={form.email} onChange={set("email")} required /></Field>
              <Field label="Password"><input value={form.password} onChange={set("password")} required /></Field>
            </div>
            {form.role === "staff" && (
              <div className="form-grid">
                <Field label="Speciality">
                  <select value={form.speciality} onChange={set("speciality")}><option>Catering</option><option>Seating</option><option>Logistics</option></select>
                </Field>
                <Field label="Employment">
                  <select value={form.employmentType} onChange={set("employmentType")}><option value="full-time">Full-time</option><option value="part-time">Part-time</option></select>
                </Field>
              </div>
            )}
            {form.role === "staff" && <Field label="Age"><input type="number" value={form.age} onChange={set("age")} /></Field>}
            {form.role === "vendor" && (
              <>
                <Field label="Company name"><input value={form.companyName} onChange={set("companyName")} /></Field>
                <Field label="Main location"><input value={form.mainLocation} onChange={set("mainLocation")} /></Field>
                <Field label="Supplies (comma separated)"><input value={form.suppliesOffered} onChange={set("suppliesOffered")} /></Field>
              </>
            )}
            {form.role === "venueOwner" && (
              <>
                <Field label="Company name"><input value={form.companyName} onChange={set("companyName")} /></Field>
                <Field label="Contact"><input value={form.contact} onChange={set("contact")} /></Field>
              </>
            )}
            {form.role === "guest" && <Field label="Dietary preference"><input value={form.dietaryPreference} onChange={set("dietaryPreference")} /></Field>}
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {permUser && <PermissionModal user={permUser} onClose={() => setPermUser(null)} onSave={savePermissions} />}
    </>
  );
}

function PermissionModal({ user, onClose, onSave }) {
  const [perms, setPerms] = useState(user.permissions || []);
  function toggle(p) { setPerms(perms.includes(p) ? perms.filter((x) => x !== p) : [...perms, p]); }
  return (
    <Modal title={`Permissions · ${user.name}`} onClose={onClose}>
      <p className="muted small">Choose which areas this team member can access.</p>
      {PERMISSIONS.map((p) => (
        <label key={p} className="list-item" style={{ cursor: "pointer" }}>
          <span style={{ textTransform: "capitalize" }}>{p}</span>
          <input type="checkbox" checked={perms.includes(p)} onChange={() => toggle(p)} />
        </label>
      ))}
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(perms)}>Save</button>
      </div>
    </Modal>
  );
}
