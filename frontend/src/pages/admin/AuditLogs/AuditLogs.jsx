import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import useFetch from "../../../hooks/useFetch.js";
import { listAuditLogs } from "../../../services/adminService.js";
import { ROLE_LABELS } from "../../../config/rolePermissions.js";
import BackButton from "../../../components/common/BackButton.jsx";

// Filters by what the entry is about (the action starts with it, for example "animal.created")
const AREAS = [
  { value: "", label: "All areas" },
  { value: "animal", label: "Animals" },
  { value: "application", label: "Adoption applications" },
  { value: "missing_pet", label: "Missing pets" },
  { value: "vaccination", label: "Vaccinations" },
  { value: "user", label: "User accounts" },
  { value: "shift", label: "Shifts" },
];

const formatTimestamp = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// Short text for the details column
const summarize = (details) =>
  details
    ? Object.entries(details)
        .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
        .join(" · ")
    : "";

// Kennel manager only: read-only trail of who did what
function AuditLogs() {
  const [area, setArea] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, loading } = useFetch(
    () =>
      listAuditLogs({
        action: area || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
      }),
    [area, from, to, page]
  );

  const logs = data?.data ?? [];
  const meta = data?.meta;

  // a changed filter goes back to page 1
  const withReset = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <div className="staff-page">
      <BackButton fallback="/admin/dashboard" />


      <div className="staff-page__top">
        <div>
          <h1 className="staff-page__title">
            Audit Logs
          </h1>

          <p className="staff-page__subtitle">
            A record of who changed what in the system.
          </p>
        </div>
      </div>


      <div className="staff-filters">

        <select value={area} onChange={withReset(setArea)} aria-label="Area">
          {AREAS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input type="date" value={from} onChange={withReset(setFrom)} aria-label="From date" />
        <input type="date" value={to} onChange={withReset(setTo)} aria-label="To date" />

      </div>


      <div className="staff-table-card">

        <table className="staff-table">

          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Action</th>
              <th>About</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>

            {logs.map((log) => (
              <tr key={log.id}>
                <td>{formatTimestamp(log.createdAt)}</td>

                <td>
                  {log.user ? (
                    <>
                      <strong>{log.user.name}</strong>
                      <br />
                      <small>{ROLE_LABELS[log.user.role] ?? log.user.role}</small>
                    </>
                  ) : (
                    "Guest"
                  )}
                </td>

                <td>{log.action}</td>

                <td>
                  {log.entityType ? `${log.entityType} #${log.entityId}` : "-"}
                </td>

                <td>
                  <small>{summarize(log.details)}</small>
                </td>
              </tr>
            ))}

            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={5}>No entries found.</td>
              </tr>
            )}

          </tbody>

        </table>


        <div className="staff-pagination">

          <span>
            {meta ? `${meta.total} entries` : "Loading..."}
          </span>

          <div className="staff-pagination__pages">

            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={12} />
            </button>

            <button type="button" className="active">
              {page} / {meta?.last_page ?? 1}
            </button>

            <button
              type="button"
              disabled={page >= (meta?.last_page ?? 1)}
              onClick={() => setPage(page + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={12} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AuditLogs;
