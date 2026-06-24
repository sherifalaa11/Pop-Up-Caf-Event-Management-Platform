// Small reusable UI pieces shared across pages.
import Icon from "./Icon";

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <div className="row wrap">{children}</div>
    </div>
  );
}

export function Stat({ icon, value, label, accent }) {
  return (
    <div className={`stat ${accent ? "accent" : ""}`}>
      {icon && <span className="stat-icon"><Icon name={icon} size={20} /></span>}
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

// status pill - the class name drives the colour (see index.css)
export function Badge({ value }) {
  const cls = String(value || "").toLowerCase().replace(/\s+/g, "-");
  return <span className={`badge ${cls}`}>{value || "-"}</span>;
}

export function Loading() {
  return <div className="spinner" />;
}

export function Empty({ icon = "empty", text = "Nothing here yet" }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon name={icon} size={34} /></span>
      {text}
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="between mb">
          <h2 style={{ margin: 0 }}>{title}</h2>
          <span className="btn btn-sm btn-outline" onClick={onClose}>✕</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="form-row">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function Stars({ value = 0 }) {
  const n = Math.round(value);
  return <span className="rating">{"★".repeat(n)}{"☆".repeat(Math.max(0, 5 - n))}</span>;
}
