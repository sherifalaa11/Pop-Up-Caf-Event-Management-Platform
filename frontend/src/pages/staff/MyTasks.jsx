import { useEffect, useState } from "react";
import { api } from "../../api";
import { useToast } from "../../components/Toast";
import { PageHeader, Loading, Empty, Badge } from "../../components/ui";

export default function MyTasks() {
  const { push } = useToast();
  const [tasks, setTasks] = useState(null);
  const [status, setStatus] = useState("");

  function load() { api.get("/tasks/mine" + (status ? `?status=${status}` : "")).then(setTasks); }
  useEffect(load, [status]);

  async function update(id, s) {
    await api.patch(`/tasks/${id}/status`, { status: s });
    push("Task updated");
    load();
  }

  return (
    <>
      <PageHeader title="My Tasks" subtitle="Update progress on your assigned tasks" />
      <div className="filters">
        <div className="form-row">
          <label className="label">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {!tasks ? <Loading /> : tasks.length === 0 ? <Empty emoji="✅" text="No tasks assigned to you" /> : (
        <div className="card-grid">
          {tasks.map((t) => (
            <div className="card" key={t._id}>
              <div className="between">
                <b>{t.title}</b>
                <Badge value={t.status} />
              </div>
              <p className="small muted">{t.event?.name} · {t.speciality} · due {t.dueDate || "—"}</p>
              <div className="row">
                <button className="btn btn-sm btn-outline" onClick={() => update(t._id, "in-progress")}>Start</button>
                <button className="btn btn-sm btn-success" onClick={() => update(t._id, "done")}>Mark Done</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
