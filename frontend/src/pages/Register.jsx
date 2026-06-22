import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { useToast } from "../components/Toast";
import { Field } from "../components/ui";

export default function Register() {
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "organizer" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      push("Account created!");
      navigate("/");
    } catch (err) {
      push(err.message, "error");
    }
    setLoading(false);
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand">
          <span className="logo">☕</span>
          <span>Pop<span className="accent">Eyez</span></span>
        </div>
        <p className="auth-sub">Create your account</p>
        <Field label="Full name">
          <input value={form.name} onChange={set("name")} required />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={set("email")} required />
        </Field>
        <Field label="Password">
          <input type="password" value={form.password} onChange={set("password")} required />
        </Field>
        <Field label="I am a...">
          <select value={form.role} onChange={set("role")}>
            <option value="organizer">Event Organizer</option>
            <option value="vendor">Vendor / Supplier</option>
            <option value="venueOwner">Venue Owner</option>
            <option value="guest">Guest</option>
          </select>
        </Field>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
