import { Link } from "react-router-dom";

import useFetch from "../../hooks/useFetch.js";
import { getScheduleMeta, getTodayOverview } from "../../services/shiftService.js";
import { ROLE_LABELS } from "../../config/rolePermissions.js";
import { formatClock, formatShiftTime, SHIFT_STATUS_CLASS } from "../../utils/shiftFormat.js";

import "./Shifts.css";

// Kennel manager dashboard: everyone on duty today, who has checked in, and the coverage of each shift
function OnDutyToday() {
  const overview = useFetch(() => getTodayOverview(), []);
  const meta = useFetch(() => getScheduleMeta(), []);

  const assignments = overview.data?.data ?? [];
  const coverage = overview.data?.coverage ?? [];
  const shifts = meta.data?.shifts ?? [];

  return (
    <section className="staff-detail-card shifts-card">

      <div className="schedule__group-head">
        <h2 className="staff-detail-card__title">
          On Duty Today
        </h2>

        <Link to="/admin/staff-schedule" className="staff-button">
          Manage Schedule
        </Link>
      </div>

      <div className="shifts-card__grid">

        <div>
          <h3>Staff on duty</h3>

          {assignments.length === 0 ? (
            <p className="shifts-empty">
              {overview.loading ? "Loading..." : "Nobody is scheduled today."}
            </p>
          ) : (
            <ul className="shifts-list">
              {assignments.map((item) => (
                <li key={item.id}>

                  <div className="shifts-list__main">
                    <strong>{item.userName}</strong>
                    <span>
                      {ROLE_LABELS[item.userRole]} · {item.shiftName} ({formatShiftTime(item)})
                    </span>
                    <span>
                      {item.checkInTime
                        ? `Checked in ${formatClock(item.checkInTime)}${item.checkOutTime ? ` · out ${formatClock(item.checkOutTime)}` : ""}`
                        : "Not checked in yet"}
                    </span>
                  </div>

                  <span className={`staff-status ${SHIFT_STATUS_CLASS[item.status]}`}>
                    {item.status}
                  </span>

                </li>
              ))}
            </ul>
          )}
        </div>


        <div>
          <h3>Coverage</h3>

          <ul className="shifts-list">
            {coverage.map((row) => {
              const shift = shifts.find((item) => item.id === row.shiftId);

              return (
                <li key={row.shiftId}>

                  <div className="shifts-list__main">
                    <strong>{shift?.name ?? `Shift ${row.shiftId}`}</strong>
                    {!row.complete && (
                      <span>
                        Missing: {row.missing.map((role) => ROLE_LABELS[role]).join(", ")}
                      </span>
                    )}
                  </div>

                  <span className={`shifts-coverage ${row.complete ? "shifts-coverage--ok" : "shifts-coverage--missing"}`}>
                    {row.complete ? "Covered" : "Not covered"}
                  </span>

                </li>
              );
            })}
          </ul>
        </div>

      </div>

    </section>
  );
}

export default OnDutyToday;
