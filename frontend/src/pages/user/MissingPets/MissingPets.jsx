import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
} from "lucide-react";

import missingPets from "../../../data/missingPets.js";

import SearchBar from "../../../components/common/SearchBar.jsx";
import { displayPetName } from "../../../utils/petName.js";
import { matchesPetSearch } from "../../../utils/liveSearch.js";
import StatusHelp from "../../../components/common/StatusHelp/StatusHelp.jsx";

import missingPetsHero from "../../../assets/images/users/missing-pets/missing-pets-hero.jpg";

import "./MissingPets.css";


const PETS_PER_PAGE = 9;

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


const statusDescriptions = {
  Lost:
    "This pet is currently missing and the owner is actively searching.",

  Sighted:
    "This pet has recently been seen in a reported location, but has not yet been safely found.",

  Found:
    "This pet has been found and is currently being kept safe.",

  Reunited:
    "This pet has successfully been returned to its family.",

  Adopted:
    "This pet has already been placed with a new family.",

  Transfer:
    "This pet has been transferred to another shelter or facility.",

  Adoptable:
    "This pet is currently available for adoption.",
};


function MissingPets() {
  // live search: the grid filters on every keystroke
  const [search, setSearch] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  const [animalType, setAnimalType] =
    useState("All");

  const [status, setStatus] =
    useState("All");

  const [dateRange, setDateRange] =
    useState("All");

  const [nameLetter, setNameLetter] =
    useState("All");

  const [customFrom, setCustomFrom] =
    useState("");

  const [customTo, setCustomTo] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);


  /* =========================================
     SEARCH + FILTER + A-Z SORTING
  ========================================= */

  const filteredPets = useMemo(() => {
    return missingPets

      .filter((pet) => {
        /* SEARCH: name, breed or species */

        const matchesSearch =
          matchesPetSearch(pet, search);


        /* ANIMAL TYPE */

        const matchesAnimalType =
          animalType === "All" ||
          (
            animalType === "Others"
              ? ![
                  "Dog",
                  "Cat",
                ].includes(pet.type)
              : pet.type === animalType
          );


        /* STATUS */

        const matchesStatus =
          status === "All" ||
          pet.status === status;


        /* ALPHABET */

        const matchesNameLetter =
          nameLetter === "All" ||
          (pet.name || "")
            .trim()
            .toUpperCase()
            .startsWith(nameLetter);


        /* DATE */

        const reportedDate =
          getReportedDate(pet);

        let matchesDate = true;


        /* LAST 24 HOURS */

        if (
          reportedDate &&
          dateRange === "24hours"
        ) {
          const cutoff =
            new Date();

          cutoff.setHours(
            cutoff.getHours() - 24
          );

          matchesDate =
            reportedDate >= cutoff;
        }


        /* PAST WEEK */

        if (
          reportedDate &&
          dateRange === "week"
        ) {
          const cutoff =
            new Date();

          cutoff.setDate(
            cutoff.getDate() - 7
          );

          matchesDate =
            reportedDate >= cutoff;
        }


        /* CUSTOM DATE RANGE */

        if (
          reportedDate &&
          dateRange === "custom"
        ) {
          if (customFrom) {
            const fromDate =
              new Date(
                `${customFrom}T00:00:00`
              );

            matchesDate =
              matchesDate &&
              reportedDate >= fromDate;
          }


          if (customTo) {
            const toDate =
              new Date(
                `${customTo}T23:59:59`
              );

            matchesDate =
              matchesDate &&
              reportedDate <= toDate;
          }
        }


        return (
          matchesSearch &&
          matchesAnimalType &&
          matchesStatus &&
          matchesNameLetter &&
          matchesDate
        );
      })


      /* ALPHABETICAL A-Z */

      .sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || "",
          undefined,
          {
            sensitivity: "base",
          }
        )
      );

  }, [
    search,
    animalType,
    status,
    dateRange,
    nameLetter,
    customFrom,
    customTo,
  ]);


  /* =========================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    animalType,
    status,
    dateRange,
    nameLetter,
    customFrom,
    customTo,
  ]);


  /* =========================================
     PAGINATION
  ========================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPets.length /
        PETS_PER_PAGE
    )
  );


  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);


  const startIndex =
    (currentPage - 1) *
    PETS_PER_PAGE;


  const visiblePets =
    filteredPets.slice(
      startIndex,
      startIndex +
        PETS_PER_PAGE
    );


  /* =========================================
     CLEAR FILTERS
  ========================================= */

  const clearFilters = () => {
    setSearch("");

    setAnimalType("All");

    setStatus("All");

    setDateRange("All");

    setNameLetter("All");

    setCustomFrom("");

    setCustomTo("");

    setCurrentPage(1);
  };


  const hasActiveFilters =
    search !== "" ||
    animalType !== "All" ||
    status !== "All" ||
    dateRange !== "All" ||
    nameLetter !== "All";


  return (
    <div className="missing-pets">

      {/* =====================================
          HERO
      ====================================== */}

      <section className="missing-pets__header">

        <img
          src={missingPetsHero}
          alt=""
          className="missing-pets__hero-image"
        />


        <div
          className="missing-pets__hero-overlay"
          aria-hidden="true"
        />


        <div className="missing-pets__header-inner">

          <div className="missing-pets__hero-content">

            <p className="missing-pets__eyebrow">
              Missing Pets
            </p>


            <h1>
              Help Bring Them Home
            </h1>


            <p className="missing-pets__hero-description">
              Browse reported missing pets
              and help reunite them with
              their families.
            </p>


            <Link
              to="/missing-pets/report"
              className="missing-pets__report"
            >
              Report Missing Pet
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <section className="missing-pets__container">

        {/* SEARCH */}

        <div className="missing-pets__search-row">

          <SearchBar
            value={search}
            onChange={(value) => {
              // back to page 1 in the same update, so the grid never flickers
              setSearch(value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSearch("");
              setCurrentPage(1);
            }}
            placeholder="Search by name, breed or species"
            label="Search missing pets"
          />


          {/* FILTER BUTTON */}

          <button
            type="button"
            className={
              `missing-pets__filter-button ${
                showFilters
                  ? "missing-pets__filter-button--active"
                  : ""
              }`
            }
            onClick={() =>
              setShowFilters(
                (current) =>
                  !current
              )
            }
          >
            <Filter size={17} />

            Filters


            {hasActiveFilters && (
              <span className="missing-pets__filter-indicator" />
            )}

          </button>

        </div>


        {/* =====================================
            FILTER PANEL
        ====================================== */}

        {showFilters && (
          <div className="missing-pets__filter-panel">

            {/* ANIMAL TYPE */}

            <div className="missing-pets__filter-field">

              <label>
                Animal Type
              </label>


              <select
                value={animalType}
                onChange={(event) =>
                  setAnimalType(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Animals
                </option>

                <option value="Dog">
                  Dog
                </option>

                <option value="Cat">
                  Cat
                </option>

                <option value="Others">
                  Others
                </option>
              </select>

            </div>


            {/* DATE RANGE */}

            <div className="missing-pets__filter-field">

              <label>
                Date Range
              </label>


              <select
                value={dateRange}
                onChange={(event) =>
                  setDateRange(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  Any Time
                </option>

                <option value="24hours">
                  Last 24 Hours
                </option>

                <option value="week">
                  Past Week
                </option>

                <option value="custom">
                  Custom Range
                </option>
              </select>

            </div>


            {/* STATUS */}

            <div className="missing-pets__filter-field">

              <label>
                Status
              </label>


              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="Lost">
                  Lost
                </option>

                <option value="Sighted">
                  Sighted
                </option>

                <option value="Found">
                  Found
                </option>

                <option value="Reunited">
                  Reunited
                </option>

                <option value="Adopted">
                  Adopted
                </option>

                <option value="Transfer">
                  Transfer
                </option>

                <option value="Adoptable">
                  Adoptable
                </option>
              </select>

            </div>


            {/* CLEAR FILTERS */}

            <button
              type="button"
              className="missing-pets__reset"
              onClick={clearFilters}
            >
              <RotateCcw size={15} />

              Clear Filters
            </button>


            {/* =================================
                ALPHABET FILTER
            ================================== */}

            <div className="missing-pets__alphabet-filter">

              <div className="missing-pets__alphabet-heading">

                <div>

                  <label>
                    Name Starts With
                  </label>


                  <p>
                    Select a letter to show pets
                    whose names begin with it.
                  </p>

                </div>


                {nameLetter !== "All" && (
                  <span className="missing-pets__selected-letter">
                    Showing: {nameLetter}
                  </span>
                )}

              </div>


              <div className="missing-pets__alphabet">

                <button
                  type="button"
                  className={
                    nameLetter === "All"
                      ? "missing-pets__alphabet-button missing-pets__alphabet-button--all missing-pets__alphabet-button--active"
                      : "missing-pets__alphabet-button missing-pets__alphabet-button--all"
                  }
                  onClick={() =>
                    setNameLetter("All")
                  }
                >
                  All
                </button>


                {ALPHABET.map(
                  (letter) => (
                    <button
                      type="button"
                      key={letter}
                      className={
                        nameLetter === letter
                          ? "missing-pets__alphabet-button missing-pets__alphabet-button--active"
                          : "missing-pets__alphabet-button"
                      }
                      onClick={() =>
                        setNameLetter(
                          letter
                        )
                      }
                    >
                      {letter}
                    </button>
                  )
                )}

              </div>

            </div>


            {/* CUSTOM DATE RANGE */}

            {dateRange ===
              "custom" && (
              <div className="missing-pets__custom-range">

                <div>

                  <label>
                    From
                  </label>


                  <input
                    type="date"
                    value={customFrom}
                    onChange={(event) =>
                      setCustomFrom(
                        event.target.value
                      )
                    }
                  />

                </div>


                <div>

                  <label>
                    To
                  </label>


                  <input
                    type="date"
                    value={customTo}
                    onChange={(event) =>
                      setCustomTo(
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>
            )}

          </div>
        )}


        {/* =====================================
            RESULTS HEADER
        ====================================== */}

        <div className="missing-pets__results-header">

          <div>

            <strong>
              Missing Pet Reports
            </strong>


            <span>
              {filteredPets.length}{" "}

              {filteredPets.length === 1
                ? "report"
                : "reports"}{" "}

              found

              {nameLetter !== "All" &&
                ` under "${nameLetter}"`}
            </span>

          </div>


          <span>
            Page {currentPage} of{" "}
            {totalPages}
          </span>

        </div>


        {/* =====================================
            PET CARDS
        ====================================== */}

        {visiblePets.length > 0 ? (

          <div className="missing-pets__grid">

            {visiblePets.map((pet) => (

              <Link
                key={pet.id}
                to={`/missing-pets/${pet.id}`}
                className="missing-pets__card"
              >

                {/* IMAGE */}

                <div className="missing-pets__image">

                  {pet.image ? (
                    <img
                      src={pet.image}
                      alt={displayPetName(pet.name)}
                    />
                  ) : (
                    <span>
                      Pet Image
                    </span>
                  )}

                </div>


                {/* CONTENT */}

                <div className="missing-pets__card-content">

                  {/* NAME + STATUS */}

                  <div className="missing-pets__card-title">

                    <div>

                      <h2>
                        {displayPetName(pet.name)}
                      </h2>


                      <p className="missing-pets__type">
                        {pet.type} ·{" "}
                        {pet.breed}
                      </p>

                    </div>


                    <span
                      className={
                        `missing-pets__status missing-pets__status--${pet.status
                          .toLowerCase()
                          .replaceAll(
                            " ",
                            "-"
                          )}`
                      }
                    >
                      {pet.status}
                    </span>

                  </div>


                  {/* STATUS DESCRIPTION */}

                  <p className="missing-pets__status-description">

                    {statusDescriptions[
                      pet.status
                    ] ||
                      "Status information is available for this report."}

                  </p>


                  {/* PET INFORMATION */}

                  <div className="missing-pets__information">

                    <div>

                      <span>
                        Last Seen
                      </span>


                      <strong>
                        {pet.location}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Color / Markings
                      </span>


                      <strong>
                        {pet.color ||
                          "Not specified"}
                      </strong>

                    </div>

                  </div>


                  {/* =================================
                      CARD FOOTER
                  ================================== */}

                  <div className="missing-pets__card-footer">

                    <div className="missing-pets__reported">

                      <span>
                        Reported
                      </span>


                      <strong>
                        {formatTimestamp(
                          pet.reportedAt
                        )}
                      </strong>

                    </div>


                    <div className="missing-pets__view-details">

                      <span>
                        View Full Details
                      </span>

                      <ChevronRight
                        size={15}
                      />

                    </div>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        ) : (

          /* =====================================
             NO RESULTS
          ====================================== */

          search.trim() ? (

            /* nothing matches the typed search */
            <div className="missing-pets__empty" role="status">

              <h2>
                No pets match your search
              </h2>


              <p>
                Try a different name, breed or species.
              </p>


              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
              >
                Clear search
              </button>

            </div>

          ) : (

          <div className="missing-pets__empty">

            <h2>
              No matching reports found
            </h2>


            <p>
              {nameLetter !== "All"
                ? `There are currently no pet names beginning with "${nameLetter}".`
                : "Try another search or clear the current filters."}
            </p>


            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>

          )

        )}


        {/* =====================================
            PAGINATION
        ====================================== */}

        {totalPages > 1 && (

          <nav
            className="missing-pets__pagination"
            aria-label="Missing pet pages"
          >

            {/* PREVIOUS */}

            <button
              type="button"
              className="missing-pets__page-arrow"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
            >
              <ChevronLeft size={15} />

              Previous
            </button>


            {/* PAGE NUMBERS */}

            <div className="missing-pets__page-numbers">

              {Array.from(
                {
                  length:
                    totalPages,
                },
                (_, index) =>
                  index + 1
              ).map((page) => (

                <button
                  type="button"
                  key={page}
                  className={
                    currentPage === page
                      ? "missing-pets__page-number missing-pets__page-number--active"
                      : "missing-pets__page-number"
                  }
                  onClick={() =>
                    setCurrentPage(
                      page
                    )
                  }
                >
                  {page}
                </button>

              ))}

            </div>


            {/* NEXT */}

            <button
              type="button"
              className="missing-pets__page-arrow"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
            >
              Next

              <ChevronRight
                size={15}
              />
            </button>

          </nav>

        )}

      </section>


      {/* STATUS HELP */}

      <StatusHelp />

    </div>
  );
}


/* =========================================
   DATE HELPERS
========================================= */

function getReportedDate(pet) {
  if (!pet.reportedAt) {
    return null;
  }


  const date =
    new Date(pet.reportedAt);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }


  return date;
}


/* =========================================
   TIMESTAMP FORMAT

   Oct 18, 2026 • 01:47 AM
========================================= */

function formatTimestamp(value) {
  if (!value) {
    return "Date unavailable";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }


  const datePart =
    date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );


  const timePart =
    date.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );


  return `${datePart} • ${timePart}`;
}


export default MissingPets;