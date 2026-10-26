import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import useFetch from "../../../hooks/useFetch.js";
import { listStaffReports } from "../../../services/missingPetService.js";

import "./MissingPetReports.css";
import BackButton from "../../../components/common/BackButton.jsx";
import SafeImage from "../../../components/common/SafeImage.jsx";
import { reportStatusLabel } from "../../../utils/reportStatusLabel.js";


const REPORTS_PER_PAGE = 9;

// stable empty list while the API call is loading
const NO_REPORTS = [];

const STATUS_OPTIONS = [
  "All",
  "Lost",
  "Rescued",
  "For Adoption",
  "Reunited",
];


function MissingPetReports() {
  const { data: reports } = useFetch(() => listStaffReports(), []);
  const missingPets = reports ?? NO_REPORTS;

  const [search, setSearch] =
    useState("");

  const [type, setType] =
    useState("All");

  const [status, setStatus] =
    useState("All");

  const [sort, setSort] =
    useState("Newest");

  const [currentPage, setCurrentPage] =
    useState(1);


  /* =========================================
     SEARCH + FILTER + SORT
  ========================================= */

  const filteredPets =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();


      const filtered =
        missingPets.filter(
          (pet) => {

            const reportId =
              `MPR-${String(
                pet.id
              ).padStart(
                3,
                "0"
              )}`;


            const searchableText = [
              reportId,
              pet.name,
              pet.breed,
              pet.location,
              pet.type,
              pet.color,
              pet.status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


            const matchesSearch =
              !query ||
              searchableText.includes(
                query
              );


            const matchesType =
              type === "All" ||
              (
                type === "Other"
                  ? ![
                      "Dog",
                      "Cat",
                    ].includes(
                      pet.type
                    )
                  : pet.type ===
                    type
              );


            const matchesStatus =
              status === "All" ||
              pet.status ===
                status;


            return (
              matchesSearch &&
              matchesType &&
              matchesStatus
            );
          }
        );


      return [...filtered].sort(
        (a, b) => {

          if (
            sort === "Oldest"
          ) {
            return (
              getReportedDate(a) -
              getReportedDate(b)
            );
          }


          if (
            sort === "Name A-Z"
          ) {
            return (a.name || "").localeCompare(
              b.name || ""
            );
          }


          if (
            sort === "Name Z-A"
          ) {
            return (b.name || "").localeCompare(
              a.name || ""
            );
          }


          return (
            getReportedDate(b) -
            getReportedDate(a)
          );
        }
      );

    }, [
      missingPets,
      search,
      type,
      status,
      sort,
    ]);


  /* =========================================
     RESET PAGE
  ========================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    type,
    status,
    sort,
  ]);


  /* =========================================
     PAGINATION
  ========================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPets.length /
        REPORTS_PER_PAGE
    )
  );


  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);


  const startIndex =
    (currentPage - 1) *
    REPORTS_PER_PAGE;


  const endIndex =
    Math.min(
      startIndex +
        REPORTS_PER_PAGE,
      filteredPets.length
    );


  const visiblePets =
    filteredPets.slice(
      startIndex,
      endIndex
    );


  return (
    <div className="staff-page missing-admin">
      <BackButton fallback="/admin/dashboard" />


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="staff-page__top">

        <div>


          <h1 className="staff-page__title">
            Missing Pet Reports
          </h1>


          <p className="staff-page__subtitle">
            Review reported pets,
            last-seen information, and
            their current status.
          </p>

        </div>

      </div>


      {/* =====================================
          FILTERS
      ====================================== */}

      <div className="missing-admin__filters">

        <div className="missing-admin__search">

          <Search size={17} />


          <input
            type="text"
            placeholder="Search name, report ID, breed, location, color, or status..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        <select
          value={type}
          onChange={(event) =>
            setType(
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

          <option value="Other">
            Other
          </option>
        </select>


        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >

          {STATUS_OPTIONS.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option === "All"
                  ? "All Statuses"
                  : reportStatusLabel(option)}
              </option>
            )
          )}

        </select>


        <select
          value={sort}
          onChange={(event) =>
            setSort(
              event.target.value
            )
          }
        >
          <option value="Newest">
            Newest First
          </option>

          <option value="Oldest">
            Oldest First
          </option>

          <option value="Name A-Z">
            Pet Name A-Z
          </option>

          <option value="Name Z-A">
            Pet Name Z-A
          </option>
        </select>

      </div>


      {/* =====================================
          TABLE
      ====================================== */}

      <div className="missing-admin__table-card">

        <div className="missing-admin__table-heading">

          <div>

            <strong>
              Report Records
            </strong>


            <span>
              {filteredPets.length}{" "}
              {filteredPets.length === 1
                ? "report"
                : "reports"}{" "}
              found
            </span>

          </div>


          <span>
            Page {currentPage} of{" "}
            {totalPages}
          </span>

        </div>


        <div className="missing-admin__table-wrap">

          <table className="staff-table missing-admin__table">

            <thead>

              <tr>

                <th>
                  Report ID
                </th>

                <th>
                  Photo
                </th>

                <th>
                  Pet
                </th>

                <th>
                  Type
                </th>

                <th>
                  Last Seen
                </th>

                <th>
                  Reported
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {visiblePets.length >
              0 ? (

                visiblePets.map(
                  (pet) => {

                    const reportId =
                      `MPR-${String(
                        pet.id
                      ).padStart(
                        3,
                        "0"
                      )}`;


                    const photo =
                      pet.petImages?.[0] ||
                      pet.image;


                    return (
                      <tr key={pet.id}>

                        <td>

                          <strong className="missing-admin__report-id">
                            {reportId}
                          </strong>

                        </td>


                        <td>

                          <div className="missing-admin__photo">

                            {photo ? (
                              <SafeImage type={pet.type}
                                src={photo}
                                alt={pet.name}
                              />
                            ) : (
                              <span>
                                Pet
                              </span>
                            )}

                          </div>

                        </td>


                        <td>

                          <div className="missing-admin__pet">

                            <strong>
                              {pet.name}
                            </strong>

                            <span>
                              {pet.breed || "Breed not given"}
                            </span>

                          </div>

                        </td>


                        <td>
                          {pet.type}
                        </td>


                        <td>

                          <div className="missing-admin__last-seen">

                            <strong>
                              {pet.location}
                            </strong>

                            <span>
                              {formatTimestamp(
                                pet.lastSeen
                              )}
                            </span>

                          </div>

                        </td>


                        <td>
                          {formatTimestamp(
                            pet.reportedAt
                          )}
                        </td>


                        <td>

                          <StatusBadge
                            status={
                              pet.status
                            }
                          />

                        </td>


                        <td>

                          <Link
                            to={`/admin/missing-pets/${pet.id}`}
                            className="missing-admin__review"
                          >
                            Review
                          </Link>

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="missing-admin__empty"
                  >
                    <strong>
                      No reports found
                    </strong>

                    <span>
                      Try changing your
                      search or filters.
                    </span>
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* =====================================
            NUMBERED PAGINATION
        ====================================== */}

        <div className="missing-admin__pagination">

          <span>

            {filteredPets.length > 0
              ? `Showing ${
                  startIndex + 1
                }-${endIndex} of ${
                  filteredPets.length
                } reports`
              : "Showing 0 reports"}

          </span>


          <div className="missing-admin__pages">

            <button
              type="button"
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
              aria-label="Previous page"
            >
              <ChevronLeft
                size={14}
              />
            </button>


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
                  currentPage ===
                  page
                    ? "active"
                    : ""
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


            <button
              type="button"
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
              aria-label="Next page"
            >
              <ChevronRight
                size={14}
              />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================
   STATUS
========================================= */

function StatusBadge({
  status,
}) {
  const className =
    status
      ?.toLowerCase()
      .replaceAll(
        " ",
        "-"
      );


  return (
    <span
      className={`missing-admin__status missing-admin__status--${className}`}
    >
      {reportStatusLabel(status)}
    </span>
  );
}


/* =========================================
   DATE
========================================= */

function getReportedDate(pet) {
  const date =
    new Date(
      pet.reportedAt
    );


  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : date.getTime();
}


function formatTimestamp(value) {
  if (!value) {
    return "Not specified";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not specified";
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


export default MissingPetReports;