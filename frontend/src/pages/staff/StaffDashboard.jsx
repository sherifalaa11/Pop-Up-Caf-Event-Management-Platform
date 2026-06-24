import { useEffect, useState } from "react";
import { api } from "../../api";
import { PageHeader, Loading, Empty, Stat, Badge } from "../../components/ui";

export default function StaffDashboard() {
  const [events, setEvents] = useState(null);
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState("");
  const [dayof, setDayof] = useState(null);

  function load() {
    api.get("/events/mine" + (date ? `?date=${date}` : "")).then((evs) => {
      setEvents(evs);
      // keep the current selection if it's still in the (filtered) list, else pick the first
      setSelected((cur) => (evs.some((e) => e._id === cur) ? cur : evs[0]?._id || ""));
    });
  }
  useEffect(load, [date]);
  useEffect(() => {
    if (selected) api.get(`/events/${selected}/dayof`).then(setDayof);
    else setDayof(null); // clear stats when no event is in the filtered list
  }, [selected]);

  return (
    <>
      <PageHeader title="My Dashboard" subtitle="Events you are working on" />
      <div className="filters">
        <div className="form-row"><label className="label">Filter by date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        {date && <button className="btn btn-outline" onClick={() => setDate("")}>Clear</button>}
      </div>

      {!events ? <Loading /> : events.length === 0 ? <Empty emoji="📅" text="You are not assigned to any events" /> : (
        <>
          <div className="card mb">
            <label className="label">Select event</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {events.map((e) => <option key={e._id} value={e._id}>{e.name} — {e.date}</option>)}
            </select>
          </div>
          {dayof && (
            <div className="stat-grid">
              <Stat icon="users" value={dayof.totalGuests} label="Total Guests" accent />
              <Stat icon="check" value={dayof.attending} label="Attending" />
              <Stat icon="door" value={dayof.arrivedGuests} label="Checked In" />
              <Stat icon="list" value={`${dayof.tasks.done}/${dayof.tasks.total}`} label="Tasks Done" />
            </div>
          )}
          <div className="card">
            <h3>My Events</h3>
            {events.map((e) => (
              <div className="list-item" key={e._id}>
                <div><b>{e.name}</b><div className="small muted">{e.date} {e.time} · {e.venue?.name}</div></div>
                <Badge value={e.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
