import { useEffect, useMemo, useState } from "react";
import Login from "./components/Login";
import ApplicationTable from "./components/ApplicationTable";
import ApplicationForm from "./components/ApplicationForm";
import { api, isLoggedIn, logout } from "./api";
import { Application, ApplicationInput } from "./types";

export default function App() {
  const [authed, setAuthed] = useState(isLoggedIn());
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Application | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await api.list();
      setRows(data);
    } catch (err) {
      setError("Could not load applications. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: ApplicationInput) {
    if (editing) {
      await api.update(editing.id, data);
    } else {
      await api.create(data);
    }
    setShowForm(false);
    setEditing(undefined);
    refresh();
  }

  async function handleDelete(app: Application) {
    if (!confirm(`Delete the entry for ${app.company}? This can't be undone.`)) return;
    await api.remove(app.id);
    refresh();
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        !search ||
        r.company.toLowerCase().includes(search.toLowerCase()) ||
        (r.cv_version || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const stats = useMemo(() => {
    const total = rows.length;
    const interview = rows.filter((r) => r.status === "Interview").length;
    const offer = rows.filter((r) => r.status === "Offer").length;
    const rejected = rows.filter((r) => r.status === "Rejected").length;
    return { total, interview, offer, rejected };
  }, [rows]);

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="title-block">
          <div className="specimen-id">TRACKER-01 · APPLICATION LOG</div>
          <h1>Job Application Tracker</h1>
          <div className="subtitle">Every CV, every JD, every channel — in one place.</div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout();
              setAuthed(false);
            }}
          >
            Log out
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
          >
            + Add application
          </button>
        </div>
      </header>

      <div className="stats-strip">
        <div className="stat-chip">
          <div className="stat-num">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-chip">
          <div className="stat-num">{stats.interview}</div>
          <div className="stat-label">Interview</div>
        </div>
        <div className="stat-chip">
          <div className="stat-num">{stats.offer}</div>
          <div className="stat-label">Offer</div>
        </div>
        <div className="stat-chip">
          <div className="stat-num">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="filters-row">
        <input
          className="search-input"
          placeholder="Search by company or CV version…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {["All", "Applied", "Interview", "Offer", "Rejected", "No Response"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : (
        <ApplicationTable
          rows={filtered}
          onEdit={(app) => {
            setEditing(app);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <ApplicationForm
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
        />
      )}
    </div>
  );
}
