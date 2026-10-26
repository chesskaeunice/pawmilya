import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth.js";

import useFetch from "../../../hooks/useFetch.js";
import { listAnimals } from "../../../services/animalService.js";
import {
  addVaccinations,
  deleteVaccination,
  listVaccinations,
  listVaccines,
  updateVaccination,
} from "../../../services/vaccinationService.js";
import { formatApiError } from "../../../services/authService.js";

import "./Vaccinations.css";
import BackButton from "../../../components/common/BackButton.jsx";
import FieldError from "../../../components/common/FieldError.jsx";

/* ---------- constants ---------- */

const PAGE_SIZE = 5;

/* "Others" in the vaccine dropdown: the vet tech types the name */
const OTHER = "other";

/* days until the next dose when the vaccine has no interval of its own */
const DEFAULT_INTERVAL = 365;

/* most vaccines that can be saved in one go */
const MAX_ROWS = 5;

/* server field -> the field of the form row it belongs to */
const ROW_FIELDS = {
  vaccine_id: "vaccine",
  other_vaccine_name: "custom",
  administered_at: "date",
  next_due_date: "nextDue",
};

const newestFirst = (a, b) => b.date.localeCompare(a.date) || b.id - a.id;

/* the list shows one row per animal; these order the animals */
const sorters = {
  newest: (a, b) => newestFirst(a.latest, b.latest),
  oldest: (a, b) => a.latest.date.localeCompare(b.latest.date) || a.latest.id - b.latest.id,
  name: (a, b) => a.petName.localeCompare(b.petName),
  due: (a, b) =>
    (a.nextDue || "9999").localeCompare(b.nextDue || "9999"),
};

const STATUS_RANK = { "Up to date": 1, "Due Soon": 2, Overdue: 3 };

/* ---------- date helpers ---------- */

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

const addDays = (iso, days) => {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
};

const getStatus = (nextISO) => {
  const next = parseDate(nextISO);
  if (!next) return "Up to date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Math.round((next - today) / 86400000);

  if (days < 0) return "Overdue";
  if (days <= 30) return "Due Soon";
  return "Up to date";
};

const statusClass = {
  Overdue: "staff-status--overdue",
  "Due Soon": "staff-status--due",
  "Up to date": "staff-status--current",
};

/* make any incoming records use ISO dates and a computed status */
const normalize = (record) => {
  const date = toISO(parseDate(record.date) ?? new Date());
  const parsedNext = parseDate(record.nextDue);
  const nextDue = parsedNext ? toISO(parsedNext) : null;

  return { ...record, date, nextDue, status: getStatus(nextDue) };
};

// vaccineId is the select's value: "" (nothing yet), a vaccine id, or OTHER
const newRow = (date = "") => ({
  key: `${Date.now()}-${Math.random()}`,
  vaccineId: "",
  customVaccine: "",
  date,
  nextDue: "",
  notes: "",
});

/* ---------- component ---------- */

function Vaccinations() {

  const { can } = useAuth();

  const canCreate = can("vaccinations.create");
  const canEdit = can("vaccinations.edit");
  const canDelete = can("vaccinations.delete");
  const showActions = canEdit || canDelete;

  // Records and the animals list come from the API
  const { data: recordData, reload } = useFetch(() => listVaccinations(), []);
  const records = useMemo(() => (recordData ?? []).map(normalize), [recordData]);

  // only the animals are needed here (the Add form's dropdown): one request
  const { data: animalData } = useFetch(() => listAnimals({ per_page: 500 }), []);
  const animals = useMemo(() => animalData?.data ?? [], [animalData]);
  const pets = useMemo(
    () => animals.map((animal) => ({ ...animal, name: animal.name || animal.animal_code })),
    [animals]
  );
  // the vaccines to pick from (one request); the form shows the ones that fit the animal's species
  const { data: vaccineData } = useFetch(() => listVaccines(), []);
  const vaccines = useMemo(() => vaccineData ?? [], [vaccineData]);
  const vaccinesFor = (type) => vaccines.filter((v) => v.species === "All" || v.species === type);

  const [searchParams] = useSearchParams();

  const paramStatus = searchParams.get("status");
  const paramType = searchParams.get("type");

  const initialStatus = ["Up to date", "Due Soon", "Overdue"].includes(paramStatus)
    ? paramStatus
    : "all";

  const initialType = ["Dog", "Cat"].includes(paramType) ? paramType : "all";

  /* add form: one animal, many vaccines */
  // ?animal=ID opens the form with that animal already chosen
  const paramAnimal = searchParams.get("animal");
  const [selectedPetId, setSelectedPetId] = useState(/^\d+$/.test(paramAnimal ?? "") ? paramAnimal : "");
  const [rows, setRows] = useState(() => [newRow()]);
  const [formError, setFormError] = useState("");
  // errors under the fields of each row: { [row.key]: { vaccine, custom, date, nextDue } }
  const [rowErrors, setRowErrors] = useState({});

  /* filters */
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  /* modals, toast */
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState("");

  /* animals whose vaccine list is open (several can be open at once) */
  const [openIds, setOpenIds] = useState(() => new Set());

  const toggleOpen = (petId) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(petId)) next.delete(petId);
      else next.add(petId);
      return next;
    });

  const selectedPet = pets.find((pet) => pet.id === Number(selectedPetId));

  const showToast = (message) => setToast(message);

  /* re-apply filters if the link's query string changes while mounted */
  useEffect(() => {
    setStatusFilter(initialStatus);
    setTypeFilter(initialType);
    setPage(1);
  }, [initialStatus, initialType]);

  /* auto-dismiss toast */
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  /* close modals on Escape */
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setEditing(null);
        setDeleting(null);
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* ---------- derived data ---------- */

  // One entry per animal: its records (newest first), the latest one, the nearest upcoming
  // due date and its worst status
  const groups = useMemo(() => {
    const today = toISO(new Date());
    const byAnimal = new Map();

    records.forEach((record) => {
      if (!byAnimal.has(record.petId)) {
        byAnimal.set(record.petId, {
          petId: record.petId,
          petCode: record.petCode,
          petName: record.petName,
          petType: record.petType,
          petBreed: record.petBreed,
          records: [],
        });
      }

      byAnimal.get(record.petId).records.push(record);
    });

    return [...byAnimal.values()].map((group) => {
      const list = [...group.records].sort(newestFirst);

      return {
        ...group,
        records: list,
        latest: list[0],
        nextDue: list.map((r) => r.nextDue).filter((d) => d && d >= today).sort()[0] ?? null,
        status: list.reduce(
          (worst, r) => (STATUS_RANK[r.status] > STATUS_RANK[worst] ? r.status : worst),
          "Up to date"
        ),
      };
    });
  }, [records]);

  // Search, type and status apply to animals: an animal is listed when it (or one of its vaccines) matches
  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return groups
      .filter((group) => {
        const matchesSearch =
          !query ||
          group.petName.toLowerCase().includes(query) ||
          (group.petCode ?? "").toLowerCase().includes(query) ||
          group.records.some((record) => record.vaccine.toLowerCase().includes(query));

        const matchesType = typeFilter === "all" || group.petType === typeFilter;

        const matchesStatus =
          statusFilter === "all" || group.records.some((record) => record.status === statusFilter);

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort(sorters[sortBy]);
  }, [groups, search, typeFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageGroups = filteredGroups.slice(startIndex, startIndex + PAGE_SIZE);

  const filtersActive =
    search || typeFilter !== "all" || statusFilter !== "all";

  /* ---------- filter handlers (always return to page 1) ---------- */

  const withReset = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  /* ---------- record actions ---------- */

  const updateRow = (key, changes) => {
    setRows((current) =>
      current.map((row) =>
        row.key === key ? { ...row, ...changes } : row
      )
    );
    clearRowErrors(key);
    setFormError("");
  };

  const clearRowErrors = (key) =>
    setRowErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });

  const addRow = () => {
    setRows((current) =>
      current.length >= MAX_ROWS
        ? current
        : [...current, newRow(current[current.length - 1]?.date || "")]
    );
  };

  const removeRow = (key) => {
    setRows((current) =>
      current.length === 1
        ? [newRow()]
        : current.filter((row) => row.key !== key)
    );
    clearRowErrors(key);
    setFormError("");
  };

  // the vaccine of a row: its name, and the days until the next dose
  const vaccineOf = (row) => vaccines.find((v) => String(v.id) === row.vaccineId);

  const nameOf = (row) =>
    row.vaccineId === OTHER ? row.customVaccine.trim() : vaccineOf(row)?.name ?? "";

  const nextDueOf = (row) =>
    row.nextDue ||
    (row.vaccineId && row.date
      ? addDays(row.date, vaccineOf(row)?.intervalDays ?? DEFAULT_INTERVAL)
      : "");

  const handleAddBatch = async () => {
    if (!selectedPet) {
      setFormError("Select an animal first.");
      return;
    }

    const today = toISO(new Date());
    const seen = new Set();
    const errors = {};

    rows.forEach((row) => {
      const found = {};
      const name = nameOf(row);

      if (!row.vaccineId) {
        found.vaccine = "Please choose a vaccine.";
      } else if (row.vaccineId === OTHER && !name) {
        found.custom = "Please specify the vaccine.";
      }

      if (!row.date) {
        found.date = "Please enter the date given.";
      } else if (row.date > today) {
        found.date = "The date given can't be in the future.";
      }

      const next = nextDueOf(row);

      if (next && row.date && next < row.date) {
        found.nextDue = "The next due date must be after the date given.";
      }

      if (name && row.date) {
        const key = `${name.toLowerCase()}|${row.date}`;

        if (seen.has(key)) found[row.vaccineId === OTHER ? "custom" : "vaccine"] = `${name} is listed twice for the same date.`;
        seen.add(key);
      }

      if (Object.keys(found).length) errors[row.key] = found;
    });

    if (Object.keys(errors).length) {
      setRowErrors(errors);
      setFormError("");
      return;
    }

    try {
      const created = await addVaccinations(
        selectedPet.id,
        rows.map((row) => ({
          vaccine_id: row.vaccineId === OTHER ? null : Number(row.vaccineId),
          other_vaccine_name: row.vaccineId === OTHER ? nameOf(row) : null,
          administered_at: row.date,
          next_due_date: nextDueOf(row) || null,
          notes: row.notes.trim() || null,
        }))
      );

      reload();

      setSortBy("newest");
      setPage(1);
      setRows([newRow()]);
      setRowErrors({});
      setFormError("");

      showToast(
        created.length === 1
          ? `Vaccination added for ${selectedPet.name}.`
          : `${created.length} vaccinations added for ${selectedPet.name}.`
      );
    } catch (error) {
      // errors of the server go under the field of the row they belong to
      const { message, fields } = formatApiError(error);
      const mapped = {};
      let general = Object.keys(fields).length === 0;

      Object.entries(fields).forEach(([name, text]) => {
        const match = name.match(/^records\.(\d+)\.(\w+)$/);
        const row = match && rows[Number(match[1])];
        const field = match && ROW_FIELDS[match[2]];

        if (row && field) mapped[row.key] = { ...mapped[row.key], [field]: text };
        else general = true;
      });

      setRowErrors(mapped);
      setFormError(general ? Object.values(fields)[0] || message : "");
    }
  };

  // "Add vaccine" on an animal: that animal is chosen in the form above, and the form comes into view
  const startAddFor = (petId) => {
    setSelectedPetId(String(petId));
    setRows([newRow()]);
    setRowErrors({});
    setFormError("");

    document.getElementById("vaccination-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("vaccination-animal")?.focus({ preventScroll: true });
  };

  const openEdit = (record) => {
    setEditing({
      id: record.id,
      petName: record.petName,
      petType: record.petType,
      vaccineId: record.vaccineId ? String(record.vaccineId) : OTHER,
      customVaccine: record.vaccineId ? "" : record.otherVaccineName ?? record.vaccine,
      date: record.date,
      nextDue: record.nextDue || "",
      error: "",
    });
  };

  const saveEdit = async () => {
    const isOther = editing.vaccineId === OTHER;
    const customName = editing.customVaccine.trim();

    if (!editing.vaccineId || !editing.date || (isOther && !customName)) {
      setEditing({
        ...editing,
        error:
          isOther && !customName
            ? "Please specify the vaccine."
            : "Vaccine type and date are required.",
      });
      return;
    }

    if (editing.nextDue && editing.nextDue < editing.date) {
      setEditing({
        ...editing,
        error: "Next due date must be after the date given.",
      });
      return;
    }

    try {
      await updateVaccination(editing.id, {
        vaccine_id: isOther ? null : Number(editing.vaccineId),
        other_vaccine_name: isOther ? customName : null,
        administered_at: editing.date,
        next_due_date: editing.nextDue || null,
      });
    } catch (error) {
      setEditing({ ...editing, error: formatApiError(error).message });
      return;
    }

    reload();
    showToast(`Record for ${editing.petName} updated.`);
    setEditing(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteVaccination(deleting.id);
      reload();
      showToast(`Record for ${deleting.petName} deleted.`);
    } catch (error) {
      showToast(formatApiError(error).message);
    }

    setDeleting(null);
  };

  /* ---------- render ---------- */

  return (
    <div className="staff-page vaccinations">
      <BackButton fallback="/admin/dashboard" />

      <div className="staff-page__top">
        <div>
         

          <h1 className="staff-page__title">Vaccinations</h1>

          <p className="staff-page__subtitle">
            Manage and track vaccination records for animals in Pawmilya.
          </p>
        </div>
      </div>

      {/* Add records (vaccine role only) */}
      {canCreate ? (
        <section className="vaccinations__add" id="vaccination-form">

          <div className="vaccinations__add-head">
            <div>
              <h2>Add vaccination records</h2>
              <p>
                Choose an animal, then add one or more vaccines it received.
              </p>
            </div>

            <select
              id="vaccination-animal"
              aria-label="Animal"
              value={selectedPetId}
              onChange={(event) => {
                setSelectedPetId(event.target.value);
                setRows([newRow()]);
                setRowErrors({});
                setFormError("");
              }}
            >
              <option value="">Select animal</option>

              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} · {pet.type}
                </option>
              ))}
            </select>
          </div>


          {selectedPet && (
            <>
              {/* what this animal already has */}
              <div className="vaccinations__existing">
                <span>On record for {selectedPet.name}:</span>

                {records.filter((r) => r.petId === selectedPet.id).length === 0 ? (
                  <em>no vaccines yet</em>
                ) : (
                  records
                    .filter((r) => r.petId === selectedPet.id)
                    .map((r) => (
                      <span
                        key={r.id}
                        className={`staff-status ${statusClass[r.status]}`}
                      >
                        {r.vaccine} · {formatDate(r.date)}
                      </span>
                    ))
                )}
              </div>


              <div className="vaccinations__rows">

                <div className="vaccinations__row vaccinations__row--head">
                  <span>Vaccine</span>
                  <span>Date given</span>
                  <span>Next due</span>
                  <span>Notes (optional)</span>
                  <span />
                </div>

                {rows.map((row, index) => {
                  const taken = rows
                    .filter((other) => other.key !== row.key)
                    .map((other) => other.vaccineId);

                  // the vaccines for this species that are not already chosen in another row
                  const options = vaccinesFor(selectedPet.type).filter(
                    (item) =>
                      String(item.id) === row.vaccineId ||
                      !taken.includes(String(item.id))
                  );

                  const errs = rowErrors[row.key] ?? {};

                  return (
                    <div className="vaccinations__row" key={row.key}>

                      <div className="vaccinations__cell">
                        <select
                          aria-label={`Vaccine ${index + 1} type`}
                          value={row.vaccineId}
                          aria-invalid={Boolean(errs.vaccine)}
                          aria-describedby={`vaccine-${row.key}-error`}
                          onChange={(event) =>
                            updateRow(row.key, {
                              vaccineId: event.target.value,
                              customVaccine: "",
                              nextDue: "",
                            })
                          }
                        >
                          <option value="">Vaccine type</option>

                          {options.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}

                          <option value={OTHER}>Others</option>
                        </select>

                        {row.vaccineId === OTHER && (
                          <input
                            type="text"
                            aria-label={`Vaccine ${index + 1} name`}
                            placeholder="Specify the vaccine"
                            maxLength={100}
                            value={row.customVaccine}
                            aria-invalid={Boolean(errs.custom)}
                            aria-describedby={`vaccine-${row.key}-error`}
                            onChange={(event) =>
                              updateRow(row.key, { customVaccine: event.target.value })
                            }
                          />
                        )}

                        <FieldError id={`vaccine-${row.key}-error`} message={errs.vaccine || errs.custom} />
                      </div>

                      <div className="vaccinations__cell">
                        <input
                          type="date"
                          aria-label={`Vaccine ${index + 1} date given`}
                          value={row.date}
                          max={toISO(new Date())}
                          aria-invalid={Boolean(errs.date)}
                          aria-describedby={`date-${row.key}-error`}
                          onChange={(event) =>
                            updateRow(row.key, {
                              date: event.target.value,
                              nextDue: "",
                            })
                          }
                        />

                        <FieldError id={`date-${row.key}-error`} message={errs.date} />
                      </div>

                      <div className="vaccinations__cell">
                        <input
                          type="date"
                          aria-label={`Vaccine ${index + 1} next due`}
                          value={nextDueOf(row)}
                          min={row.date}
                          aria-invalid={Boolean(errs.nextDue)}
                          aria-describedby={`next-${row.key}-error`}
                          onChange={(event) =>
                            updateRow(row.key, { nextDue: event.target.value })
                          }
                        />

                        <FieldError id={`next-${row.key}-error`} message={errs.nextDue} />
                      </div>

                      <div className="vaccinations__cell">
                        <input
                          type="text"
                          aria-label={`Vaccine ${index + 1} notes`}
                          placeholder="Notes"
                          maxLength={1000}
                          value={row.notes}
                          onChange={(event) =>
                            updateRow(row.key, { notes: event.target.value })
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="vaccinations__remove"
                        aria-label={`Remove vaccine ${index + 1}`}
                        onClick={() => removeRow(row.key)}
                      >
                        <X size={14} />
                      </button>

                    </div>
                  );
                })}

              </div>


              {formError && (
                <p className="vaccinations__error" role="alert">
                  {formError}
                </p>
              )}


              <div className="vaccinations__add-actions">

                <button
                  type="button"
                  className="staff-button staff-button--outline"
                  onClick={addRow}
                  disabled={rows.length >= MAX_ROWS}
                  title={rows.length >= MAX_ROWS ? `Up to ${MAX_ROWS} vaccines at a time` : undefined}
                >
                  <Plus size={13} />
                  Add another vaccine
                </button>

                <button
                  type="button"
                  className="staff-button"
                  onClick={handleAddBatch}
                >
                  <Check size={13} />
                  {rows.length > 1
                    ? `Save ${rows.length} records`
                    : "Save record"}
                </button>

              </div>
            </>
          )}

        </section>
      ) : (
        <p className="vaccinations__readonly">
          You have view-only access to vaccination records.
        </p>
      )}

      {/* Filters */}
      <div className="staff-filters vaccinations__filters">
        <input
          type="text"
          placeholder="Search by name, ID, or vaccine type..."
          value={search}
          onChange={withReset(setSearch)}
        />

        <select value={typeFilter} onChange={withReset(setTypeFilter)}>
          <option value="all">All Animal Types</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
        </select>

        <select value={statusFilter} onChange={withReset(setStatusFilter)}>
          <option value="all">All Statuses</option>
          <option value="Up to date">Up to date</option>
          <option value="Due Soon">Due Soon</option>
          <option value="Overdue">Overdue</option>
        </select>

        <select value={sortBy} onChange={withReset(setSortBy)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Pet Name (A–Z)</option>
          <option value="due">Next Due (Soonest)</option>
        </select>
      </div>

      {/* Table: one row per animal; "View vaccines" opens the list of its vaccines */}
      <div className="staff-table-card">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Animal ID</th>
              <th>Name</th>
              <th>Species / Breed</th>
              <th>Vaccines</th>
              <th>Latest Vaccine</th>
              <th>Next Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageGroups.map((group) => {
              const isOpen = openIds.has(group.petId);
              const panelId = `vaccines-of-${group.petId}`;

              return (
                <Fragment key={group.petId}>
                  <tr className={isOpen ? "vaccinations__animal vaccinations__animal--open" : "vaccinations__animal"}>
                    <td>{group.petCode}</td>

                    <td>
                      <strong>{group.petName}</strong>
                    </td>

                    <td>
                      {group.petType}
                      {group.petBreed ? ` · ${group.petBreed}` : ""}
                    </td>

                    <td>{group.records.length}</td>

                    <td>
                      {group.latest.vaccine}
                      <span className="vaccinations__sub">{formatDate(group.latest.date)}</span>
                    </td>

                    <td>{group.nextDue ? formatDate(group.nextDue) : "—"}</td>

                    <td>
                      <span className={`staff-status ${statusClass[group.status]}`}>
                        {group.status}
                      </span>
                    </td>

                    <td>
                      <div className="vaccinations__actions">
                        <button
                          type="button"
                          className="vaccinations__action"
                          onClick={() => toggleOpen(group.petId)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                        >
                          View vaccines
                          <ChevronDown size={14} className="vaccinations__chevron" aria-hidden="true" />
                        </button>

                        {canCreate && (
                          <button
                            type="button"
                            className="vaccinations__action"
                            onClick={() => startAddFor(group.petId)}
                          >
                            <Plus size={14} />
                            Add vaccine
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* every vaccine given to this animal, newest first */}
                  <tr className="vaccinations__detail-row">
                    <td colSpan={8}>
                      <div
                        id={panelId}
                        className={isOpen ? "vaccinations__collapse is-open" : "vaccinations__collapse"}
                        inert={!isOpen}
                      >
                        <div className="vaccinations__collapse-inner">
                          <div className="vaccinations__detail">
                            <table className="vaccinations__detail-table">
                              <thead>
                                <tr>
                                  <th>Vaccine</th>
                                  <th>Date given</th>
                                  <th>Next due</th>
                                  <th>Status</th>
                                  <th>Given by</th>
                                  <th>Notes</th>
                                  {showActions && <th>Actions</th>}
                                </tr>
                              </thead>

                              <tbody>
                                {group.records.map((record) => (
                                  <tr key={record.id}>
                                    <td data-label="Vaccine">
                                      <strong>{record.vaccine}</strong>
                                    </td>
                                    <td data-label="Date given">{formatDate(record.date)}</td>
                                    <td data-label="Next due">{formatDate(record.nextDue)}</td>
                                    <td data-label="Status">
                                      <span className={`staff-status ${statusClass[record.status]}`}>
                                        {record.status}
                                      </span>
                                    </td>
                                    <td data-label="Given by">{record.givenBy || "—"}</td>
                                    <td data-label="Notes">{record.notes || "—"}</td>

                                    {showActions && (
                                      <td data-label="Actions">
                                        <div className="vaccinations__actions">
                                          {canEdit && (
                                            <button type="button" className="vaccinations__action" onClick={() => openEdit(record)}>
                                              <Pencil size={14} />
                                              Edit
                                            </button>
                                          )}

                                          {canDelete && (
                                            <button type="button" className="vaccinations__action vaccinations__action--danger" onClick={() => setDeleting(record)}>
                                              <Trash2 size={14} />
                                              Delete
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {canCreate && (
                              <button
                                type="button"
                                className="vaccinations__action vaccinations__detail-add"
                                onClick={() => startAddFor(group.petId)}
                              >
                                <Plus size={14} />
                                Add vaccine
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}

            {pageGroups.length === 0 && (
              <tr>
                <td colSpan={8} className="vaccinations__empty">
                  {filtersActive ? (
                    <>
                      No animals match your filters.{" "}
                      <button type="button" onClick={clearFilters}>
                        Clear filters
                      </button>
                    </>
                  ) : (
                    "No vaccination records yet."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="staff-pagination">
          <span>
            {filteredGroups.length === 0
              ? "Showing 0 animals"
              : `Showing ${startIndex + 1}-${startIndex + pageGroups.length} of ${filteredGroups.length} animals`}
          </span>

          <div className="staff-pagination__pages">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={12} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                key={n}
                className={n === currentPage ? "active" : ""}
                aria-current={n === currentPage ? "page" : undefined}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="vaccinations__overlay" onMouseDown={() => setEditing(null)}>
          <div
            className="vaccinations__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Edit vaccination record"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="vaccinations__modal-head">
              <h2>Edit record · {editing.petName}</h2>

              <button type="button" aria-label="Close" onClick={() => setEditing(null)}>
                <X size={14} />
              </button>
            </div>

            <label>
              Vaccine type
              <select
                value={editing.vaccineId}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    vaccineId: event.target.value,
                    customVaccine: "",
                    error: "",
                  })
                }
              >
                {vaccinesFor(editing.petType).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}

                <option value={OTHER}>Others</option>
              </select>
            </label>

            {editing.vaccineId === OTHER && (
              <label>
                Specify the vaccine
                <input
                  type="text"
                  placeholder="Specify the vaccine"
                  maxLength={100}
                  autoFocus
                  value={editing.customVaccine}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      customVaccine: event.target.value,
                      error: "",
                    })
                  }
                />
              </label>
            )}

            <label>
              Date given
              <input
                type="date"
                value={editing.date}
                max={toISO(new Date())}
                onChange={(event) =>
                  setEditing({ ...editing, date: event.target.value, error: "" })
                }
              />
            </label>

            <label>
              Next due
              <input
                type="date"
                value={editing.nextDue}
                min={editing.date}
                onChange={(event) =>
                  setEditing({ ...editing, nextDue: event.target.value, error: "" })
                }
              />
            </label>

            {editing.error && (
              <p className="vaccinations__error" role="alert">
                {editing.error}
              </p>
            )}

            <div className="vaccinations__modal-actions">
              <button type="button" className="vaccinations__ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>

              <button type="button" className="staff-button" onClick={saveEdit}>
                <Check size={13} />
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="vaccinations__overlay" onMouseDown={() => setDeleting(null)}>
          <div
            className="vaccinations__modal vaccinations__modal--small"
            role="alertdialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2>Delete this record?</h2>

            <p>
              {deleting.vaccine} for {deleting.petName} will be permanently
              removed. This can&apos;t be undone.
            </p>

            <div className="vaccinations__modal-actions">
              <button type="button" className="vaccinations__ghost" onClick={() => setDeleting(null)}>
                Cancel
              </button>

              <button type="button" className="vaccinations__danger" onClick={confirmDelete}>
                Delete record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="vaccinations__toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export default Vaccinations;