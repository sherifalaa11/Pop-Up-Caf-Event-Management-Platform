import { useEffect, useState } from "react";
import { api } from "../../api";
import { PageHeader, Loading, Empty, Badge } from "../../components/ui";

export default function GuestNotifications() {
  const [items, setItems] = useState(null);

  function load() { api.get("/notifications/mine").then(setItems); }
  useEffect(load, []);

  async function markSeen(id) {
    await api.patch(`/notifications/${id}/seen`);
    load();
  }

  if (!items) return <Loading />;

  return (
    <>
      <PageHeader title="Notifications" subtitle="Messages from event organizers">
        <button className="btn btn-sm btn-outline" onClick={load}>↻ Refresh</button>
      </PageHeader>
      {items.length === 0 ? <Empty emoji="🔔" text="No messages yet" /> : (
        <div className="card-grid">
          {items.map((n) => (
            <div className="card" key={n._id}>
              <div className="between">
                <b>{n.title}</b>
                <Badge value={n.type} />
              </div>
              <p className="small muted">{n.event?.name}</p>
              <p>{n.body}</p>
              <div className="between">
                <span className="small muted">{n.seen ? "✓ Seen" : "● New"}</span>
                {!n.seen && <button className="btn btn-sm btn-primary" onClick={() => markSeen(n._id)}>Mark as seen</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
