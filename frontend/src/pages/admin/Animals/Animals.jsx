import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
} from "lucide-react";

import pets from "../../../data/pets.js";
import {
  ANIMAL_STATUSES,
  HEALTH_STATUSES,
  healthStatusClass,
  statusClass,
} from "../../../config/animalStatus.js";

import "./Animals.css";

function Animals() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [healthFilter, setHealthFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");

  const filteredPets = pets
    .filter((pet) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        pet.name.toLowerCase().includes(searchValue) ||
        pet.breed.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === "All" ||
        pet.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" ||
        pet.status === statusFilter;

      const matchesHealth =
        healthFilter === "All" ||
        pet.health_status === healthFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesHealth
      );
    })
    .sort((a, b) => {
      if (sortOrder === "Name A-Z") {
        return a.name.localeCompare(b.name);
      }

      if (sortOrder === "Name Z-A") {
        return b.name.localeCompare(a.name);
      }

      return b.id - a.id;
    });

  return (
    <div className="staff-page">

      <div className="staff-page__top">

        <div>

          <h1 className="staff-page__title">
            Animals
          </h1>

          <p className="staff-page__subtitle">
            View and manage all rescued animals at Pawmilya.
          </p>
        </div>

        <div className="staff-page__date">
          September 30, 2026
          <br />
          Monday, 9:41 AM
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
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
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
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
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
          onChange={(event) =>
            setHealthFilter(event.target.value)
          }
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
          onChange={(event) =>
            setSortOrder(event.target.value)
          }
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


        <Link
          to="/admin/animals/add"
          className="staff-button"
        >
          <Plus size={13} />
          Add Animal
        </Link>

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

            {filteredPets.map((pet) => (

              <tr key={pet.id}>

                <td>
                  A-{String(pet.id).padStart(3, "0")}
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
                  Sep 26, 2026
                </td>


                <td>
                  <div className="animals__actions">

                    <Link
                      to={`/admin/animals/${pet.id}`}
                      className="animals__view"
                    >
                      View
                    </Link>

                    <button
                      type="button"
                      className="animals__more"
                      aria-label={`More actions for ${pet.name}`}
                    >
                      <MoreVertical size={14} />
                    </button>

                  </div>
                </td>

              </tr>

            ))}

          </tbody>

        </table>


        <div className="staff-pagination">

          <span>
            Showing 1-{filteredPets.length} of {filteredPets.length} animals
          </span>


          <div className="staff-pagination__pages">

            <button type="button">
              <ChevronLeft size={12} />
            </button>

            <button
              type="button"
              className="active"
            >
              1
            </button>

            <button type="button">
              2
            </button>

            <button type="button">
              3
            </button>

            <button type="button">
              4
            </button>

            <button type="button">
              5
            </button>

            <button type="button">
              <ChevronRight size={12} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Animals;