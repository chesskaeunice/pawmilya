import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  QrCode,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth.js";
import useDebouncedValue from "../../../hooks/useDebouncedValue.js";
import useFetch from "../../../hooks/useFetch.js";
import { listAnimals } from "../../../services/animalService.js";
import {
  ANIMAL_STATUSES,
  HEALTH_STATUSES,
  healthStatusClass,
  statusClass,
} from "../../../config/animalStatus.js";

import "./Animals.css";
import BackButton from "../../../components/common/BackButton.jsx";
import SafeImage from "../../../components/common/SafeImage.jsx";

const SORTS = {
  Newest: "newest",
  "Name A-Z": "name_asc",
  "Name Z-A": "name_desc",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

function Animals() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [healthFilter, setHealthFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");

  const [page, setPage] = useState(1);

  // Filters go to the API; the search waits until typing stops
  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error } = useFetch(
    () =>
      listAnimals({
        q: debouncedSearch || undefined,
        type: typeFilter === "All" ? undefined : typeFilter,
        status: statusFilter === "All" ? undefined : statusFilter,
        health_status: healthFilter === "All" ? undefined : healthFilter,
        sort: SORTS[sortOrder],
        page,
      }),
    [debouncedSearch, typeFilter, statusFilter, healthFilter, sortOrder, page]
  );

  const animals = data?.data ?? [];
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
            Animals
          </h1>

          <p className="staff-page__subtitle">
            View and manage all rescued animals at Pawmilya.
          </p>
        </div>

      </div>


      <div className="staff-filters">

        <input
          type="text"
          placeholder="Search by name, ID, or breed..."
          value={search}
          onChange={withReset(setSearch)}
        />


        <select
          value={typeFilter}
          onChange={withReset(setTypeFilter)}
        >
          <option value="All">
            All Types
          </option>

          <option value="Dog">
            Dog
          </option>

          <option value="Cat">
            Cat
          </option>

          <option value="Other">
            Others
          </option>
        </select>


        <select
          value={statusFilter}
          onChange={withReset(setStatusFilter)}
        >
          <option value="All">
            All Statuses
          </option>

          {ANIMAL_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>


        <select
          value={healthFilter}
          onChange={withReset(setHealthFilter)}
        >
          <option value="All">
            All Health Statuses
          </option>

          {HEALTH_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>


        <select
          value={sortOrder}
          onChange={withReset(setSortOrder)}
        >
          <option value="Newest">
            Newest First
          </option>

          <option value="Name A-Z">
            Name A-Z
          </option>

          <option value="Name Z-A">
            Name Z-A
          </option>
        </select>


        {can("animals.create") && (
          <Link
            to="/admin/animals/add"
            className="staff-button"
          >
            <Plus size={13} />
            Add Animal
          </Link>
        )}

      </div>


      <div className="staff-table-card">

        <table className="staff-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Type</th>
              <th>Breed</th>
              <th>Status</th>
              <th>Health Status</th>
              <th>Date Rescued</th>
              <th>Actions</th>
            </tr>
          </thead>


          <tbody>

            {animals.map((pet) => (

              <tr key={pet.id}>

                <td>
                  {pet.animal_code}
                </td>


                <td>
                  <div className="staff-table__photo">
                    {pet.image ? (
                      <SafeImage type={pet.type}
                        src={pet.image}
                        alt={pet.name || "Animal"}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                      />
                    ) : (
                      "Photo"
                    )}
                  </div>
                </td>


                <td>
                  <strong>
                    {pet.name || "Unnamed"}
                  </strong>
                </td>


                <td>
                  {pet.type === "Other" ? pet.other_species || "Other" : pet.type}
                </td>


                <td>
                  {pet.breed}
                </td>


                <td>
                  <span
                    className={`staff-status ${statusClass(
                      pet.status
                    )}`}
                  >
                    {pet.status}
                  </span>
                </td>


                <td>
                  <span
                    className={`staff-status ${healthStatusClass(
                      pet.health_status
                    )}`}
                  >
                    {pet.health_status}
                  </span>
                </td>


                <td>
                  {formatDate(pet.dateAdded)}
                </td>


                <td>
                  <div className="animals__actions">

                    <Link
                      to={`/admin/animals/${pet.id}`}
                      className="animals__view"
                    >
                      View
                    </Link>

                    {can("qr.generate") && (
                      <Link
                        to={`/admin/animals/${pet.id}/collar-tag`}
                        className="animals__view"
                      >
                        <QrCode size={14} />
                        Generate QR
                      </Link>
                    )}

                  </div>
                </td>

              </tr>

            ))}

            {!loading && animals.length === 0 && (
              <tr>
                <td colSpan={9}>
                  {error ? "Could not load animals." : "No animals found."}
                </td>
              </tr>
            )}

          </tbody>

        </table>


        <div className="staff-pagination">

          <span>
            {meta
              ? `Showing ${meta.from ?? 0}-${meta.to ?? 0} of ${meta.total} animals`
              : "Loading..."}
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

            {Array.from({ length: meta?.last_page ?? 1 }, (_, index) => index + 1).map(
              (number) => (
                <button
                  type="button"
                  key={number}
                  className={number === page ? "active" : undefined}
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              )
            )}

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

export default Animals;