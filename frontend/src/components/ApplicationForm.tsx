import { useState, FormEvent } from "react";
import { Application, ApplicationInput } from "../types";

const CHANNELS = [
  "Career Page",
  "Email",
  "LinkedIn",
  "Referral",
  "Job Portal",
  "Other",
];

const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "No Response"];

const empty: ApplicationInput = {
  company: "",
  date_applied: new Date().toISOString().slice(0, 10),
  cv_version: "",
  cv_link: "",
  jd_text: "",
  jd_link: "",
  channel: "Career Page",
  status: "Applied" as Application["status"],
  notes: "",
};

export default function ApplicationForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Application;
  onSave: (data: ApplicationInput) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ApplicationInput>(
    initial
      ? {
          company: initial.company,
          date_applied: initial.date_applied.slice(0, 10),
          cv_version: initial.cv_version || "",
          cv_link: initial.cv_link || "",
          jd_text: initial.jd_text || "",
          jd_link: initial.jd_link || "",
          channel: initial.channel || "Career Page",
          status: initial.status,
          notes: initial.notes || "",
        }
      : empty
  );
  const [saving, setSaving] = useState(false);

  function update<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="specimen-id">
          {initial ? `ENTRY · #${String(initial.id).padStart(3, "0")}` : "NEW ENTRY"}
        </div>
        <h2>{initial ? "Edit application" : "Log a new application"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field field-full">
              <label>Company</label>
              <input
                required
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="e.g. NHSRC"
              />
            </div>

            <div className="field">
              <label>Date applied</label>
              <input
                required
                type="date"
                value={form.date_applied}
                onChange={(e) => update("date_applied", e.target.value)}
              />
            </div>

            <div className="field">
              <label>Applied via</label>
              <select
                value={form.channel || ""}
                onChange={(e) => update("channel", e.target.value)}
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Tailored CV used</label>
              <input
                value={form.cv_version || ""}
                onChange={(e) => update("cv_version", e.target.value)}
                placeholder="e.g. CV_NHSRC_HealthInformatics_v2"
              />
            </div>

            <div className="field">
              <label>Link to that CV (optional)</label>
              <input
                value={form.cv_link || ""}
                onChange={(e) => update("cv_link", e.target.value)}
                placeholder="Drive / portfolio link"
              />
            </div>

            <div className="field field-full">
              <label>Job description (paste text)</label>
              <textarea
                value={form.jd_text || ""}
                onChange={(e) => update("jd_text", e.target.value)}
                placeholder="Paste the JD here for future reference"
              />
            </div>

            <div className="field">
              <label>Link to JD posting (optional)</label>
              <input
                value={form.jd_link || ""}
                onChange={(e) => update("jd_link", e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div className="field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as Application["status"])}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="field field-full">
              <label>Notes (optional)</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Contact person, follow-up date, anything else"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : initial ? "Save changes" : "Add entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
