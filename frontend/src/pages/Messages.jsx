import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import { PageHeader, Loading, Empty, Field } from "../components/ui";

export default function Messages() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState(null);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => { api.get("/messages/contacts").then(setContacts); }, []);

  function openThread(c) {
    setActive(c);
    api.get(`/messages/thread/${c._id}`).then(setThread);
  }
  async function send(e) {
    e.preventDefault();
    await api.post("/messages", { to: active._id, text });
    setText("");
    api.get(`/messages/thread/${active._id}`).then(setThread);
  }

  if (!contacts) return <Loading />;

  return (
    <>
      <PageHeader title="Messages" subtitle="In-platform conversations" />
      <div className="card-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <div className="card">
          <h3>Contacts</h3>
          {contacts.length === 0 ? <Empty emoji="💬" text="No contacts" /> : contacts.map((c) => (
            <div key={c._id} className={`list-item ${active?._id === c._id ? "" : ""}`} style={{ cursor: "pointer" }} onClick={() => openThread(c)}>
              <div><b>{c.companyName || c.name}</b><div className="small muted">{c.role}</div></div>
              <span className="btn btn-sm btn-outline">Open</span>
            </div>
          ))}
        </div>
        <div className="card">
          {!active ? <Empty emoji="✉️" text="Select a contact to chat" /> : (
            <>
              <h3>{active.companyName || active.name}</h3>
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {thread.length === 0 && <p className="muted small">No messages yet. Say hello!</p>}
                {thread.map((m) => {
                  const mine = (m.from._id || m.from) === user._id;
                  return (
                    <div key={m._id} style={{ textAlign: mine ? "right" : "left", margin: "8px 0" }}>
                      <span style={{ display: "inline-block", background: mine ? "var(--accent)" : "var(--cream)", color: mine ? "#fff" : "var(--text)", padding: "8px 12px", borderRadius: 12, maxWidth: "75%" }}>
                        {m.text}
                      </span>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={send} className="mt">
                <Field label="Message"><input value={text} onChange={(e) => setText(e.target.value)} required /></Field>
                <button className="btn btn-primary btn-block">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
