import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth.js";

import useAdminLists from "../../../hooks/useAdminLists.js";
import useFetch from "../../../hooks/useFetch.js";
import {
  addVaccinations,
  deleteVaccination,
  listVaccinations,
  updateVaccination,
} from "../../../services/vaccinationService.js";
import { formatApiError } from "../../../services/authService.js";

import "./Vaccinations.css";
import BackButton from "../../../components/common/BackButton.jsx";

/* ---------- constants ---------- */

const PAGE_SIZE = 5;

const dogVaccines = [
  "Rabies",
  "DHPP / 5-in-1",
  "Distemper",
  "Adenovirus / Hepatitis",
  "Parvovirus",
  "Parainfluenza",
  "Leptospirosis",
  "Bordetella",
  "Canine Influenza",
  "Other",
];

const catVaccines = [
  "Rabies",
  "FVRCP / 3-in-1",
  "Feline Viral Rhinotracheitis",
  "Calicivirus",
  "Panleukopenia",
  "FeLV",
  "Chlamydia felis",
  "Bordetella",
  "Other",
];

/* days until the next dose is due, per vaccine (default 365) */
const intervals = {
  Bordetella: 180,
  "Canine Influenza": 365,
  Leptospirosis: 365,
};

const sorters = {
  newest: (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
  oldest: (a, b) => a.date.localeCompare(b.date) || a.id - b.id,
  name: (a, b) => a.petName.localeCompare(b.petName),
  due: (a, b) =>
    (a.nextDue || "9999").localeCompare(b.nextDue || "9999"),
};

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

const nextDueFor = (vaccine, givenISO) =>
  addDays(givenISO, intervals[vaccine] ?? 365);

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

const optionsFor = (type) => (type === "Cat" ? catVaccines : dogVaccines);

const newRow = (date = "") => ({
  key: `${Date.now()}-${Math.random()}`,
  vaccine: "",
  customVaccine: "",
  date,
  nextDue: "",
});

const rowName = (row) =>
  row.vaccine === "Other" ? row.customVaccine.trim() : row.vaccine;

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

  const { animals } = useAdminLists();
  const pets = useMemo(
    () => animals.map((animal) => ({ ...animal, name: animal.name || animal.animal_code })),
    [animals]
  );
  const [searchParams] = useSearchParams();

  const paramStatus = searchParams.get("status");
  const paramType = searchParams.get("type");

  const initialStatus = ["Up to date", "Due Soon", "Overdue"].includes(paramStatus)
    ? paramStatus
    : "all";

  const initialType = ["Dog", "Cat"].includes(paramType) ? paramType : "all";

  /* add form: one animal, many vaccines */
  const [selectedPetId, setSelectedPetId] = useState("");
  const [rows, setRows] = useState(() => [newRow()]);
  const [formError, setFormError] = useState("");

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

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records
      .filter((record) => {
        const code = `vac-${String(record.id).padStart(3, "0")}`;

        const matchesSearch =
          !query ||
          record.petName.toLowerCase().includes(query) ||
          record.vaccine.toLowerCase().includes(query) ||
          code.includes(query);

        const matchesType =
          typeFilter === "all" || record.petType === typeFilter;

        const matchesStatus =
          statusFilter === "all" || record.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort(sorters[sortBy]);
  }, [records, search, typeFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRecords = filteredRecords.slice(startIndex, startIndex + PAGE_SIZE);

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
    setFormError("");
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      newRow(current[current.length - 1]?.date || ""),
    ]);
  };

  const removeRow = (key) => {
    setRows((current) =>
      current.length === 1
        ? [newRow()]
        : current.filter((row) => row.key !== key)
    );
    setFormError("");
  };

  const nextDueOf = (row) =>
    row.nextDue ||
    (rowName(row) && row.date ? nextDueFor(rowName(row), row.date) : "");

  const handleAddBatch = async () => {
    if (!selectedPet) {
      setFormError("Select an animal first.");
      return;
    }

    const today = toISO(new Date());
    const seen = new Set();

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const label = `Vaccine ${i + 1}`;
      const name = rowName(row);

      if (!row.vaccine) {
        setFormError(`${label}: choose a vaccine type.`);
        return;
      }

      if (!name) {
        setFormError(`${label}: enter the name of the vaccine.`);
        return;
      }

      if (!row.date) {
        setFormError(`${label}: enter the date given.`);
        return;
      }

      if (row.date > today) {
        setFormError(`${label}: date given can't be in the future.`);
        return;
      }

      const next = nextDueOf(row);

      if (next && next < row.date) {
        setFormError(`${label}: next due date must be after the date given.`);
        return;
      }

      const key = `${name.toLowerCase()}|${row.date}`;

      if (seen.has(key)) {
        setFormError(`${name} is listed twice for the same date.`);
        return;
      }

      seen.add(key);
    }

    try {
      const created = await addVaccinations(
        selectedPet.id,
        rows.map((row) => ({
          vaccine: rowName(row),
          administered_at: row.date,
          next_due_date: nextDueOf(row) || null,
        }))
      );

      reload();

      setSortBy("newest");
      setPage(1);
      setRows([newRow()]);
      setFormError("");

      showToast(
        created.length === 1
          ? `Vaccination added for ${selectedPet.name}.`
          : `${created.length} vaccinations added for ${selectedPet.name}.`
      );
    } catch (error) {
      setFormError(formatApiError(error).message);
    }
  };

  const recordBooster = async (record) => {
    const today = toISO(new Date());
    const nextDue = nextDueFor(record.vaccine, today);

    try {
      await updateVaccination(record.id, {
        administered_at: today,
        next_due_date: nextDue,
      });

      reload();
      showToast(`${record.vaccine} given to ${record.petName} today.`);
    } catch (error) {
      showToast(formatApiError(error).message);
    }
  };

  const openEdit = (record) => {

    const isListed = optionsFor(record.petType).includes(record.vaccine);

    setEditing({
      id: record.id,
      petName: record.petName,
      petType: record.petType,
      vaccine: isListed ? record.vaccine : "Other",
      customVaccine: isListed ? "" : record.vaccine,
      date: record.date,
      nextDue: record.nextDue || "",
      error: "",
    });
  };

  const saveEdit = async () => {
    const vaccineName =
      editing.vaccine === "Other"
        ? editing.customVaccine.trim()
        : editing.vaccine;

    if (!vaccineName || !editing.date) {
      setEditing({
        ...editing,
        error:
          editing.vaccine === "Other" && !vaccineName
            ? "Enter the name of the vaccine."
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
        vaccine: vaccineName,
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
        <section className="vaccinations__add">

          <div className="vaccinations__add-head">
            <div>
              <h2>Add vaccination records</h2>
              <p>
                Choose an animal, then add one or more vaccines it received.
              </p>
            </div>

            <select
              aria-label="Animal"
              value={selectedPetId}
              onChange={(event) => {
                setSelectedPetId(event.target.value);
                setRows([newRow()]);
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
                  <span />
                </div>

                {rows.map((row, index) => {
                  const taken = rows
                    .filter((other) => other.key !== row.key)
                    .map((other) => other.vaccine);

                  const options = optionsFor(selectedPet.type).filter(
                    (item) =>
                      item === "Other" ||
                      item === row.vaccine ||
                      !taken.includes(item)
                  );

                  return (
                    <div className="vaccinations__row" key={row.key}>

                      <div className="vaccinations__cell">
                        <select
                          aria-label={`Vaccine ${index + 1} type`}
                          value={row.vaccine}
                          onChange={(event) =>
                            updateRow(row.key, {
                              vaccine: event.target.value,
                              customVaccine: "",
                              nextDue: "",
                            })
                          }
                        >
                          <option value="">Vaccine type</option>

                          {options.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>

                        {row.vaccine === "Other" && (
                          <input
                            type="text"
                            placeholder="Enter vaccine name"
                            maxLength={40}
                            value={row.customVaccine}
                            onChange={(event) =>
                              updateRow(row.key, {
                                customVaccine: event.target.value,
                                nextDue: "",
                              })
                            }
                          />
                        )}
                      </div>

                      <input
                        type="date"
                        aria-label={`Vaccine ${index + 1} date given`}
                        value={row.date}
                        max={toISO(new Date())}
                        onChange={(event) =>
                          updateRow(row.key, {
                            date: event.target.value,
                            nextDue: "",
                          })
                        }
                      />

                      <input
                        type="date"
                        aria-label={`Vaccine ${index + 1} next due`}
                        value={nextDueOf(row)}
                        min={row.date}
                        onChange={(event) =>
                          updateRow(row.key, { nextDue: event.target.value })
                        }
                      />

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

      {/* Table */}
      <div className="staff-table-card">
        <table className="staff-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Pet Name</th>
              <th>Type</th>
              <th>Vaccine Type</th>
              <th>Date Given</th>
              <th>Next Due</th>
              <th>Status</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {pageRecords.map((record) => (
              <tr key={record.id}>
                <td>VAC-{String(record.id).padStart(3, "0")}</td>

                <td>
                  <div className="staff-table__photo">Photo</div>
                </td>

                <td>
                  <strong>{record.petName}</strong>
                </td>

                <td>{record.petType}</td>
                <td>{record.vaccine}</td>
                <td>{formatDate(record.date)}</td>
                <td>{formatDate(record.nextDue)}</td>

                <td>
                  <span className={`staff-status ${statusClass[record.status]}`}>
                    {record.status}
                  </span>
                </td>

                {showActions && (
                <td>
                  <div className="vaccinations__actions">
                    {canEdit && (
                      <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => recordBooster(record)}>
                        <RefreshCw size={14} />
                        Booster
                      </button>
                    )}

                    {canEdit && (
                      <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => openEdit(record)}>
                        <Pencil size={14} />
                        Edit
                      </button>
                    )}

                    {canDelete && (
                      <button type="button" className="ui-btn ui-btn--danger-ghost ui-btn--sm" onClick={() => setDeleting(record)}>
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                </td>
                )}
              </tr>
            ))}

            {pageRecords.length === 0 && (
              <tr>
                <td colSpan={showActions ? 9 : 8} className="vaccinations__empty">
                  {filtersActive ? (
                    <>
                      No records match your filters.{" "}
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
            {filteredRecords.length === 0
              ? "Showing 0 records"
              : `Showing ${startIndex + 1}-${startIndex + pageRecords.length} of ${filteredRecords.length} records`}
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
                value={editing.vaccine}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    vaccine: event.target.value,
                    customVaccine: "",
                    error: "",
                  })
                }
              >
                {optionsFor(editing.petType).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {editing.vaccine === "Other" && (
              <label>
                Vaccine name
                <input
                  type="text"
                  placeholder="Enter vaccine name"
                  maxLength={40}
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