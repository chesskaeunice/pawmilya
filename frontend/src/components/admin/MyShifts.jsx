import { useEffect, useState } from "react";

import useFetch from "../../hooks/useFetch.js";
import { checkIn, checkOut, listMyShifts } from "../../services/shiftService.js";
import { formatApiError } from "../../services/authService.js";
import {
  formatClock,
  formatDay,
  formatShiftTime,
  SHIFT_STATUS_CLASS,
} from "../../utils/shiftFormat.js";

import "./Shifts.css";

// "My Shifts" on each staff dashboard: today's shifts (with Check In / Check Out) and the next 7 days.
// The server decides when a button works; this component only shows what it says.
function MyShifts() {
  const today = useFetch(() => listMyShifts("today"), []);
  const upcoming = useFetch(() => listMyShifts("upcoming"), []);

  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const reloadToday = today.reload;

  // The buttons depend on the clock, so look again every minute
  useEffect(() => {
    const timer = setInterval(reloadToday, 60000);
    return () => clearInterval(timer);
  }, [reloadToday]);

  const act = async (shift, action) => {
    if (busyId) return;

    setBusyId(shift.id);
    setError("");

    try {
      await action(shift.id);
    } catch (err) {
      setError(formatApiError(err).message);
    }

    today.reload();
    upcoming.reload();
    setBusyId(null);
  };

  const todayShifts = today.data ?? [];
  const upcomingShifts = upcoming.data ?? [];

  return (
    <section className="staff-detail-card shifts-card">

      <h2 className="staff-detail-card__title">
        My Shifts
      </h2>

      <div className="shifts-card__grid">

        <div>
          <h3>Today</h3>

          {todayShifts.length === 0 ? (
            <p className="shifts-empty">
              {today.loading ? "Loading..." : "You have no shifts today."}
            </p>
          ) : (
            <ul className="shifts-list">
              {todayShifts.map((shift) => (
                <li key={shift.id}>

                  <div className="shifts-list__main">
                    <strong>{shift.shiftName}</strong>
                    <span>{formatShiftTime(shift)}</span>
                    {shift.checkInTime && (
                      <span>
                        In {formatClock(shift.checkInTime)}
                        {shift.checkOutTime && ` · Out ${formatClock(shift.checkOutTime)}`}
                      </span>
                    )}
                  </div>

                  <div className="shifts-list__actions">
                    <span className={`staff-status ${SHIFT_STATUS_CLASS[shift.status]}`}>
                      {shift.status}
                    </span>

                    {!shift.checkInTime ? (
                      <button
                        type="button"
                        className="staff-button"
                        disabled={!shift.canCheckIn || busyId === shift.id}
                        onClick={() => act(shift, checkIn)}
                      >
                        Check In
                      </button>
                    ) : !shift.checkOutTime ? (
                      <button
                        type="button"
                        className="staff-button"
                        disabled={busyId === shift.id}
                        onClick={() => act(shift, checkOut)}
                      >
                        Check Out
                      </button>
                    ) : null}
                  </div>

                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="shifts-error" role="alert">
              {error}
            </p>
          )}
        </div>


        <div>
          <h3>Upcoming (next 7 days)</h3>

          {upcomingShifts.length === 0 ? (
            <p className="shifts-empty">
              {upcoming.loading ? "Loading..." : "No upcoming shifts."}
            </p>
          ) : (
            <ul className="shifts-list">
              {upcomingShifts.map((shift) => (
                <li key={shift.id}>

                  <div className="shifts-list__main">
                    <strong>
                      {formatDay(shift.assignedDate)} · {shift.shiftName}
                    </strong>
                    <span>{formatShiftTime(shift)}</span>
                  </div>

                  <span className={`staff-status ${SHIFT_STATUS_CLASS[shift.status]}`}>
                    {shift.status}
                  </span>

                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

    </section>
  );
}

export default MyShifts;
