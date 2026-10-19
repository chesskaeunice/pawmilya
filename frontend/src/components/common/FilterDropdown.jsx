import { useEffect, useRef, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";

import {
  animalTypeOptions,
  defaultFilters,
  hasActiveFilters,
  statusOptions,
} from "../../utils/filterHelpers.js";

import "./FilterDropdown.css";

const ALL_FIELDS = ["animalType", "dateRange", "status"];

// Filter button + dropdown: Animal Type, Date Range (with custom dates), Status.
// Pass `fields` to show only some of them (for example articles only use dates).
function FilterDropdown({ value, onChange, fields = ALL_FIELDS }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const update = (field, next) => onChange({ ...value, [field]: next });

  return (
    <div className="filter-dropdown" ref={wrapRef}>

      <button
        type="button"
        className="filter-dropdown__button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Filter size={18} aria-hidden="true" />
        Filter
        {hasActiveFilters(value) && (
          <span className="filter-dropdown__dot" aria-label="Filters active" />
        )}
      </button>

      {open && (
        <div className="filter-dropdown__panel">

          {fields.includes("animalType") && (
            <label className="filter-dropdown__field">
              <span>Animal Type</span>
              <select
                value={value.animalType}
                onChange={(event) => update("animalType", event.target.value)}
              >
                <option value="All">All Animals</option>
                {animalTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
          )}

          {fields.includes("dateRange") && (
            <>
              <label className="filter-dropdown__field">
                <span>Date Range</span>
                <select
                  value={value.dateRange}
                  onChange={(event) => update("dateRange", event.target.value)}
                >
                  <option value="All">Any Time</option>
                  <option value="24hours">Last 24 Hours</option>
                  <option value="week">Past Week</option>
                  <option value="custom">Custom Range</option>
                </select>
              </label>

              {value.dateRange === "custom" && (
                <div className="filter-dropdown__dates">
                  <label className="filter-dropdown__field">
                    <span>From</span>
                    <input
                      type="date"
                      value={value.customFrom}
                      onChange={(event) =>
                        update("customFrom", event.target.value)
                      }
                    />
                  </label>

                  <label className="filter-dropdown__field">
                    <span>To</span>
                    <input
                      type="date"
                      value={value.customTo}
                      onChange={(event) =>
                        update("customTo", event.target.value)
                      }
                    />
                  </label>
                </div>
              )}
            </>
          )}

          {fields.includes("status") && (
            <label className="filter-dropdown__field">
              <span>Status</span>
              <select
                value={value.status}
                onChange={(event) => update("status", event.target.value)}
              >
                <option value="All">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
          )}

          <button
            type="button"
            className="filter-dropdown__reset"
            onClick={() => onChange(defaultFilters)}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Clear Filters
          </button>

        </div>
      )}

    </div>
  );
}

export default FilterDropdown;
