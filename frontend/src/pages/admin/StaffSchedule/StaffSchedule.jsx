import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import useFetch from "../../../hooks/useFetch.js";
import {
  assignShift,
  changeAssignmentStatus,
  getAssignments,
  getScheduleMeta,
  removeAssignment,
} from "../../../services/shiftService.js";
import { formatApiError } from "../../../services/authService.js";
import { ROLE_LABELS } from "../../../config/rolePermissions.js";
import {
  formatClock,
  formatDay,
  formatShiftTime,
  toISODate,
} from "../../../utils/shiftFormat.js";

import "../../../components/admin/Shifts.css";
import BackButton from "../../../components/common/BackButton.jsx";

const NONE = [];
const STATUSES = ["pending", "active", "completed"];

const addDays = (iso, days) => {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

// Kennel manager: assign staff to shifts, see coverage, change status, remove (soft), staff directory
function StaffSchedule() {
  const todayISO = toISODate(new Date());

  // the one day that is shown: assignments, coverage and warnings are for this day only
  const [day, setDay] = useState(todayISO);

  const meta = useFetch(() => getScheduleMeta(), []);
  const schedule = useFetch(() => getAssignments({ from: day, to: day }), [day]);

  const [form, setForm] = useState({ user_id: "", shift_id: "", assigned_date: todayISO });
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const shifts = meta.data?.shifts ?? [];
  const staff = meta.data?.staff ?? [];
  const assignments = schedule.data?.data ?? NONE;
  const coverage = schedule.data?.coverage ?? [];

  const coverageFor = (date, shiftId) =>
    coverage.find((row) => row.date === date && row.shiftId === shiftId);

  // the chosen day's assignments, by shift
  const byShift = {};
  assignments.forEach((item) => {
    (byShift[item.shiftId] ??= []).push(item);
  });

  // an invalid or empty date (while typing) keeps the day that is shown
  const chooseDay = (value) => value && setDay(value);

  const missingText = (row) =>
    row.missing.map((role) => ROLE_LABELS[role]).join(" and ");

  // Warning after assigning or removing that leaves a shift without the required roles
  const coverageNotice = (message, row) =>
    row.complete
      ? { type: "ok", text: `${message} All required roles are covered.` }
      : { type: "warning", text: `${message} Warning: this shift still needs ${missingText(row)}.` };

  const handleAssign = async (event) => {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setNotice(null);

    try {
      const result = await assignShift({
        user_id: Number(form.user_id),
        shift_id: Number(form.shift_id),
        assigned_date: form.assigned_date,
      });

      setNotice(coverageNotice("Shift assigned.", result.coverage));

      // show the day that was just assigned
      if (form.assigned_date === day) schedule.reload();
      else setDay(form.assigned_date);
    } catch (error) {
      const { message, fields } = formatApiError(error);
      setNotice({ type: "error", text: Object.values(fields)[0] || message });
    }

    setBusy(false);
  };

  const handleStatus = async (item, status) => {
    try {
      await changeAssignmentStatus(item.id, status);
      setNotice(null);
    } catch (error) {
      setNotice({ type: "error", text: formatApiError(error).message });
    }

    schedule.reload();
  };

  const handleRemove = async (item) => {
    const confirmed = window.confirm(
      `Remove ${item.userName} from the ${item.shiftName} shift on ${formatDay(item.assignedDate)}?`
    );

    if (!confirmed || busy) return;

    setBusy(true);

    try {
      const result = await removeAssignment(item.id);
      setNotice(coverageNotice("Assignment removed.", result.coverage));
    } catch (error) {
      setNotice({ type: "error", text: formatApiError(error).message });
    }

    schedule.reload();
    setBusy(false);
  };

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  // Staff directory and the select are grouped by role
  const staffByRole = staff.reduce((groups, person) => {
    (groups[person.role] ??= []).push(person);
    return groups;
  }, {});

  return (
    <div className="staff-page">
      <BackButton fallback="/admin/dashboard" />


      <div className="staff-page__top">
        <div>
          <h1 className="staff-page__title">
            Staff Schedule
          </h1>

          <p className="staff-page__subtitle">
            Assign staff to shifts. Every shift needs{" "}
            {(meta.data?.requiredRoles ?? []).map((role) => ROLE_LABELS[role]).join(" and ") || "its required roles"}.
          </p>
        </div>
      </div>


      {/* ASSIGN */}

      <section className="staff-detail-card">

        <h2 className="staff-detail-card__title">
          Assign Shift
        </h2>

        <form className="schedule__form" onSubmit={handleAssign}>

          <label>
            Staff member
            <select value={form.user_id} onChange={setField("user_id")} required>
              <option value="">Choose staff member</option>

              {Object.entries(staffByRole).map(([role, people]) => (
                <optgroup key={role} label={ROLE_LABELS[role]}>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label>
            Shift
            <select value={form.shift_id} onChange={setField("shift_id")} required>
              <option value="">Choose shift</option>

              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({formatShiftTime(shift)})
                </option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              min={todayISO}
              value={form.assigned_date}
              onChange={setField("assigned_date")}
              required
            />
          </label>

          <span />

          <button type="submit" className="staff-button" disabled={busy}>
            Assign Shift
          </button>

        </form>

        {notice && (
          <p className={`schedule__notice schedule__notice--${notice.type}`} role="status">
            {notice.text}
          </p>
        )}

      </section>


      {/* COVERAGE OVERVIEW */}

      <section className="staff-detail-card shifts-card">

        <div className="schedule__group-head">
          <h2 className="staff-detail-card__title">
            Coverage
          </h2>

          <div className="shifts-list__actions">
            <button
              type="button"
              className="staff-button staff-button--outline"
              onClick={() => setDay(addDays(day, -1))}
              aria-label="Previous day"
            >
              <ChevronLeft size={14} />
            </button>

            <input
              type="date"
              className="schedule__day"
              value={day}
              onChange={(event) => chooseDay(event.target.value)}
              aria-label="Day shown"
            />

            <button
              type="button"
              className="staff-button staff-button--outline"
              onClick={() => setDay(addDays(day, 1))}
              aria-label="Next day"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="staff-table-card">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Date</th>
                {shifts.map((shift) => (
                  <th key={shift.id}>{shift.name}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{formatDay(day)}</td>

                {shifts.map((shift) => {
                  const row = coverageFor(day, shift.id);

                  return (
                    <td key={shift.id}>
                      {row && (
                        <span
                          className={`shifts-coverage ${row.complete ? "shifts-coverage--ok" : "shifts-coverage--missing"}`}
                          title={row.complete ? "Covered" : `Missing: ${missingText(row)}`}
                        >
                          {row.complete ? "✓ Covered" : `✗ ${missingText(row)}`}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

      </section>


      <div className="schedule__layout shifts-card">

        {/* ASSIGNMENTS OF THE CHOSEN DAY, BY SHIFT */}

        <section className="staff-detail-card">

          <h2 className="staff-detail-card__title">
            Assignments · {formatDay(day)}
          </h2>

          {schedule.loading && assignments.length === 0 && (
            <p className="shifts-empty">Loading...</p>
          )}

          {!schedule.loading && assignments.length === 0 && (
            <p className="shifts-empty">No assignments on this day.</p>
          )}

          {shifts
            .filter((shift) => byShift[shift.id])
            .map((shift) => {
              const row = coverageFor(day, shift.id);

              return (
                <div key={shift.id} className="schedule__group">

                  <div className="schedule__group-head">
                    <strong>
                      {shift.name} · {formatShiftTime(shift)}
                    </strong>

                    {row && (
                      <span className={`shifts-coverage ${row.complete ? "shifts-coverage--ok" : "shifts-coverage--missing"}`}>
                        {row.complete ? "Covered" : `Needs ${missingText(row)}`}
                      </span>
                    )}
                  </div>

                  <ul className="shifts-list">
                    {byShift[shift.id].map((item) => (
                      <li key={item.id}>

                        <div className="shifts-list__main">
                          <strong>{item.userName}</strong>
                          <span>
                            {ROLE_LABELS[item.userRole]}
                            {item.checkInTime && ` · in ${formatClock(item.checkInTime)}`}
                            {item.checkOutTime && ` · out ${formatClock(item.checkOutTime)}`}
                          </span>
                        </div>

                        <div className="shifts-list__actions">
                          <select
                            value={item.status}
                            onChange={(event) => handleStatus(item, event.target.value)}
                            aria-label={`Status for ${item.userName}`}
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className="schedule__remove"
                            onClick={() => handleRemove(item)}
                          >
                            Remove
                          </button>
                        </div>

                      </li>
                    ))}
                  </ul>

                </div>
              );
                  })}

        </section>


        {/* STAFF DIRECTORY */}

        <section className="staff-detail-card">

          <h2 className="staff-detail-card__title">
            Staff Directory
          </h2>

          <ul className="shifts-list schedule__directory">
            {staff.map((person) => (
              <li key={person.id}>
                <div className="shifts-list__main">
                  <strong>{person.name}</strong>
                  <span>{ROLE_LABELS[person.role]}</span>
                  <span>{person.email}</span>
                </div>
              </li>
            ))}
          </ul>

        </section>

      </div>

    </div>
  );
}

export default StaffSchedule;
