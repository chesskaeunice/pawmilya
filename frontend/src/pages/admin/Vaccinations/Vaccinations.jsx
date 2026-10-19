import {
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
} from "lucide-react";

import pets from "../../../data/pets.js";
import initialVaccinations from "../../../data/vaccinations.js";

import "./Vaccinations.css";

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

function Vaccinations() {
  const [records, setRecords] =
    useState(initialVaccinations);

  const [selectedPetId, setSelectedPetId] =
    useState("");

  const [vaccine, setVaccine] =
    useState("");

  const [date, setDate] =
    useState("");

  const [search, setSearch] =
    useState("");

  const selectedPet = pets.find(
    (pet) =>
      pet.id === Number(selectedPetId)
  );

  const vaccineOptions =
    selectedPet?.type === "Cat"
      ? catVaccines
      : dogVaccines;

  const filteredRecords =
    useMemo(() => {
      const query =
        search.toLowerCase();

      return records.filter(
        (record) =>
          record.petName
            .toLowerCase()
            .includes(query) ||
          record.vaccine
            .toLowerCase()
            .includes(query)
      );
    }, [records, search]);

  const handleAdd = () => {
    if (
      !selectedPet ||
      !vaccine ||
      !date
    ) {
      return;
    }

    setRecords((current) => [
      ...current,
      {
        id:
          current.length + 1,
        petId: selectedPet.id,
        petName:
          selectedPet.name,
        petType:
          selectedPet.type,
        vaccine,
        date,
        nextDue: "To be set",
        status: "Up to date",
      },
    ]);

    setVaccine("");
    setDate("");
  };

  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Vaccinations
          </p>

          <h1 className="staff-page__title">
            Vaccinations
          </h1>

          <p className="staff-page__subtitle">
            Manage and track vaccination records for animals in Pawmilya.
          </p>
        </div>
      </div>

      <section className="vaccinations__add">
        <select
          value={selectedPetId}
          onChange={(event) => {
            setSelectedPetId(
              event.target.value
            );

            setVaccine("");
          }}
        >
          <option value="">
            Select animal
          </option>

          {pets.map((pet) => (
            <option
              key={pet.id}
              value={pet.id}
            >
              {pet.name} · {pet.type}
            </option>
          ))}
        </select>

        <select
          value={vaccine}
          disabled={!selectedPet}
          onChange={(event) =>
            setVaccine(
              event.target.value
            )
          }
        >
          <option value="">
            Vaccine type
          </option>

          {vaccineOptions.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>

        <input
          type="date"
          value={date}
          onChange={(event) =>
            setDate(event.target.value)
          }
        />

        <button
          type="button"
          className="staff-button"
          onClick={handleAdd}
        >
          <Plus size={13} />
          Add Record
        </button>
      </section>

      <div className="staff-filters vaccinations__filters">
        <input
          type="text"
          placeholder="Search by name, ID, or vaccine type..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select>
          <option>
            All Animal Types
          </option>

          <option>Dogs</option>
          <option>Cats</option>
        </select>

        <select>
          <option>
            All Statuses
          </option>

          <option>
            Up to date
          </option>

          <option>
            Due Soon
          </option>

          <option>
            Overdue
          </option>
        </select>

        <select>
          <option>
            Newest First
          </option>
        </select>
      </div>

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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.map(
              (record) => (
                <tr key={record.id}>
                  <td>
                    VAC-
                    {String(
                      record.id
                    ).padStart(3, "0")}
                  </td>

                  <td>
                    <div className="staff-table__photo">
                      Photo
                    </div>
                  </td>

                  <td>
                    <strong>
                      {record.petName}
                    </strong>
                  </td>

                  <td>
                    {record.petType}
                  </td>

                  <td>
                    {record.vaccine}
                  </td>

                  <td>
                    {record.date}
                  </td>

                  <td>
                    {record.nextDue}
                  </td>

                  <td>
                    <span
                      className={`staff-status ${
                        record.status ===
                        "Overdue"
                          ? "staff-status--overdue"
                          : record.status ===
                            "Due Soon"
                          ? "staff-status--due"
                          : "staff-status--current"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td>
                    <button className="vaccinations__more">
                      <MoreVertical
                        size={14}
                      />
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        <div className="staff-pagination">
          <span>
            Showing 1-
            {filteredRecords.length} of{" "}
            {filteredRecords.length} animals
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

export default Vaccinations;