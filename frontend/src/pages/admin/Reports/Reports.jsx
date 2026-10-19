import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Cat,
  Dog,
  Download,
  Heart,
  PawPrint,
  Search,
  Syringe,
  X,
} from "lucide-react";

import pets from "../../../data/pets.js";
import applications from "../../../data/applications.js";
import missingPets from "../../../data/missingPets.js";
import initialVaccinations from "../../../data/vaccinations.js";

import "./Reports.css";

/* ---------- vaccination date + status helpers (kept in this file) ---------- */

const pad = (n) => String(n).padStart(2, "0");

const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseDate = (value) => {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (iso) => {
  const d = parseDate(iso);

  return d
    ? d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "To be set";
};

/* whole days from today to the given date (negative = in the past) */
const daysFromToday = (iso) => {
  const target = parseDate(iso);
  if (!target) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.round((target - today) / 86400000);
};

const getStatus = (nextISO) => {
  const days = daysFromToday(nextISO);

  if (days === null) return "Up to date";
  if (days < 0) return "Overdue";
  if (days <= 30) return "Due Soon";
  return "Up to date";
};

const addDays = (iso, days) => {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
};

/* days until the next dose, per vaccine (default 365) */
const INTERVALS = {
  Bordetella: 180,
  "Canine Influenza": 365,
  Leptospirosis: 365,
};

const nextDueFor = (vaccine, givenISO) =>
  addDays(givenISO, INTERVALS[vaccine] ?? 365);

/* ISO dates + computed status, whatever format the data file uses */
const normalizeVaccination = (record) => {
  const date = toISO(parseDate(record.date) ?? new Date());
  const parsedNext = parseDate(record.nextDue);
  const nextDue = parsedNext ? toISO(parsedNext) : null;

  return { ...record, date, nextDue, status: getStatus(nextDue) };
};

/* Session store: keeps vaccination records (and anything logged from the
   Needs Attention list) when you switch between report tabs. */
let vaccinationRecords = initialVaccinations.map(normalizeVaccination);

const vaccinationListeners = new Set();

const subscribeToVaccinations = (listener) => {
  vaccinationListeners.add(listener);
  return () => vaccinationListeners.delete(listener);
};

const getVaccinations = () => vaccinationRecords;

const setVaccinations = (next) => {
  vaccinationRecords =
    typeof next === "function" ? next(vaccinationRecords) : next;

  vaccinationListeners.forEach((listener) => listener());
};

function useVaccinations() {
  const records = useSyncExternalStore(subscribeToVaccinations, getVaccinations);
  return [records, setVaccinations];
}

/* ---------- tabs + role access (from the RBAC matrix) ---------- */

const TABS = [
  { id: "animals", label: "Animals", icon: PawPrint },
  { id: "adoptions", label: "Adoptions", icon: Heart },
  { id: "missing", label: "Missing Pets", icon: Search },
  { id: "vaccinations", label: "Vaccinations", icon: Syringe },
];

const ROLE_TABS = {
  kennel_manager: ["animals", "adoptions", "missing", "vaccinations"],
  adoption_counselor: ["animals", "adoptions", "missing"],
  vet_tech: ["animals", "vaccinations"],
  pound_staff: [],
};

/* ---------- small helpers ---------- */

const STATUS_COLORS = {
  "Up to date": "#8aa96b",
  "Due Soon": "#e7b04f",
  Overdue: "#c4533f",
};

const PALETTE = ["#d69a3a", "#9d6328", "#f0d59f", "#8b5b31", "#bd7934", "#e7b04f"];

const PILL_CLASS = {
  "Up to date": "staff-status--current",
  "Due Soon": "staff-status--due",
  Overdue: "staff-status--overdue",
  Pending: "staff-status--pending",
  Approved: "staff-status--current",
  Rejected: "staff-status--overdue",
  Active: "staff-status--pending",
  Reunited: "staff-status--current",
};

const pillClass = (status) => PILL_CLASS[status] || "staff-status--current";

const countBy = (items, getKey) => {
  const map = new Map();

  items.forEach((item) => {
    const key = getKey(item) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  });

  return [...map]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

const withColors = (rows) =>
  rows.map((row, i) => ({ ...row, color: row.color || PALETTE[i % PALETTE.length] }));

const countOf = (rows, label) => rows.find((r) => r.label === label)?.value ?? 0;

/* ---------- main page ---------- */

function Reports({ role = "kennel_manager" }) {
  const allowedTabs = ROLE_TABS[role] ?? [];
  const tabs = TABS.filter((tab) => allowedTabs.includes(tab.id));

  const [activeTab, setActiveTab] = useState(
    role === "vet_tech" ? "vaccinations" : tabs[0]?.id
  );

  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <h1 className="staff-page__title">Reports</h1>

          <p className="staff-page__subtitle">
            Analyze Pawmilya&apos;s animal welfare data and track key metrics.
          </p>
        </div>
      </div>

      {tabs.length === 0 ? (
        <p className="reports__empty">
          Your role doesn&apos;t have access to reports.
        </p>
      ) : (
        <>
          <div className="reports__tabs" role="tablist">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`reports-tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`reports-panel-${id}`}
                className={`reports__tab ${
                  activeTab === id ? "reports__tab--active" : ""
                }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`reports-panel-${activeTab}`}
            aria-labelledby={`reports-tab-${activeTab}`}
          >
            {activeTab === "animals" && <AnimalsReport />}
            {activeTab === "adoptions" && <AdoptionsReport />}
            {activeTab === "missing" && <MissingReport />}
            {activeTab === "vaccinations" && <VaccinationsReport />}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Vaccinations tab ---------- */

const todayISO = () => toISO(new Date());

const plusDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
};

/* "Date given" ranges look at when the vaccine was given;
   "Next due" ranges look at when the next dose is due (for planning batches). */
const matchesRange = (record, range) => {
  const today = todayISO();

  switch (range) {
    case "given30":
      return record.date >= plusDays(-30);
    case "given90":
      return record.date >= plusDays(-90);
    case "year":
      return record.date >= `${today.slice(0, 4)}-01-01`;
    case "dueMonth":
      return !!record.nextDue && record.nextDue.startsWith(today.slice(0, 7));
    case "due7":
      return !!record.nextDue && record.nextDue >= today && record.nextDue <= plusDays(7);
    case "due30":
      return !!record.nextDue && record.nextDue >= today && record.nextDue <= plusDays(30);
    default:
      return true;
  }
};

function VaccinationsReport() {
  const navigate = useNavigate();

  const [records, setRecords] = useVaccinations();

  const [range, setRange] = useState("all");
  const [type, setType] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [logging, setLogging] = useState(null);
  const [toast, setToast] = useState("");

  /* auto-dismiss toast */
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  /* Esc closes the Log Vaccine dialog */
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") setLogging(null);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const petTypes = useMemo(
    () => [...new Set(records.map((r) => r.petType))].sort(),
    [records]
  );

  /* records after the range + animal-type filters */
  const filtered = useMemo(
    () =>
      records.filter(
        (r) => matchesRange(r, range) && (type === "all" || r.petType === type)
      ),
    [records, range, type]
  );

  const total = filtered.length;
  const upToDate = filtered.filter((r) => r.status === "Up to date").length;
  const dueSoon = filtered.filter((r) => r.status === "Due Soon").length;
  const overdue = filtered.filter((r) => r.status === "Overdue").length;
  const compliance = total ? Math.round((upToDate / total) * 100) : 0;

  const statusSegments = [
    { label: "Up to date", value: upToDate, color: STATUS_COLORS["Up to date"] },
    { label: "Due Soon", value: dueSoon, color: STATUS_COLORS["Due Soon"] },
    { label: "Overdue", value: overdue, color: STATUS_COLORS.Overdue },
  ];

  /* top vaccines given; the long tail is grouped */
  const byVaccine = useMemo(() => {
    const rows = countBy(filtered, (r) => r.vaccine);
    const top = rows.slice(0, 5);
    const rest = rows.slice(5).reduce((sum, r) => sum + r.value, 0);

    return rest ? [...top, { label: "Others", value: rest }] : top;
  }, [filtered]);

  const coverage = useMemo(
    () =>
      petTypes
        .map((t) => {
          const group = filtered.filter((r) => r.petType === t);
          const ok = group.filter((r) => r.status === "Up to date").length;

          return {
            label: t,
            total: group.length,
            pct: group.length ? Math.round((ok / group.length) * 100) : 0,
          };
        })
        .filter((row) => row.total > 0),
    [filtered, petTypes]
  );

  /* 4 months back, this month, 3 ahead: given vs. coming due */
  const months = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 8 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      return {
        key,
        label: d.toLocaleDateString("en-US", { month: "short" }),
        given: filtered.filter((r) => r.date.startsWith(key)).length,
        due: filtered.filter((r) => r.nextDue && r.nextDue.startsWith(key)).length,
      };
    });
  }, [filtered]);

  const monthMax = Math.max(1, ...months.flatMap((m) => [m.given, m.due]));

  /* overdue first (oldest due date), then due soon */
  const attention = useMemo(
    () =>
      filtered
        .filter((r) => r.status !== "Up to date")
        .sort((a, b) => (a.nextDue || "").localeCompare(b.nextDue || "")),
    [filtered]
  );

  const visibleAttention = showAll ? attention : attention.slice(0, 6);

  /* ----- drill-down to the main Vaccinations page ----- */

  const goToVaccinations = (status) => {
    const params = new URLSearchParams();

    if (status) params.set("status", status);
    if (type !== "all") params.set("type", type);

    const query = params.toString();
    navigate(`/admin/vaccinations${query ? `?${query}` : ""}`);
  };

  /* ----- quick "Log Vaccine" action ----- */

  const openLog = (record) => {
    const today = todayISO();

    setLogging({
      id: record.id,
      petName: record.petName,
      vaccine: record.vaccine,
      date: today,
      nextDue: nextDueFor(record.vaccine, today),
      touchedNextDue: false,
      error: "",
    });
  };

  const changeLogDate = (date) => {
    setLogging((current) => ({
      ...current,
      date,
      nextDue:
        current.touchedNextDue || !date
          ? current.nextDue
          : nextDueFor(current.vaccine, date),
      error: "",
    }));
  };

  const saveLog = () => {
    if (!logging.date) {
      setLogging({ ...logging, error: "Enter the date the vaccine was given." });
      return;
    }

    if (logging.date > todayISO()) {
      setLogging({ ...logging, error: "Date given can't be in the future." });
      return;
    }

    if (!logging.nextDue || logging.nextDue <= logging.date) {
      setLogging({ ...logging, error: "Next due date must be after the date given." });
      return;
    }

    setRecords((current) =>
      current.map((item) =>
        item.id === logging.id
          ? {
              ...item,
              date: logging.date,
              nextDue: logging.nextDue,
              status: getStatus(logging.nextDue),
            }
          : item
      )
    );

    setToast(`${logging.vaccine} logged for ${logging.petName}.`);
    setLogging(null);
  };

  /* ----- CSV export (respects the current filters) ----- */

  const exportCsv = () => {
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      ["ID", "Pet", "Type", "Vaccine", "Date Given", "Next Due", "Status"],
      ...filtered.map((r) => [
        `VAC-${String(r.id).padStart(3, "0")}`,
        r.petName,
        r.petType,
        r.vaccine,
        r.date,
        r.nextDue || "",
        r.status,
      ]),
    ];

    const blob = new Blob(
      [rows.map((row) => row.map(escape).join(",")).join("\n")],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `vaccination-report-${range}-${todayISO()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const relativeDue = (iso) => {
    const days = daysFromToday(iso);

    if (days === null) return "No due date";
    if (days < 0) return `${Math.abs(days)} day${days === -1 ? "" : "s"} overdue`;
    if (days === 0) return "Due today";
    return `In ${days} day${days === 1 ? "" : "s"}`;
  };

  const isDueRange = range.startsWith("due");

  return (
    <>
      <div className="reports__toolbar">
        <select value={range} onChange={(e) => { setRange(e.target.value); setShowAll(false); }} aria-label="Date range">
          <option value="all">All time</option>

          <optgroup label="Date given">
            <option value="given30">Last 30 days</option>
            <option value="given90">Last 90 days</option>
            <option value="year">This year</option>
          </optgroup>

          <optgroup label="Next due">
            <option value="dueMonth">Due this month</option>
            <option value="due7">Due in next 7 days</option>
            <option value="due30">Due in next 30 days</option>
          </optgroup>
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Animal type">
          <option value="all">All Animal Types</option>
          {petTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="reports__export"
          onClick={exportCsv}
          disabled={total === 0}
        >
          <Download size={12} />
          Export CSV ({total})
        </button>
      </div>

      {isDueRange && (
        <p className="reports__range-note">
          Showing animals by when their next dose is due. Useful for planning
          batch vaccinations. Export CSV downloads exactly this list.
        </p>
      )}

      <section className="reports__stats">
        <ReportStat value={total} label="Total Vaccinations" onClick={() => goToVaccinations()} />
        <ReportStat value={`${compliance}%`} label="Up to Date" onClick={() => goToVaccinations("Up to date")} />
        <ReportStat value={dueSoon} label="Due Soon" onClick={() => goToVaccinations("Due Soon")} />
        <ReportStat value={overdue} label="Overdue" onClick={() => goToVaccinations("Overdue")} />
      </section>

      {total === 0 ? (
        <p className="reports__empty">
          No vaccination records match these filters.
        </p>
      ) : (
        <section className="reports__grid">
          <div className="staff-card reports__chart-card">
            <h2>Vaccinations by Status</h2>

            <Donut
              segments={statusSegments}
              total={total}
              label="Records"
              onSegmentClick={(segment) => goToVaccinations(segment.label)}
            />
          </div>

          <div className="staff-card reports__chart-card">
            <h2>Most Given Vaccines</h2>

            {byVaccine.map((row) => (
              <Bar
                key={row.label}
                label={row.label}
                value={row.value}
                max={byVaccine[0].value}
              />
            ))}
          </div>

          <div className="staff-card reports__chart-card">
            <h2>Vaccinations Given vs. Coming Due</h2>

            <div className="reports__bars">
              {months.map((m) => (
                <div
                  className="reports__month"
                  key={m.key}
                  title={`${m.label}: ${m.given} given, ${m.due} due`}
                >
                  <div>
                    <span style={{ height: `${Math.round((m.given / monthMax) * 100)}px` }} />
                    <span style={{ height: `${Math.round((m.due / monthMax) * 100)}px` }} />
                  </div>

                  <small>{m.label}</small>
                </div>
              ))}
            </div>

            <div className="reports__chart-legend">
              <span><i className="reports__dot" style={{ background: "#8b5b31" }} />Given</span>
              <span><i className="reports__dot" style={{ background: "#e7b04f" }} />Due</span>
            </div>
          </div>

          <div className="staff-card reports__chart-card">
            <h2>Up-to-date Rate by Animal Type</h2>

            {coverage.map((row) => (
              <Bar
                key={row.label}
                icon={
                  row.label === "Dog" ? <Dog size={12} /> : row.label === "Cat" ? <Cat size={12} /> : null
                }
                label={row.label}
                value={row.pct}
                suffix="%"
              />
            ))}
          </div>

          <div className="staff-card reports__recent reports__card--wide">
            <div className="reports__section-title">
              <h2>Needs Attention ({attention.length})</h2>

              {attention.length > 0 && (
                <button type="button" onClick={() => goToVaccinations(overdue ? "Overdue" : "Due Soon")}>
                  View in Vaccinations
                </button>
              )}
            </div>

            {visibleAttention.length === 0 ? (
              <p className="reports__empty">Nothing here. Every record is up to date.</p>
            ) : (
              visibleAttention.map((r) => (
                <div className="reports__attention-row reports__attention-row--actions" key={r.id}>
                  <div>
                    <strong>{r.petName}</strong>
                    <span>{r.vaccine}</span>
                  </div>

                  <span>{formatDate(r.nextDue)}</span>

                  <span>{relativeDue(r.nextDue)}</span>

                  <span className={`staff-status ${pillClass(r.status)}`}>{r.status}</span>

                  <div className="reports__row-actions">
                    <button
                      type="button"
                      className="reports__row-btn reports__row-btn--primary"
                      onClick={() => openLog(r)}
                    >
                      Log Vaccine
                    </button>

                    {r.petId != null && (
                      <Link className="reports__row-btn" to={`/admin/animals/${r.petId}`}>
                        View Animal
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}

            {attention.length > 6 && (
              <button
                type="button"
                className="reports__more"
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? "Show less" : `Show all ${attention.length}`}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Log Vaccine dialog */}
      {logging && (
        <div className="reports__overlay" onMouseDown={() => setLogging(null)}>
          <div
            className="reports__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Log vaccine"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="reports__modal-head">
              <h2>Log vaccine · {logging.petName}</h2>

              <button type="button" aria-label="Close" onClick={() => setLogging(null)}>
                <X size={14} />
              </button>
            </div>

            <p className="reports__modal-note">
              {logging.vaccine}. Saving marks it as given and sets the next
              due date.
            </p>

            <label>
              Date given
              <input
                type="date"
                value={logging.date}
                max={todayISO()}
                onChange={(event) => changeLogDate(event.target.value)}
              />
            </label>

            <label>
              Next due
              <input
                type="date"
                value={logging.nextDue}
                min={logging.date}
                onChange={(event) =>
                  setLogging({
                    ...logging,
                    nextDue: event.target.value,
                    touchedNextDue: true,
                    error: "",
                  })
                }
              />
            </label>

            {logging.error && (
              <p className="reports__modal-error" role="alert">
                {logging.error}
              </p>
            )}

            <div className="reports__modal-actions">
              <button type="button" className="reports__row-btn" onClick={() => setLogging(null)}>
                Cancel
              </button>

              <button type="button" className="reports__row-btn reports__row-btn--primary" onClick={saveLog}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="reports__toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}

/* ---------- drill-down + export helpers ---------- */

/* navigate("/admin/animals", { status: "Available" }) -> /admin/animals?status=Available */
function useDrillDown() {
  const navigate = useNavigate();

  return (path, params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });

    const qs = query.toString();
    navigate(qs ? `${path}?${qs}` : path);
  };
}

/* Download any list of records as CSV (nested values are skipped) */
const exportRecords = (filename, items) => {
  if (!items.length) return;

  const keys = [...new Set(items.flatMap((item) => Object.keys(item)))].filter(
    (key) => items.every((item) => item[key] === null || typeof item[key] !== "object")
  );

  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const lines = [
    keys.map(escape).join(","),
    ...items.map((item) => keys.map((key) => escape(item[key])).join(",")),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

/* ---------- Animals tab ---------- */

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

const ACTIVITY = [
  { date: "Sep 26, 2026", animal: "Bruno", type: "Intake", details: "Stray intake" },
  { date: "Sep 26, 2026", animal: "Luna", type: "Adoption", details: "Adopted to a new family" },
  { date: "Sep 25, 2026", animal: "Mingming", type: "Vaccination", details: "Feline 4-in-1 given" },
  { date: "Sep 24, 2026", animal: "Choco", type: "Treatment", details: "Skin condition follow-up" },
  { date: "Sep 23, 2026", animal: "Biscuit", type: "Clearance", details: "Medical clearance granted" },
];

const typeIcon = (label) =>
  label === "Dog" ? <Dog size={12} /> : label === "Cat" ? <Cat size={12} /> : null;

function AnimalsReport() {
  const go = useDrillDown();

  const [type, setType] = useState("all");
  const [showAllActivity, setShowAllActivity] = useState(false);

  const petTypes = useMemo(() => [...new Set(pets.map((p) => p.type))].sort(), []);

  const scoped = useMemo(
    () => (type === "all" ? pets : pets.filter((p) => p.type === type)),
    [type]
  );

  const typeParam = type === "all" ? "" : type;

  const statusRows = useMemo(() => withColors(countBy(scoped, (p) => p.status)), [scoped]);

  const typeRows = useMemo(() => {
    const rows = countBy(scoped, (p) => p.type);
    const top = rows.slice(0, 4);
    const rest = rows.slice(4).reduce((sum, r) => sum + r.value, 0);

    return rest ? [...top, { label: "Others", value: rest }] : top;
  }, [scoped]);

  const activity = showAllActivity ? ACTIVITY : ACTIVITY.slice(0, 2);

  return (
    <>
      <div className="reports__toolbar">
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Animal type">
          <option value="all">All Animal Types</option>
          {petTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="reports__export"
          disabled={scoped.length === 0}
          onClick={() => exportRecords(`animals-report-${toISO(new Date())}.csv`, scoped)}
        >
          <Download size={12} />
          Export CSV ({scoped.length})
        </button>
      </div>

      <section className="reports__stats">
        <ReportStat
          value={scoped.length}
          label="Total Animals"
          onClick={() => go("/admin/animals", { type: typeParam })}
        />

        <ReportStat
          value={scoped.filter((p) => p.status === "Available").length}
          label="Available for Adoption"
          onClick={() => go("/admin/animals", { status: "Available", type: typeParam })}
        />

        <ReportStat
          value={applications.filter((a) => a.status === "Pending").length}
          label="Pending Applications"
          onClick={() => go("/admin/adoption-applications", { status: "Pending" })}
        />

        <ReportStat
          value={missingPets.filter((p) => p.status === "Active").length}
          label="Missing Pet Reports"
          onClick={() => go("/admin/missing-pets", { status: "Active" })}
        />
      </section>

      <section className="reports__grid">
        <div className="staff-card reports__chart-card">
          <h2>Animals by Status</h2>

          <Donut
            segments={statusRows}
            total={scoped.length}
            label="Total Animals"
            onSegmentClick={(segment) =>
              go("/admin/animals", { status: segment.label, type: typeParam })
            }
          />
        </div>

        <div className="staff-card reports__chart-card">
          <h2>Animals by Type</h2>

          {typeRows.map((row) => (
            <Bar
              key={row.label}
              icon={typeIcon(row.label)}
              label={row.label}
              value={row.value}
              max={typeRows[0].value}
              onClick={
                row.label === "Others"
                  ? undefined
                  : () => go("/admin/animals", { type: row.label })
              }
            />
          ))}
        </div>

        <div className="staff-card reports__chart-card">
          <h2>Monthly Animal Intake vs. Adoptions</h2>

          <div className="reports__bars">
            {[20, 28, 19, 34, 45, 39, 52, 44, 41].map((value, index) => (
              <div className="reports__month" key={MONTH_LABELS[index]}>
                <div>
                  <span style={{ height: `${value}px` }} />
                  <span style={{ height: `${Math.max(value - 10, 12)}px` }} />
                </div>

                <small>{MONTH_LABELS[index]}</small>
              </div>
            ))}
          </div>

          <div className="reports__chart-legend">
            <span><i className="reports__dot" style={{ background: "#8b5b31" }} />Intake</span>
            <span><i className="reports__dot" style={{ background: "#e7b04f" }} />Adoptions</span>
          </div>
        </div>

        <div className="staff-card reports__recent">
          <div className="reports__section-title">
            <h2>Recent Activity</h2>

            <button type="button" onClick={() => setShowAllActivity((v) => !v)}>
              {showAllActivity ? "Show Less" : "View All"}
            </button>
          </div>

          {activity.map((item) => (
            <Activity
              key={`${item.date}-${item.animal}-${item.type}`}
              {...item}
              onClick={() => go("/admin/animals", { search: item.animal })}
            />
          ))}
        </div>
      </section>
    </>
  );
}

/* ---------- Adoptions tab ---------- */

function AdoptionsReport() {
  const go = useDrillDown();

  const [showAll, setShowAll] = useState(false);

  const statusRows = useMemo(
    () =>
      withColors(
        countBy(applications, (a) => a.status).map((row) => ({
          ...row,
          color: { Pending: "#e7b04f", Approved: "#8aa96b", Rejected: "#c4533f" }[row.label],
        }))
      ),
    []
  );

  const petRows = useMemo(() => countBy(applications, (a) => a.petName).slice(0, 5), []);

  const visible = showAll ? applications : applications.slice(0, 6);

  return (
    <>
      <div className="reports__toolbar">
        <button
          type="button"
          className="reports__export"
          disabled={applications.length === 0}
          onClick={() => exportRecords(`adoptions-report-${toISO(new Date())}.csv`, applications)}
        >
          <Download size={12} />
          Export CSV ({applications.length})
        </button>
      </div>

      <section className="reports__stats">
        <ReportStat
          value={applications.length}
          label="Total Applications"
          onClick={() => go("/admin/adoption-applications")}
        />

        <ReportStat
          value={countOf(statusRows, "Pending")}
          label="Pending"
          onClick={() => go("/admin/adoption-applications", { status: "Pending" })}
        />

        <ReportStat
          value={countOf(statusRows, "Approved")}
          label="Approved"
          onClick={() => go("/admin/adoption-applications", { status: "Approved" })}
        />

        <ReportStat
          value={countOf(statusRows, "Rejected")}
          label="Rejected"
          onClick={() => go("/admin/adoption-applications", { status: "Rejected" })}
        />
      </section>

      <section className="reports__grid">
        <div className="staff-card reports__chart-card">
          <h2>Applications by Status</h2>

          <Donut
            segments={statusRows}
            total={applications.length}
            label="Applications"
            onSegmentClick={(segment) =>
              go("/admin/adoption-applications", { status: segment.label })
            }
          />
        </div>

        <div className="staff-card reports__chart-card">
          <h2>Most Requested Animals</h2>

          {petRows.map((row) => (
            <Bar
              key={row.label}
              label={row.label}
              value={row.value}
              max={petRows[0].value}
              onClick={() => go("/admin/animals", { search: row.label })}
            />
          ))}
        </div>

        <div className="staff-card reports__recent reports__card--wide">
          <div className="reports__section-title">
            <h2>Recent Applications</h2>

            <button type="button" onClick={() => go("/admin/adoption-applications")}>
              View in Adoption Applications
            </button>
          </div>

          {visible.map((a) => (
            <div className="reports__attention-row reports__attention-row--three" key={a.id}>
              <div>
                <strong>{a.petName}</strong>
                <span>Application #{a.id}</span>
              </div>

              <span className={`staff-status ${pillClass(a.status)}`}>{a.status}</span>

              <div className="reports__row-actions">
                <Link className="reports__row-btn reports__row-btn--primary" to={`/admin/adoption-applications/${a.id}`}>
                  View Application
                </Link>

                <button
                  type="button"
                  className="reports__row-btn"
                  onClick={() => go("/admin/animals", { search: a.petName })}
                >
                  View Animal
                </button>
              </div>
            </div>
          ))}

          {applications.length > 6 && (
            <button type="button" className="reports__more" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show less" : `Show all ${applications.length}`}
            </button>
          )}
        </div>
      </section>
    </>
  );
}

/* ---------- Missing Pets tab ---------- */

function MissingReport() {
  const go = useDrillDown();

  const [showAll, setShowAll] = useState(false);

  const statusRows = useMemo(
    () =>
      countBy(missingPets, (p) => p.status).map((row) => ({
        ...row,
        color: { Active: "#e7b04f", Reunited: "#8aa96b" }[row.label] || "#9d6328",
      })),
    []
  );

  const locationRows = useMemo(() => countBy(missingPets, (p) => p.location).slice(0, 5), []);

  const visible = showAll ? missingPets : missingPets.slice(0, 6);

  const reunited = countOf(statusRows, "Reunited");

  return (
    <>
      <div className="reports__toolbar">
        <button
          type="button"
          className="reports__export"
          disabled={missingPets.length === 0}
          onClick={() => exportRecords(`missing-pets-report-${toISO(new Date())}.csv`, missingPets)}
        >
          <Download size={12} />
          Export CSV ({missingPets.length})
        </button>
      </div>

      <section className="reports__stats">
        <ReportStat
          value={missingPets.length}
          label="Total Reports"
          onClick={() => go("/admin/missing-pets")}
        />

        <ReportStat
          value={countOf(statusRows, "Active")}
          label="Still Missing"
          onClick={() => go("/admin/missing-pets", { status: "Active" })}
        />

        <ReportStat
          value={reunited}
          label="Reunited"
          onClick={() => go("/admin/missing-pets", { status: "Reunited" })}
        />

        <ReportStat
          value={missingPets.length ? `${Math.round((reunited / missingPets.length) * 100)}%` : "0%"}
          label="Reunion Rate"
          onClick={() => go("/admin/missing-pets", { status: "Reunited" })}
        />
      </section>

      <section className="reports__grid">
        <div className="staff-card reports__chart-card">
          <h2>Reports by Status</h2>

          <Donut
            segments={statusRows}
            total={missingPets.length}
            label="Reports"
            onSegmentClick={(segment) => go("/admin/missing-pets", { status: segment.label })}
          />
        </div>

        <div className="staff-card reports__chart-card">
          <h2>Top Reported Locations</h2>

          {locationRows.map((row) => (
            <Bar
              key={row.label}
              label={row.label}
              value={row.value}
              max={locationRows[0].value}
              onClick={() => go("/admin/missing-pets", { search: row.label })}
            />
          ))}
        </div>

        <div className="staff-card reports__recent reports__card--wide">
          <div className="reports__section-title">
            <h2>Recent Reports</h2>

            <button type="button" onClick={() => go("/admin/missing-pets")}>
              View in Missing Pets
            </button>
          </div>

          {visible.map((p) => (
            <div className="reports__attention-row reports__attention-row--three" key={p.id}>
              <div>
                <strong>{p.name}</strong>
                <span>{p.location}</span>
              </div>

              <span className={`staff-status ${pillClass(p.status)}`}>{p.status}</span>

              <div className="reports__row-actions">
                <Link className="reports__row-btn reports__row-btn--primary" to={`/admin/missing-pets/${p.id}`}>
                  View Report
                </Link>
              </div>
            </div>
          ))}

          {missingPets.length > 6 && (
            <button type="button" className="reports__more" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show less" : `Show all ${missingPets.length}`}
            </button>
          )}
        </div>
      </section>
    </>
  );
}

/* ---------- shared pieces ---------- */

function ReportStat({ value, label, onClick, active }) {
  const content = (
    <>
      <strong>{value}</strong>
      <span>{label}</span>
      <span>›</span>
    </>
  );

  if (!onClick) {
    return <div className="reports__stat">{content}</div>;
  }

  return (
    <button
      type="button"
      className={`reports__stat reports__stat--button ${
        active ? "reports__stat--active" : ""
      }`}
      aria-pressed={active}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

function Donut({ segments, total, label, onSegmentClick }) {
  let running = 0;

  const stops =
    total > 0
      ? segments
          .map((s) => {
            const start = (running / total) * 100;
            running += s.value;
            return `${s.color} ${start}% ${(running / total) * 100}%`;
          })
          .join(", ")
      : "#f1ece3 0% 100%";

  /* Work out which slice was clicked from the click's angle around the ring */
  const handleRingClick = (event) => {
    if (!onSegmentClick || total === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const radius = rect.width / 2;
    const distance = Math.hypot(dx, dy);

    // ignore clicks on the white hole or outside the ring
    if (distance > radius || distance < radius * 0.69) return;

    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    const target = (angle / 360) * total;
    let acc = 0;

    for (const segment of segments) {
      acc += segment.value;

      if (target < acc) {
        onSegmentClick(segment);
        return;
      }
    }
  };

  return (
    <div className="reports__donut">
      <div
        className={`reports__donut-circle reports__donut-circle--ring ${
          onSegmentClick ? "reports__donut-circle--clickable" : ""
        }`}
        style={{ background: `conic-gradient(${stops})` }}
        onClick={handleRingClick}
        title={onSegmentClick ? "Click a slice to view those records" : undefined}
      >
        <div className="reports__donut-hole">
          <strong>{total}</strong>
          <span>{label}</span>
        </div>
      </div>

      <div className="reports__legend">
        {segments.map((s) => (
          <Legend
            key={s.label}
            label={s.label}
            value={s.value}
            color={s.color}
            onClick={onSegmentClick ? () => onSegmentClick(s) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function Legend({ label, value, color, onClick }) {
  const content = (
    <>
      <span>
        {color && <i className="reports__dot" style={{ background: color }} />}
        {label}
      </span>

      <strong>{value}</strong>
    </>
  );

  if (!onClick) {
    return <div className="reports__legend-row">{content}</div>;
  }

  return (
    <button
      type="button"
      className="reports__legend-row reports__legend-row--button"
      onClick={onClick}
    >
      {content}
    </button>
  );
}

function Bar({ icon, label, value, max = 100, suffix = "", onClick }) {
  const content = (
    <>
      <span>
        {icon}
        {label}
      </span>

      <div>
        <span style={{ width: `${max ? Math.min(100, (value / max) * 100) : 0}%` }} />
      </div>

      <strong>
        {value}
        {suffix}
      </strong>
    </>
  );

  if (!onClick) {
    return <div className="reports__type-row">{content}</div>;
  }

  return (
    <button
      type="button"
      className="reports__type-row reports__type-row--button"
      onClick={onClick}
      title={`View ${label}`}
    >
      {content}
    </button>
  );
}

function Activity({ date, animal, type, details, onClick }) {
  const content = (
    <>
      <span>{date}</span>
      <strong>{animal}</strong>
      <span>{type}</span>
      <span>{details}</span>
    </>
  );

  if (!onClick) {
    return <div className="reports__activity">{content}</div>;
  }

  return (
    <button
      type="button"
      className="reports__activity reports__activity--button"
      onClick={onClick}
      title={`View ${animal}`}
    >
      {content}
    </button>
  );
}

export default Reports;