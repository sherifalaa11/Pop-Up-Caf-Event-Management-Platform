import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../components/Toast";
import { Badge, Loading, Empty, Field, Stat, Stars } from "../components/ui";
import Icon from "../components/Icon";
import LayoutDesigner from "../components/LayoutDesigner";
import { exportLayoutPNG, exportLayoutPDF } from "../lib/layoutExport";

const TABS = ["Overview", "Tasks", "Budget", "Layout", "Guests", "Sourcing", "Day-of", "Feedback"];

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [event, setEvent] = useState(null);
  const [tab, setTab] = useState("Overview");

  // section data
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [budget, setBudget] = useState(null);
  const [guests, setGuests] = useState([]);
  const [sourcing, setSourcing] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dayof, setDayof] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [trends, setTrends] = useState(null);

  function loadEvent() { api.get(`/events/${id}`).then(setEvent); }
  useEffect(loadEvent, [id]);

  useEffect(() => {
    if (tab === "Tasks") { api.get(`/tasks?event=${id}`).then(setTasks); api.get("/users?role=staff").then(setStaff); }
    if (tab === "Budget") api.get(`/budget/event/${id}`).then(setBudget);
    if (tab === "Guests") api.get(`/guests?event=${id}`).then(setGuests);
    if (tab === "Sourcing") { api.get(`/sourcing?event=${id}`).then(setSourcing); api.get("/users?role=vendor").then(setVendors); api.get(`/invoices?event=${id}`).then(setInvoices); }
    if (tab === "Day-of") api.get(`/events/${id}/dayof`).then(setDayof);
    if (tab === "Feedback") { api.get(`/feedback?event=${id}`).then(setFeedback); api.get(`/feedback/trends/${id}`).then(setTrends); }
  }, [tab, id]);

  if (!event) return <Loading />;

  return (
    <>
      <div className="page-header">
        <div>
          <span className="btn btn-sm btn-outline" onClick={() => navigate("/events")}>← Events</span>
          <h1 style={{ marginTop: 8 }}>{event.name} <Badge value={event.status} /></h1>
          <p className="muted">{event.date} {event.time} · {event.venue?.name || event.venueName}</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {tab === "Overview" && <Overview event={event} reload={loadEvent} push={push} navigate={navigate} />}
      {tab === "Tasks" && <Tasks id={id} tasks={tasks} staff={staff} reload={() => api.get(`/tasks?event=${id}`).then(setTasks)} push={push} />}
      {tab === "Budget" && <BudgetTab id={id} data={budget} reload={() => api.get(`/budget/event/${id}`).then(setBudget)} push={push} />}
      {tab === "Layout" && <LayoutTab id={id} event={event} push={push} />}
      {tab === "Guests" && <GuestsTab id={id} guests={guests} reload={() => api.get(`/guests?event=${id}`).then(setGuests)} push={push} />}
      {tab === "Sourcing" && <SourcingTab id={id} sourcing={sourcing} vendors={vendors} invoices={invoices} reload={() => api.get(`/sourcing?event=${id}`).then(setSourcing)} reloadInvoices={() => api.get(`/invoices?event=${id}`).then(setInvoices)} push={push} />}
      {tab === "Day-of" && <DayOfTab id={id} dayof={dayof} reload={() => api.get(`/events/${id}/dayof`).then(setDayof)} push={push} />}
      {tab === "Feedback" && <FeedbackTab id={id} feedback={feedback} trends={trends} push={push} />}
    </>
  );
}

/* ---------------- Overview + schedule ---------------- */
function Overview({ event, reload, push, navigate }) {
  const [milestone, setMilestone] = useState({ title: "", date: "" });

  async function setStatus(status) {
    await api.put(`/events/${event._id}`, { status });
    push("Status updated");
    reload();
  }
  async function addMilestone(e) {
    e.preventDefault();
    const schedule = [...(event.schedule || []), { ...milestone, done: false }];
    await api.put(`/events/${event._id}`, { schedule });
    setMilestone({ title: "", date: "" });
    push("Milestone added");
    reload();
  }
  async function toggleMilestone(i) {
    const schedule = event.schedule.map((m, idx) => (idx === i ? { ...m, done: !m.done } : m));
    await api.put(`/events/${event._id}`, { schedule });
    reload();
  }
  async function remove() {
    if (!confirm("Delete this event?")) return;
    await api.del(`/events/${event._id}`);
    push("Event deleted");
    navigate("/events");
  }

  return (
    <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="card">
        <h3>Event Details</h3>
        <div className="kv">
          <span className="k">Description</span><span>{event.description || "—"}</span>
          <span className="k">Dress code</span><span>{event.dressCode || "—"}</span>
          <span className="k">Agenda</span><span>{event.agenda || "—"}</span>
          <span className="k">Team</span><span>{(event.teamMembers || []).map((m) => m.name).join(", ") || "None"}</span>
        </div>
        <div className="row mt">
          <Field label="Change status">
            <select value={event.status} onChange={(e) => setStatus(e.target.value)}>
              <option value="planning">Planning</option>
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="completed">Completed</option>
            </select>
          </Field>
        </div>
        <button className="btn btn-danger btn-sm mt" onClick={remove}>Delete event</button>
      </div>

      <div className="card">
        <h3>Schedule & Milestones</h3>
        {(event.schedule || []).length === 0 && <p className="muted small">No milestones yet.</p>}
        {(event.schedule || []).map((m, i) => (
          <div className="list-item" key={i}>
            <div>
              <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(i)} />{" "}
              <span style={{ textDecoration: m.done ? "line-through" : "none" }}>{m.title}</span>
            </div>
            <span className="small muted">{m.date}</span>
          </div>
        ))}
        <form onSubmit={addMilestone} className="mt">
          <Field label="Add milestone"><input value={milestone.title} onChange={(e) => setMilestone({ ...milestone, title: e.target.value })} placeholder="e.g. Confirm vendors" required /></Field>
          <div className="row">
            <input type="date" value={milestone.date} onChange={(e) => setMilestone({ ...milestone, date: e.target.value })} />
            <button className="btn btn-primary btn-sm">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Tasks ---------------- */
function Tasks({ id, tasks, staff, reload, push }) {
  const BLANK = { title: "", description: "", speciality: "", dueDate: "", assignedTo: "", day: "" };
  const [form, setForm] = useState(BLANK);
  const [filter, setFilter] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function create(e) {
    e.preventDefault();
    const body = { ...form, event: id };
    if (!body.assignedTo) delete body.assignedTo;
    await api.post("/tasks", body);
    setForm(BLANK);
    push("Task added");
    reload();
  }
  async function assign(taskId, assignedTo) { await api.patch(`/tasks/${taskId}/assign`, { assignedTo }); reload(); }
  async function status(taskId, s) { await api.patch(`/tasks/${taskId}/status`, { status: s }); reload(); }
  async function remove(taskId) { await api.del(`/tasks/${taskId}`); reload(); }

  const list = filter ? tasks.filter((t) => t.status === filter) : tasks;

  return (
    <div className="card-grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
      <div className="card">
        <div className="between mb">
          <h3 style={{ margin: 0 }}>Tasks</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="unassigned">Unassigned</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        {list.length === 0 ? <Empty emoji="✅" text="No tasks" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Task</th><th>Speciality</th><th>Assignee</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t._id}>
                    <td><b>{t.title}</b><div className="small muted">{t.dueDate}</div></td>
                    <td>{t.speciality || "—"}</td>
                    <td>
                      <select value={t.assignedTo?._id || ""} onChange={(e) => assign(t._id, e.target.value)}>
                        <option value="">Unassigned</option>
                        {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={t.status} onChange={(e) => status(t._id, e.target.value)}>
                        <option value="unassigned">Unassigned</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td><span className="btn btn-sm btn-danger" onClick={() => remove(t._id)}>✕</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card">
        <h3>Add Task</h3>
        <form onSubmit={create}>
          <Field label="Title"><input value={form.title} onChange={set("title")} required /></Field>
          <Field label="Speciality">
            <select value={form.speciality} onChange={set("speciality")}>
              <option value="">Any</option>
              <option>Catering</option><option>Seating</option><option>Logistics</option>
            </select>
          </Field>
          <Field label="Assign to">
            <select value={form.assignedTo} onChange={set("assignedTo")}>
              <option value="">Leave unassigned</option>
              {staff.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.speciality})</option>)}
            </select>
          </Field>
          <Field label="Due date"><input type="date" value={form.dueDate} onChange={set("dueDate")} /></Field>
          <button className="btn btn-primary btn-block">Add Task</button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Budget ---------------- */
const BLANK_EXPENSE = { category: "", description: "", amount: "", date: "" };

function BudgetTab({ id, data, reload, push }) {
  const [plannedTotal, setPlannedTotal] = useState("");
  const [categories, setCategories] = useState([]);
  const [expense, setExpense] = useState(BLANK_EXPENSE);
  const [editingId, setEditingId] = useState(null); // expense being edited (null = creating)

  useEffect(() => {
    if (data) {
      setPlannedTotal(data.budget.plannedTotal || "");
      setCategories(data.budget.categories?.length ? data.budget.categories : [{ name: "", plannedAmount: "" }]);
    }
  }, [data]);

  if (!data) return <Loading />;

  async function saveBudget(e) {
    e.preventDefault();
    await api.put(`/budget/event/${id}`, {
      plannedTotal: Number(plannedTotal) || 0,
      categories: categories.filter((c) => c.name).map((c) => ({ name: c.name, plannedAmount: Number(c.plannedAmount) || 0 })),
    });
    push("Budget saved");
    reload();
  }
  function removeCategory(i) {
    const next = categories.filter((_, idx) => idx !== i);
    setCategories(next.length ? next : [{ name: "", plannedAmount: "" }]);
  }

  // create OR edit an actual expense (FR: "create, edit ... records of actual expenses")
  async function submitExpense(e) {
    e.preventDefault();
    const body = { ...expense, amount: Number(expense.amount) || 0 };
    if (editingId) {
      await api.put(`/budget/expense/${editingId}`, body);
      push("Expense updated");
    } else {
      await api.post(`/budget/event/${id}/expense`, body);
      push("Expense recorded");
    }
    setExpense(BLANK_EXPENSE);
    setEditingId(null);
    reload();
  }
  function editExpense(ex) {
    setEditingId(ex._id);
    setExpense({ category: ex.category || "", description: ex.description || "", amount: ex.amount ?? "", date: ex.date || "" });
  }
  function cancelEdit() { setEditingId(null); setExpense(BLANK_EXPENSE); }
  async function delExpense(eid) {
    await api.del(`/budget/expense/${eid}`);
    if (editingId === eid) cancelEdit();
    reload();
  }

  const s = data.summary;
  // overall planned-vs-actual difference across the decomposition
  const totals = s.byCategory.reduce(
    (a, c) => ({ planned: a.planned + (c.planned || 0), actual: a.actual + (c.actual || 0), difference: a.difference + (c.difference || 0) }),
    { planned: 0, actual: 0, difference: 0 }
  );
  const diffColor = (n) => (n < 0 ? "var(--red)" : "var(--green)");

  return (
    <>
      <div className="stat-grid">
        <Stat icon="money" value={`$${s.plannedTotal}`} label="Planned Budget" accent />
        <Stat icon="money" value={`$${s.totalSpent}`} label="Actual Spent" />
        <Stat icon="percent" value={`$${s.remaining}`} label={s.remaining < 0 ? "Over Budget" : "Remaining"} />
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <h3>Planned Budget</h3>
          <form onSubmit={saveBudget}>
            <Field label="Total planned ($)"><input type="number" value={plannedTotal} onChange={(e) => setPlannedTotal(e.target.value)} /></Field>
            <label className="label">Categories (decomposition)</label>
            {categories.map((c, i) => (
              <div className="row mb" key={i}>
                <input placeholder="Category" value={c.name} onChange={(e) => setCategories(categories.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
                <input type="number" placeholder="$" value={c.plannedAmount} onChange={(e) => setCategories(categories.map((x, idx) => idx === i ? { ...x, plannedAmount: e.target.value } : x))} style={{ maxWidth: 110 }} />
                <button type="button" className="btn btn-sm btn-danger" title="Remove category" onClick={() => removeCategory(i)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline" onClick={() => setCategories([...categories, { name: "", plannedAmount: "" }])}>+ Category</button>
            <button className="btn btn-primary btn-block mt">Save Budget</button>
          </form>
          <div className="divider" />
          <h4>Planned vs Actual</h4>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Category</th><th>Planned</th><th>Actual</th><th>Diff</th></tr></thead>
              <tbody>
                {s.byCategory.length === 0 ? (
                  <tr><td colSpan={4} className="muted small">Add categories above to see the breakdown.</td></tr>
                ) : s.byCategory.map((c, i) => (
                  <tr key={i}><td>{c.name}</td><td>${c.planned}</td><td>${c.actual}</td><td style={{ color: diffColor(c.difference), fontWeight: 600 }}>${c.difference}</td></tr>
                ))}
              </tbody>
              {s.byCategory.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border-2)" }}>
                    <td><b>Total</b></td><td><b>${totals.planned}</b></td><td><b>${totals.actual}</b></td>
                    <td style={{ color: diffColor(totals.difference), fontWeight: 700 }}>${totals.difference}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Actual Expenses</h3>
          <form onSubmit={submitExpense}>
            <div className="form-grid">
              <Field label="Category"><input value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })} /></Field>
              <Field label="Amount ($)"><input type="number" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} required /></Field>
            </div>
            <Field label="Description"><input value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} /></Field>
            <Field label="Date"><input type="date" value={expense.date} onChange={(e) => setExpense({ ...expense, date: e.target.value })} /></Field>
            <div className="row">
              <button className="btn btn-primary" style={{ flex: 1 }}>{editingId ? "Update Expense" : "Record Expense"}</button>
              {editingId && <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>}
            </div>
          </form>
          <div className="divider" />
          {data.expenses.length === 0 ? <p className="muted small">No expenses yet.</p> : data.expenses.map((ex) => (
            <div className={`list-item ${editingId === ex._id ? "editing" : ""}`} key={ex._id} style={editingId === ex._id ? { background: "var(--accent-soft)", borderRadius: 8 } : undefined}>
              <div><b>${ex.amount}</b> · {ex.category}<div className="small muted">{ex.description} {ex.date}</div></div>
              <div className="row">
                <span className="btn btn-sm btn-outline" onClick={() => editExpense(ex)}>Edit</span>
                <span className="btn btn-sm btn-danger" onClick={() => delExpense(ex._id)}>✕</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------- Layout ---------------- */
function LayoutTab({ id, event, push }) {
  const [elements, setElements] = useState(event.layout?.elements || []);
  const [busy, setBusy] = useState(false);
  async function save() {
    await api.put(`/events/${id}/layout`, { elements });
    push("Layout saved & shared with the team");
  }
  async function doExport(kind) {
    if (busy) return;
    setBusy(true);
    try {
      const base = (event.name || "venue-layout").replace(/\s+/g, "-").toLowerCase();
      if (kind === "png") await exportLayoutPNG(elements, `${base}-layout.png`);
      else await exportLayoutPDF(elements, `${base}-layout.pdf`, `${event.name || "Venue"} — Floor Plan`);
      push(`Exported layout as ${kind.toUpperCase()}`);
    } catch {
      push("Could not export the layout");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="card">
      <div className="between mb">
        <h3 style={{ margin: 0 }}>Venue Layout Designer</h3>
        <div className="row wrap">
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => doExport("png")}>🖼 Export PNG</button>
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => doExport("pdf")}>📄 Export PDF</button>
          <button className="btn btn-primary btn-sm" onClick={save}>Save & Share</button>
        </div>
      </div>
      <LayoutDesigner key={id} value={elements} onChange={setElements} />
    </div>
  );
}

/* ---------------- Guests ---------------- */
function GuestsTab({ id, guests, reload, push }) {
  const [form, setForm] = useState({ name: "", email: "", dietaryPreference: "" });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  async function invite(e) {
    e.preventDefault();
    await api.post("/guests", { ...form, event: id });
    setForm({ name: "", email: "", dietaryPreference: "" });
    push("Invitation sent");
    reload();
  }
  async function setRsvp(gid, s) { await api.patch(`/guests/${gid}/rsvp`, { status: s }); reload(); }
  async function checkIn(gid, val) { await api.patch(`/guests/${gid}/checkin`, { checkedIn: val }); reload(); }
  async function remove(gid) { await api.del(`/guests/${gid}`); reload(); }

  const list = guests.filter((g) =>
    (!q || g.name.toLowerCase().includes(q.toLowerCase())) && (!status || g.status === status)
  );

  return (
    <div className="card-grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
      <div className="card">
        <div className="between mb">
          <h3 style={{ margin: 0 }}>Guests ({guests.length})</h3>
          <div className="row">
            <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All RSVP</option>
              <option value="invited">Invited</option>
              <option value="attending">Attending</option>
              <option value="maybe">Maybe</option>
              <option value="not-attending">Not attending</option>
            </select>
          </div>
        </div>
        {list.length === 0 ? <Empty emoji="🎟️" text="No guests" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>RSVP</th><th>Dietary</th><th>Checked in</th><th></th></tr></thead>
              <tbody>
                {list.map((g) => (
                  <tr key={g._id}>
                    <td><b>{g.name}</b><div className="small muted">{g.email}</div></td>
                    <td>
                      <select value={g.status} onChange={(e) => setRsvp(g._id, e.target.value)}>
                        <option value="invited">Invited</option>
                        <option value="attending">Attending</option>
                        <option value="maybe">Maybe</option>
                        <option value="not-attending">Not attending</option>
                      </select>
                    </td>
                    <td>{g.dietaryPreference || "—"}</td>
                    <td><input type="checkbox" checked={g.checkedIn} onChange={(e) => checkIn(g._id, e.target.checked)} /></td>
                    <td><span className="btn btn-sm btn-danger" onClick={() => remove(g._id)}>✕</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card">
        <h3>Send Invitation</h3>
        <form onSubmit={invite}>
          <Field label="Guest name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Dietary preference"><input value={form.dietaryPreference} onChange={(e) => setForm({ ...form, dietaryPreference: e.target.value })} /></Field>
          <button className="btn btn-primary btn-block">Send Invitation</button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Sourcing ---------------- */
function SourcingTab({ id, sourcing, vendors, invoices, reload, reloadInvoices, push }) {
  const [form, setForm] = useState({ vendor: "", itemName: "", quantity: "", deliveryDate: "", location: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function create(e) {
    e.preventDefault();
    await api.post("/sourcing", {
      event: id, vendor: form.vendor,
      items: [{ name: form.itemName, quantity: Number(form.quantity) || 1 }],
      deliveryDate: form.deliveryDate, location: form.location,
    });
    setForm({ vendor: "", itemName: "", quantity: "", deliveryDate: "", location: "" });
    push("Sourcing request sent");
    reload();
  }
  async function reviewInvoice(invId, status) {
    await api.patch(`/invoices/${invId}/review`, { status });
    push(`Invoice ${status}`);
    reloadInvoices();
  }

  return (
   <>
    <div className="card-grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
      <div className="card">
        <h3>Sourcing Requests</h3>
        {sourcing.length === 0 ? <Empty emoji="📦" text="No requests" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Vendor</th><th>Items</th><th>Status</th><th>Delivery</th></tr></thead>
              <tbody>
                {sourcing.map((r) => (
                  <tr key={r._id}>
                    <td>{r.vendor?.companyName || r.vendor?.name}</td>
                    <td>{r.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}</td>
                    <td><Badge value={r.status} /></td>
                    <td><Badge value={r.deliveryStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card">
        <h3>New Request</h3>
        <form onSubmit={create}>
          <Field label="Vendor">
            <select value={form.vendor} onChange={set("vendor")} required>
              <option value="">Select vendor</option>
              {vendors.map((v) => <option key={v._id} value={v._id}>{v.companyName || v.name}</option>)}
            </select>
          </Field>
          <Field label="Item"><input value={form.itemName} onChange={set("itemName")} required /></Field>
          <Field label="Quantity"><input type="number" value={form.quantity} onChange={set("quantity")} /></Field>
          <Field label="Delivery date"><input type="date" value={form.deliveryDate} onChange={set("deliveryDate")} /></Field>
          <Field label="Location"><input value={form.location} onChange={set("location")} /></Field>
          <button className="btn btn-primary btn-block">Send Request</button>
        </form>
      </div>
    </div>

    <div className="card mt">
      <h3>Vendor Invoices</h3>
      {invoices.length === 0 ? <Empty emoji="🧾" text="No invoices submitted for this event" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Vendor</th><th>Items</th><th>Amount</th><th>Status</th><th>Review</th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.vendor?.companyName || inv.vendor?.name}</td>
                  <td className="small">
                    {inv.items.map((i) => i.description).join(", ")}
                    {inv.attachmentUrl && <> · <a href={inv.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>attachment</a></>}
                  </td>
                  <td><b>${inv.amount}</b></td>
                  <td><Badge value={inv.status} /></td>
                  <td className="row">
                    <span className="btn btn-sm btn-success" onClick={() => reviewInvoice(inv._id, "approved")}>Approve</span>
                    <span className="btn btn-sm btn-danger" onClick={() => reviewInvoice(inv._id, "rejected")}>Reject</span>
                    <span className="btn btn-sm btn-outline" onClick={() => reviewInvoice(inv._id, "paid")}>Mark Paid</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
   </>
  );
}

/* ---------------- Day-of ---------------- */
function DayOfTab({ id, dayof, reload, push }) {
  const [msg, setMsg] = useState({ title: "", body: "" });
  const [comms, setComms] = useState([]);

  function loadComms() { api.get(`/notifications/event/${id}`).then(setComms); }
  useEffect(() => { loadComms(); }, [id]);

  if (!dayof) return <Loading />;

  async function send(e) {
    e.preventDefault();
    await api.post("/notifications", { event: id, type: "day-of", title: msg.title, body: msg.body });
    setMsg({ title: "", body: "" });
    push("Message sent to all guests");
    loadComms();
  }
  async function followUp() {
    const res = await api.post("/notifications/followup", { event: id, title: "Reminder", body: "Please check your earlier message." });
    push(`Follow-up sent to ${res.followUpSent} guest(s) who hadn't seen it`);
    loadComms();
  }

  const seenCount = comms.filter((c) => c.seen).length;

  return (
    <>
      <div className="stat-grid">
        <Stat icon="users" value={dayof.totalGuests} label="Total Guests" accent />
        <Stat icon="check" value={dayof.attending} label="Attending" />
        <Stat icon="door" value={dayof.arrivedGuests} label="Arrived / Checked-in" />
        <Stat icon="list" value={`${dayof.tasks.done}/${dayof.tasks.total}`} label="Tasks Done" />
      </div>
      <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <div className="between"><h3 style={{ margin: 0 }}>Vendor Arrivals</h3><button className="btn btn-sm btn-outline" onClick={reload}><Icon name="refresh" /></button></div>
          {dayof.vendors.length === 0 ? <p className="muted small mt">No vendors for this event.</p> : dayof.vendors.map((v) => (
            <div className="list-item" key={v.id}><span>{v.name}</span><Badge value={v.deliveryStatus} /></div>
          ))}
        </div>
        <div className="card">
          <h3>Send Day-of Communication</h3>
          <form onSubmit={send}>
            <Field label="Title"><input value={msg.title} onChange={(e) => setMsg({ ...msg, title: e.target.value })} required /></Field>
            <Field label="Message"><textarea value={msg.body} onChange={(e) => setMsg({ ...msg, body: e.target.value })} required /></Field>
            <div className="row">
              <button className="btn btn-primary">Send to all guests</button>
              <button type="button" className="btn btn-outline" onClick={followUp}>Follow-up unseen</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card mt">
        <div className="between mb">
          <h3 style={{ margin: 0 }}>Communication Log</h3>
          <span className="small muted">{seenCount}/{comms.length} seen</span>
        </div>
        {comms.length === 0 ? <Empty icon="bell" text="No messages sent yet" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Guest</th><th>Message</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {comms.map((c) => (
                  <tr key={c._id}>
                    <td><b>{c.guest?.name || "—"}</b></td>
                    <td className="small">{c.title}</td>
                    <td><Badge value={c.type} /></td>
                    <td>{c.seen ? <span className="badge green">Seen</span> : <span className="badge amber">Sent</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Feedback ---------------- */
function FeedbackTab({ id, feedback, trends, push }) {
  async function requestFeedback() {
    const res = await api.post("/feedback/request", { event: id });
    push(`Feedback request sent to ${res.requestsSent} guest(s)`);
  }
  return (
    <>
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Post-Event Feedback</h2>
        <button className="btn btn-primary" onClick={requestFeedback}>Request feedback from guests</button>
      </div>
      {trends && (
        <div className="stat-grid">
          <Stat icon="star" value={trends.averages.overall} label="Avg Overall" accent />
          <Stat icon="food" value={trends.averages.food} label="Food" />
          <Stat icon="venue" value={trends.averages.venue} label="Venue" />
          <Stat icon="target" value={trends.averages.organization} label="Organization" />
          <Stat icon="smile" value={trends.positive} label="Positive" />
          <Stat icon="frown" value={trends.negative} label="Negative" />
        </div>
      )}
      <div className="card">
        <h3>Responses ({feedback.length})</h3>
        {feedback.length === 0 ? <Empty emoji="⭐" text="No feedback yet" /> : feedback.map((f) => (
          <div className="list-item" key={f._id}>
            <div>
              <b>{f.guestName || "Guest"}</b> <Stars value={f.overall} /> <Badge value={f.sentiment} />
              <div className="small muted">{f.comments}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
