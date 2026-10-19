import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clipboard,
  Clock3,
  Download,
  Eye,
  MoreVertical,
  Search,
  Users,
} from "lucide-react";

import applications from "../../../data/applications.js";

import "./AdoptionApplications.css";


const APPLICATIONS_PER_PAGE = 10;


function AdoptionApplications() {
  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [sort, setSort] =
    useState("Newest");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [copiedId, setCopiedId] =
    useState(null);


  /* =========================================
     SUMMARY COUNTS
  ========================================= */

  const summary = useMemo(() => {
    return {
      total:
        applications.length,

      pending:
        applications.filter(
          (application) =>
            application.status === "Pending"
        ).length,

      approved:
        applications.filter(
          (application) =>
            application.status === "Approved"
        ).length,

      rejected:
        applications.filter(
          (application) =>
            application.status === "Rejected"
        ).length,
    };
  }, []);


  /* =========================================
     SEARCH + FILTER + SORT
  ========================================= */

  const filteredApplications =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();


      const filtered =
        applications.filter(
          (application) => {

            const applicationId =
              `MPR-${String(
                application.id
              ).padStart(
                3,
                "0"
              )}`;


            const searchableText = [
              applicationId,
              application.applicantName,
              application.petName,
              application.petType,
              application.petLocation,
              application.status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


            const matchesSearch =
              !query ||
              searchableText.includes(
                query
              );


            const matchesStatus =
              status === "All" ||
              application.status ===
                status;


            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );


      return [...filtered].sort(
        (a, b) => {

          if (
            sort ===
            "Applicant A-Z"
          ) {
            return a.applicantName.localeCompare(
              b.applicantName
            );
          }


          if (
            sort ===
            "Applicant Z-A"
          ) {
            return b.applicantName.localeCompare(
              a.applicantName
            );
          }


          if (
            sort ===
            "Pet A-Z"
          ) {
            return a.petName.localeCompare(
              b.petName
            );
          }


          if (
            sort ===
            "Oldest"
          ) {
            return (
              getApplicationDate(a) -
              getApplicationDate(b)
            );
          }


          return (
            getApplicationDate(b) -
            getApplicationDate(a)
          );
        }
      );

    }, [
      search,
      status,
      sort,
    ]);


  /* =========================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================= */

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [
    search,
    status,
    sort,
  ]);


  /* =========================================
     PAGINATION
  ========================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredApplications.length /
        APPLICATIONS_PER_PAGE
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
    APPLICATIONS_PER_PAGE;


  const endIndex =
    Math.min(
      startIndex +
        APPLICATIONS_PER_PAGE,
      filteredApplications.length
    );


  const visibleApplications =
    filteredApplications.slice(
      startIndex,
      endIndex
    );


  /* =========================================
     EXPORT
  ========================================= */

  const handleExport = () => {
    if (
      filteredApplications.length ===
      0
    ) {
      return;
    }


    const headings = [
      "Application ID",
      "Applicant",
      "Pet Name",
      "Pet Type",
      "Location",
      "Date Submitted",
      "Status",
    ];


    const rows =
      filteredApplications.map(
        (application) => [
          `MPR-${String(
            application.id
          ).padStart(
            3,
            "0"
          )}`,

          application.applicantName,
          application.petName,
          application.petType,
          application.petLocation,
          application.date,
          application.status,
        ]
      );


    const csv = [
      headings,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(
              value ?? ""
            ).replaceAll(
              '"',
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href = url;

    link.download =
      "pawmilya-adoption-applications.csv";


    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );
  };


  /* =========================================
     COPY APPLICATION ID
  ========================================= */

  const copyApplicationId =
    async (application) => {

      const id =
        `MPR-${String(
          application.id
        ).padStart(
          3,
          "0"
        )}`;


      try {
        await navigator.clipboard.writeText(
          id
        );

        setCopiedId(
          application.id
        );


        setTimeout(() => {
          setCopiedId(null);
        }, 1500);

      } catch {
        setCopiedId(null);
      }


      setOpenMenuId(null);
    };


  return (
    <div className="staff-page adoption-applications">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="staff-page__top">

        <div>



          <h1 className="staff-page__title">
            Adoption Applications
          </h1>


          <p className="staff-page__subtitle">
            Review adoption applications,
            assess potential adopters, and
            manage application decisions.
          </p>

        </div>


        <button
          type="button"
          className="adoption-applications__export"
          onClick={handleExport}
          disabled={
            filteredApplications.length ===
            0
          }
        >
          <Download size={15} />

          Export Applications
        </button>

      </div>


      {/* =====================================
          SUMMARY
      ====================================== */}

      <div className="adoption-applications__summary">

        <SummaryCard
          icon={
            <Users size={18} />
          }
          label="Total Applications"
          value={summary.total}
        />


        <SummaryCard
          icon={
            <Clock3 size={18} />
          }
          label="Pending Review"
          value={summary.pending}
          variant="pending"
        />


        <SummaryCard
          icon={
            <CircleCheck size={18} />
          }
          label="Approved"
          value={summary.approved}
          variant="approved"
        />


        <SummaryCard
          icon={
            <CircleX size={18} />
          }
          label="Rejected"
          value={summary.rejected}
          variant="rejected"
        />

      </div>


      {/* =====================================
          SEARCH + FILTERS
      ====================================== */}

      <div className="adoption-applications__filter-card">

        <div className="adoption-applications__search">

          <Search size={16} />

          <input
            type="text"
            placeholder="Search applicant, pet, application ID, type, or location..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


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

          <option value="Pending">
            Pending
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Rejected">
            Rejected
          </option>
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

          <option value="Applicant A-Z">
            Applicant A-Z
          </option>

          <option value="Applicant Z-A">
            Applicant Z-A
          </option>

          <option value="Pet A-Z">
            Pet Name A-Z
          </option>
        </select>

      </div>


      {/* =====================================
          TABLE CARD
      ====================================== */}

      <div className="adoption-applications__table-card">

        <div className="adoption-applications__table-header">

          <div>

            <strong>
              Application Records
            </strong>

            <span>
              {filteredApplications.length}{" "}
              {filteredApplications.length === 1
                ? "application"
                : "applications"}{" "}
              found
            </span>

          </div>

        </div>


        <div className="adoption-applications__table-wrap">

          <table className="staff-table adoption-applications__table">

            <thead>

              <tr>

                <th>
                  Application
                </th>

                <th>
                  Applicant
                </th>

                <th>
                  Pet
                </th>

                <th>
                  Location
                </th>

                <th>
                  Submitted
                </th>

                <th>
                  Status
                </th>

                <th className="adoption-applications__actions-heading">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {visibleApplications.length >
              0 ? (

                visibleApplications.map(
                  (application) => {

                    const applicationId =
                      `MPR-${String(
                        application.id
                      ).padStart(
                        3,
                        "0"
                      )}`;


                    return (
                      <tr
                        key={
                          application.id
                        }
                      >

                        {/* ID */}

                        <td>

                          <div className="adoption-applications__id">

                            <span className="adoption-applications__id-icon">
                              <Clipboard
                                size={14}
                              />
                            </span>


                            <div>

                              <strong>
                                {
                                  applicationId
                                }
                              </strong>

                              <span>
                                Adoption
                                Application
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* APPLICANT */}

                        <td>

                          <div className="adoption-applications__applicant">

                            <span className="adoption-applications__avatar">
                              {getInitials(
                                application.applicantName
                              )}
                            </span>


                            <strong>
                              {
                                application.applicantName
                              }
                            </strong>

                          </div>

                        </td>


                        {/* PET */}

                        <td>

                          <div className="adoption-applications__pet">

                            <strong>
                              {
                                application.petName
                              }
                            </strong>

                            <span>
                              {
                                application.petType
                              }
                            </span>

                          </div>

                        </td>


                        {/* LOCATION */}

                        <td>
                          {
                            application.petLocation
                          }
                        </td>


                        {/* DATE */}

                        <td>
                          {
                            application.date
                          }
                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`staff-status ${
                              application.status ===
                              "Approved"
                                ? "staff-status--approved"
                                : application.status ===
                                  "Rejected"
                                ? "staff-status--rejected"
                                : "staff-status--pending"
                            }`}
                          >
                            {
                              application.status
                            }
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="adoption-applications__actions">

                            <Link
                              to={`/admin/adoption-applications/${application.id}`}
                              className="adoption-applications__review"
                            >
                              Review
                            </Link>


                            <div className="adoption-applications__more">

                              <button
                                type="button"
                                className="adoption-applications__more-button"
                                aria-label={`More actions for ${applicationId}`}
                                aria-expanded={
                                  openMenuId ===
                                  application.id
                                }
                                onClick={() =>
                                  setOpenMenuId(
                                    (
                                      current
                                    ) =>
                                      current ===
                                      application.id
                                        ? null
                                        : application.id
                                  )
                                }
                              >
                                <MoreVertical
                                  size={15}
                                />
                              </button>


                              {openMenuId ===
                                application.id && (

                                <div className="adoption-applications__menu">

                                  <Link
                                    to={`/admin/adoption-applications/${application.id}`}
                                    onClick={() =>
                                      setOpenMenuId(
                                        null
                                      )
                                    }
                                  >
                                    <Eye
                                      size={
                                        13
                                      }
                                    />

                                    View Application
                                  </Link>


                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyApplicationId(
                                        application
                                      )
                                    }
                                  >
                                    {copiedId ===
                                    application.id ? (
                                      <Check
                                        size={
                                          13
                                        }
                                      />
                                    ) : (
                                      <Clipboard
                                        size={
                                          13
                                        }
                                      />
                                    )}

                                    {copiedId ===
                                    application.id
                                      ? "Copied"
                                      : "Copy Application ID"}
                                  </button>

                                </div>

                              )}

                            </div>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="adoption-applications__empty"
                  >

                    <div className="adoption-applications__empty-icon">
                      <Search
                        size={22}
                      />
                    </div>


                    <strong>
                      No applications found
                    </strong>


                    <span>
                      Try changing your search
                      or selected status.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* =====================================
                PAGINATION
            ===================================== */}

            <div className="adoption-applications__pagination">

              <span>
                {filteredApplications.length > 0
                  ? `Showing ${
                      startIndex + 1
                    }-${endIndex} of ${
                      filteredApplications.length
                    } applications`
                  : "Showing 0 applications"}
              </span>


              <div className="adoption-applications__pages">

                {/* PREVIOUS */}

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                    )
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft size={13} />
                </button>


                {/* PAGE NUMBERS */}

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    type="button"
                    key={page}
                    className={
                      currentPage === page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>

                ))}


                {/* NEXT */}

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                    )
                  }
                  aria-label="Next page"
                >
                  <ChevronRight size={13} />
                </button>

              </div>

            </div>

      </div>

    </div>
  );
}


/* =========================================
   SUMMARY CARD
========================================= */

function SummaryCard({
  icon,
  label,
  value,
  variant = "default",
}) {
  return (
    <div
      className={`adoption-applications__summary-card adoption-applications__summary-card--${variant}`}
    >

      <div className="adoption-applications__summary-icon">
        {icon}
      </div>


      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


/* =========================================
   INITIALS
========================================= */

function getInitials(name) {
  if (!name) {
    return "?";
  }


  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) =>
        word.charAt(0)
    )
    .join("")
    .toUpperCase();
}


/* =========================================
   DATE SORT
========================================= */

function getApplicationDate(
  application
) {
  if (!application.date) {
    return application.id;
  }


  const parsed =
    new Date(
      application.date
    );


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return application.id;
  }


  return parsed.getTime();
}


export default AdoptionApplications;