import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { PageHeader, Loading, Empty } from "../components/ui";

export default function Vendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState(null);
  const [q, setQ] = useState("");

  function load() {
    api.get("/users?role=vendor" + (q ? `&q=${encodeURIComponent(q)}` : "")).then(setVendors);
  }
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);

  return (
    <>
      <PageHeader title="Vendors" subtitle="Browse suppliers and their offerings">
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
                  {v.pricingList.map((p, i) => (<><span className="k" key={"k" + i}>{p.item}</span><span key={"v" + i}>${p.price}</span></>))}
                </div>
              )}
              <button className="btn btn-sm btn-outline mt" onClick={() => navigate("/messages")}>💬 Message</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
