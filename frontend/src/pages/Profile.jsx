import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../components/Toast";
import { PageHeader, Field } from "../components/ui";

// Shared account page for every role (journeys 1 & 22).
export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    password: "",
    companyName: user.companyName || "",
    mainLocation: user.mainLocation || "",
    contact: user.contact || "",
    dietaryPreference: user.dietaryPreference || "",
    suppliesOffered: (user.suppliesOffered || []).join(", "),
  });
  const [pricing, setPricing] = useState(user.pricingList?.length ? user.pricingList : [{ item: "", price: 0 }]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    const body = { name: form.name, phone: form.phone };
    if (form.password) body.password = form.password;
    if (user.role === "vendor") {
      body.companyName = form.companyName;
      body.mainLocation = form.mainLocation;
      body.contact = form.contact;
      body.suppliesOffered = form.suppliesOffered.split(",").map((s) => s.trim()).filter(Boolean);
      body.pricingList = pricing.filter((p) => p.item).map((p) => ({ item: p.item, price: Number(p.price) || 0 }));
    }
    if (user.role === "venueOwner") {
      body.companyName = form.companyName;
      body.contact = form.contact;
    }
    if (user.role === "guest") body.dietaryPreference = form.dietaryPreference;

    try {
      const updated = await api.put("/users/me", body);
      updateLocalUser(updated);
      setForm({ ...form, password: "" });
      push("Profile updated");
    } catch (err) {
      push(err.message, "error");
    }
  }

  return (
    <>
      <PageHeader title="My Account" subtitle="Update your account details" />
      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={save}>
          <div className="form-grid">
            <Field label="Full name"><input value={form.name} onChange={set("name")} required /></Field>
            <Field label="Phone"><input value={form.phone} onChange={set("phone")} /></Field>
          </div>
          <Field label="Email"><input value={user.email} disabled /></Field>

          {user.role === "staff" && (
            <div className="kv mt mb">
              <span className="k">Speciality</span><span>{user.speciality || "—"}</span>
              <span className="k">Employment</span><span>{user.employmentType || "—"}</span>
              <span className="k">Age</span><span>{user.age || "—"}</span>
            </div>
          )}
          {user.role === "guest" && (
            <Field label="Dietary preference"><input value={form.dietaryPreference} onChange={set("dietaryPreference")} /></Field>
          )}
          {user.role === "venueOwner" && (
            <div className="form-grid">
              <Field label="Company name"><input value={form.companyName} onChange={set("companyName")} /></Field>
              <Field label="Contact"><input value={form.contact} onChange={set("contact")} /></Field>
            </div>
          )}
          {user.role === "vendor" && (
            <>
              <div className="form-grid">
                <Field label="Company name"><input value={form.companyName} onChange={set("companyName")} /></Field>
                <Field label="Main location"><input value={form.mainLocation} onChange={set("mainLocation")} /></Field>
              </div>
              <Field label="Contact"><input value={form.contact} onChange={set("contact")} /></Field>
              <Field label="Supplies offered (comma separated)"><input value={form.suppliesOffered} onChange={set("suppliesOffered")} /></Field>
              <label className="label">Pricing list</label>
              {pricing.map((p, i) => (
                <div className="row mb" key={i}>
                  <input placeholder="Item" value={p.item} onChange={(e) => setPricing(pricing.map((x, idx) => idx === i ? { ...x, item: e.target.value } : x))} />
                  <input type="number" placeholder="$" value={p.price} onChange={(e) => setPricing(pricing.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x))} style={{ maxWidth: 110 }} />
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-outline" onClick={() => setPricing([...pricing, { item: "", price: 0 }])}>+ Item</button>
            </>
          )}

          <Field label="New password (leave blank to keep current)"><input type="password" value={form.password} onChange={set("password")} /></Field>
          <button className="btn btn-primary btn-block mt">Save Changes</button>
        </form>
      </div>
    </>
  );
}
