import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
} from "lucide-react";

import applications from "../../../data/applications.js";

import "./AdoptionApplications.css";

function AdoptionApplications() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Newest");

  const filteredApplications = applications
    .filter((application) => {
      const query = search.toLowerCase();

      const matchesSearch =
        application.applicantName
          .toLowerCase()
          .includes(query) ||
        application.petName
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "All" ||
        application.status === status;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sort === "Applicant A-Z") {
        return a.applicantName.localeCompare(
          b.applicantName
        );
      }

      return b.id - a.id;
    });

  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Adoption Applications
          </p>

          <h1 className="staff-page__title">
            Applications
          </h1>

          <p className="staff-page__subtitle">
            Review and manage adoption applications submitted to Pawmilya.
          </p>
        </div>

        <button
          type="button"
          className="staff-button staff-button--outline"
        >
          <Download size={13} />
          Export Applications
        </button>
      </div>

      <div className="staff-filters adoption-applications__filters">
        <input
          type="text"
          placeholder="Search applicant or pet..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
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
            setSort(event.target.value)
          }
        >
          <option value="Newest">
            Newest First
          </option>

          <option value="Applicant A-Z">
            Applicant A-Z
          </option>
        </select>
      </div>

      <div className="staff-table-card">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Applicant</th>
              <th>Pet Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredApplications.map(
              (application) => (
                <tr key={application.id}>
                  <td>
                    MPR-
                    {String(
                      application.id
                    ).padStart(3, "0")}
                  </td>

                  <td>
                    <strong>
                      {
                        application.applicantName
                      }
                    </strong>
                  </td>

                  <td>
                    {application.petName}
                  </td>

                  <td>
                    {application.petType}
                  </td>

                  <td>
                    {application.petLocation}
                  </td>

                  <td>
                    {application.date}
                  </td>

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
                      {application.status}
                    </span>
                  </td>

                  <td>
                    <div className="adoption-applications__actions">
                      <Link
                        to={`/admin/adoption-applications/${application.id}`}
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        aria-label="More actions"
                      >
                        <MoreVertical
                          size={14}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        <div className="staff-pagination">
          <span>
            Showing 1-
            {filteredApplications.length} of{" "}
            {filteredApplications.length} applications
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

export default AdoptionApplications;