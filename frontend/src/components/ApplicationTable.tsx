import { Application } from "../types";

function statusClass(status: string) {
  return `status-tag status-${status.replace(/\s+/g, "")}`;
}

export default function ApplicationTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Application[];
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="log-table-wrap">
        <div className="empty-state">
          <div className="specimen-id">LOG EMPTY</div>
          <div>No applications logged yet. Add your first entry to start tracking.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="log-table-wrap">
      <table className="log-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Date applied</th>
            <th>Tailored CV</th>
            <th>Job description</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((app) => (
            <tr key={app.id}>
              <td className="row-id">#{String(app.id).padStart(3, "0")}</td>
              <td className="company-cell">
                <span className="company-name">{app.company}</span>
                {app.channel && <span className="channel-tag">{app.channel}</span>}
              </td>
              <td className="date-cell">{app.date_applied.slice(0, 10)}</td>
              <td className="cv-cell">
                {app.cv_version && <span className="cv-name">{app.cv_version}</span>}
                {app.cv_link && (
                  <a href={app.cv_link} target="_blank" rel="noreferrer">
                    Open CV →
                  </a>
                )}
              </td>
              <td className="jd-cell">
                {app.jd_text && <span className="jd-snippet">{app.jd_text}</span>}
                {app.jd_link && (
                  <a href={app.jd_link} target="_blank" rel="noreferrer">
                    Open JD →
                  </a>
                )}
              </td>
              <td>
                <span className={statusClass(app.status)}>{app.status}</span>
              </td>
              <td>
                <div className="row-actions">
                  <button onClick={() => onEdit(app)}>Edit</button>
                  <button onClick={() => onDelete(app)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
