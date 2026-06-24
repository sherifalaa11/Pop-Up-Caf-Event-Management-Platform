import { useEffect, useState } from "react";
import { api } from "../../api";
import { PageHeader, Loading, Empty, Stat } from "../../components/ui";
import Icon from "../../components/Icon";

export default function OwnerDashboard() {
  const [venues, setVenues] = useState(null);
  const [bookings, setBookings] = useState(null);

  useEffect(() => {
    api.get("/venues/mine").then(setVenues);
    api.get("/bookings").then(setBookings);
  }, []);

  if (!venues || !bookings) return <Loading />;

  const approved = bookings.filter((b) => b.status === "approved");
  const rate = bookings.length ? Math.round((approved.length / bookings.length) * 100) : 0;

  const priceById = {};
  venues.forEach((v) => (priceById[v._id] = v.pricePerDay || 0));
  const revenue = approved.reduce((s, b) => s + (priceById[b.venue?._id] || 0), 0);

  const perListing = venues.map((v) => {
    const vb = bookings.filter((b) => b.venue?._id === v._id);
    const va = vb.filter((b) => b.status === "approved");
    return { name: v.name, total: vb.length, approved: va.length, revenue: va.length * (v.pricePerDay || 0) };
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = approved.filter((b) => (b.date || "") >= today).sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  function exportCsv() {
    const rows = [["Listing", "Requests", "Approved", "Revenue"], ...perListing.map((p) => [p.name, p.total, p.approved, p.revenue])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "venue-performance.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader title="Performance" subtitle="Your venues at a glance">
        <button className="btn btn-outline" onClick={exportCsv}><Icon name="download" /> Export CSV</button>
      </PageHeader>
      <div className="stat-grid">
        <Stat icon="venue" value={venues.length} label="Listings" accent />
        <Stat icon="booking" value={bookings.length} label="Total Requests" />
        <Stat icon="percent" value={`${rate}%`} label="Booking Rate" />
        <Stat icon="money" value={`$${revenue}`} label="Est. Revenue" />
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div className="card">
          <h3>Revenue by Listing</h3>
          {perListing.length === 0 ? <Empty icon="venue" text="No listings yet" /> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Listing</th><th>Requests</th><th>Approved</th><th>Revenue</th></tr></thead>
                <tbody>
                  {perListing.map((p, i) => (
                    <tr key={i}><td><b>{p.name}</b></td><td>{p.total}</td><td>{p.approved}</td><td>${p.revenue}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Upcoming Confirmed Bookings</h3>
          {upcoming.length === 0 ? <Empty icon="calendar" text="No upcoming bookings" /> : (
            upcoming.map((b) => (
              <div className="list-item" key={b._id}>
                <div><b>{b.venue?.name}</b><div className="small muted">{b.eventType} · {b.organizer?.name}</div></div>
                <span className="badge blue">{b.date}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
