import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
} from "lucide-react";

import missingPets from "../../../data/missingPets.js";

import "./MissingPetReports.css";

function MissingPetReports() {
  const [search, setSearch] =
    useState("");

  const [type, setType] =
    useState("All");

  const [status, setStatus] =
    useState("All");

  const filteredPets =
    missingPets.filter((pet) => {
      const query =
        search.toLowerCase();

      const matchesSearch =
        pet.name
          .toLowerCase()
          .includes(query) ||
        pet.breed
          .toLowerCase()
          .includes(query) ||
        pet.location
          .toLowerCase()
          .includes(query);

      const matchesType =
        type === "All" ||
        pet.type === type;

      const matchesStatus =
        status === "All" ||
        pet.status === status;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });

  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Missing Pets
          </p>

          <h1 className="staff-page__title">
            Missing Pet Reports
          </h1>

          <p className="staff-page__subtitle">
            View and manage all missing pet reports in Pawmilya.
          </p>
        </div>
      </div>

      <div className="staff-filters">
        <input
          type="text"
          placeholder="Search by name, ID, or breed..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value)
          }
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
        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="All">
            All Statuses
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Reunited">
            Reunited
          </option>
        </select>

        <select>
          <option>
            Newest First
          </option>

          <option>
            Oldest First
          </option>
        </select>

        <button className="staff-button">
          <Plus size={13} />
          Add Animal
        </button>
      </div>

      <div className="staff-table-card">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Photo</th>
              <th>Pet Name</th>
              <th>Type</th>
              <th>Last Seen / Location</th>
              <th>Date Reported</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPets.map((pet) => (
              <tr key={pet.id}>
                <td>
                  MPR-
                  {String(
                    pet.id
                  ).padStart(3, "0")}
                </td>

                <td>
                  <div className="staff-table__photo">
                    Photo
                  </div>
                </td>

                <td>
                  <strong>
                    {pet.name}
                  </strong>
                </td>

                <td>
                  {pet.type}
                </td>

                <td>
                  {pet.location}
                </td>

                <td>
                  {pet.dateReported}
                </td>

                <td>
                  <span
                    className={`staff-status ${
                      pet.status ===
                      "Reunited"
                        ? "staff-status--approved"
                        : "staff-status--active"
                    }`}
                  >
                    {pet.status}
                  </span>
                </td>

                <td>
                  <div className="missing-admin__actions">
                    <Link
                      to={`/admin/missing-pets/${pet.id}`}
                    >
                      View
                    </Link>

                    <button type="button">
                      <MoreVertical
                        size={14}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="staff-pagination">
          <span>
            Showing 1-
            {filteredPets.length} of{" "}
            {filteredPets.length} animals
          </span>

          <div className="staff-pagination__pages">
            <button>
              <ChevronLeft size={12} />
            </button>

            <button className="active">
              1
            </button>

            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>

            <button>
              <ChevronRight
                size={12}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissingPetReports;