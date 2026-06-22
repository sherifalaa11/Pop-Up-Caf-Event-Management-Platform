import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { Field } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "reset"
  const [email, setEmail] = useState("organizer@popeyez.com");
  const [password, setPassword] = useState("password123");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      push("Welcome back!");
      navigate("/");
    } catch (err) {
      push(err.message, "error");
    }
    setLoading(false);
  }

  async function reset(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/reset-password", { email, newPassword });
      push(res.message || "Password updated");
      setPassword(newPassword);
      setMode("login");
    } catch (err) {
      push(err.message, "error");
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          <span className="logo">☕</span>
          <span>Pop<span className="accent">Eyez</span></span>
        </div>
        <p className="auth-sub">Pop-Up Café Event Management</p>

        {mode === "login" ? (
          <form onSubmit={submit}>
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="auth-switch">
              <a onClick={() => setMode("reset")} style={{ cursor: "pointer" }}>Forgot password?</a>
            </p>
            <p className="auth-switch">No account? <Link to="/register">Register</Link></p>
            <div className="demo-box">
              <b>Demo accounts</b> — password: <code>password123</code>
              <br />organizer@popeyez.com · owner@popeyez.com · vendor@popeyez.com
              <br />staff@popeyez.com · guest@popeyez.com
            </div>
          </form>
        ) : (
          <form onSubmit={reset}>
            <p className="muted small">Enter your email and a new password.</p>
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="New password">
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </Field>
            <button className="btn btn-primary btn-block">Reset Password</button>
            <p className="auth-switch">
              <a onClick={() => setMode("login")} style={{ cursor: "pointer" }}>← Back to sign in</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
