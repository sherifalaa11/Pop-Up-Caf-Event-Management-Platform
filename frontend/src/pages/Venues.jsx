import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { PageHeader, Loading, Empty } from "../components/ui";

const isUrl = (s) => typeof s === "string" && s.startsWith("http");

export default function Venues() {
  const { push } = useToast();
  const [venues, setVenues] = useState(null);
  const [shortlist, setShortlist] = useState([]);
  const [f, setF] = useState({ city: "", minCapacity: "", maxPrice: "", date: "" });

  function loadShortlist() {
    api.get("/venues/shortlist").then((list) => setShortlist(list.map((v) => v._id))).catch(() => {});
  }
  function load() {
    const q = Object.entries(f).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    api.get("/venues" + (q ? "?" + q : "")).then(setVenues);
  }
  useEffect(load, [f]);
  useEffect(loadShortlist, []);

  async function toggle(id) {
    await api.post(`/venues/${id}/shortlist`);
    loadShortlist();
    push("Shortlist updated");
  }

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Venues" subtitle="Discover and shortlist pop-up spaces" />
      <div className="filters">
        <div className="form-row"><label className="label">City</label><input value={f.city} onChange={set("city")} placeholder="e.g. Cairo" /></div>
        <div className="form-row"><label className="label">Min capacity</label><input type="number" value={f.minCapacity} onChange={set("minCapacity")} /></div>
        <div className="form-row"><label className="label">Max price/day</label><input type="number" value={f.maxPrice} onChange={set("maxPrice")} /></div>
        <div className="form-row"><label className="label">Available on</label><input type="date" value={f.date} onChange={set("date")} /></div>
        <button className="btn btn-outline" onClick={() => setF({ city: "", minCapacity: "", maxPrice: "", date: "" })}>Clear</button>
      </div>

      {!venues ? <Loading /> : venues.length === 0 ? <Empty emoji="🏛️" text="No venues match your filters" /> : (
        <div className="card-grid">
          {venues.map((v) => (
            <div className="card" key={v._id}>
              {isUrl(v.images?.[0])
                ? <img className="venue-photo mb" src={v.images[0]} alt={v.name} />
                : <div className="thumb-emoji mb">{v.images?.[0] || "🏛️"}</div>}
              <div className="between">
                <h3 style={{ margin: 0 }}>{v.name}</h3>
                <span className="btn btn-sm btn-outline" onClick={() => toggle(v._id)}>
                  {shortlist.includes(v._id) ? "★ Shortlisted" : "☆ Shortlist"}
                </span>
              </div>
              <p className="small muted mt">{v.city} · Capacity {v.capacity} · {v.sizeSqm} m²</p>
              <p className="small">{v.description}</p>
              <div className="mb">{(v.amenities || []).map((a) => <span className="tag" key={a}>{a}</span>)}</div>
              <div className="between">
                <b>${v.pricePerDay}/day</b>
                <Link className="btn btn-sm btn-primary" to={`/venues/${v._id}`}>View & Book</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
