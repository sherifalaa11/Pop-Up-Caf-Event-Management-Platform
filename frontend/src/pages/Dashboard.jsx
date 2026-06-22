import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { PageHeader, Stat, Loading, Empty } from "../components/ui";
import Icon from "../components/Icon";

export default function Dashboard() {
  const [data, setData] = useState(null);

  function load() {
    api.get("/events/dashboard").then(setData).catch(() => {});
  }
  useEffect(load, []);

  if (!data) return <Loading />;
  const tp = data.taskProgress;
  const pct = tp.total ? Math.round((tp.done / tp.total) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader title="Daily Dashboard" subtitle="Your guided overview for today">
        <button className="btn btn-outline btn-sm" onClick={load}><Icon name="refresh" /> Refresh</button>
      </PageHeader>

      <div className="stat-grid">
        <Stat icon="events" value={data.totalEvents} label="Total Events" accent />
        <Stat icon="clock" value={data.upcomingCount} label="Upcoming Events" />
        <Stat icon="tasks" value={`${tp.done}/${tp.total}`} label="Tasks Completed" />
        <Stat icon="smile" value={data.feedback.positive} label="Positive Feedback" />
        <Stat icon="frown" value={data.feedback.negative} label="Negative Feedback" />
        <Stat icon="star" value={data.feedback.avgOverall} label="Avg Rating" />
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <h3>Overall Task Progress</h3>
          <div className="progress"><span style={{ width: pct + "%" }} /></div>
          <p className="small muted mt">{pct}% of all tasks completed across your events</p>
          <div className="divider" />
          <h3>Reminders — tasks due soon</h3>
          {(!data.dueSoonTasks || data.dueSoonTasks.length === 0) ? (
            <p className="muted small">Nothing due in the next few days. 🎉</p>
          ) : (
            data.dueSoonTasks.map((t, i) => (
              <div className="list-item" key={i}>
                <div><b>{t.title}</b><div className="small muted">{t.event}</div></div>
                <span className={`badge ${t.dueDate < today ? "red" : "amber"}`}>
                  {t.dueDate < today ? "Overdue" : "Due"} {t.dueDate}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3>Today's Events</h3>
          {data.todaysEvents.length === 0 ? (
            <Empty icon="calendar" text="No events scheduled for today" />
          ) : (
            data.todaysEvents.map((e) => (
              <div className="list-item" key={e._id}>
                <div>
                  <b>{e.name}</b>
                  <div className="small muted">{e.time} · {e.venueName}</div>
                </div>
                <Link className="btn btn-sm btn-primary" to={`/events/${e._id}`}>Open</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
