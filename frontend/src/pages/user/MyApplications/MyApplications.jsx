import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { X } from "lucide-react";

import applications from "../../../data/applications.js";

import myApplicationsHero from "../../../assets/images/users/home/MyApplications-hero.jpg";

import "./MyApplications.css";

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"];

function MyApplications() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedPet, setExpandedPet] = useState(null);

  const filteredApplications = applications.filter((application) =>
    statusFilter === "All" ? true : application.status === statusFilter
  );

  /* Close the expanded image with the Escape key */
  useEffect(() => {
    if (!expandedPet) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setExpandedPet(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedPet]);

  return (
    <div className="my-applications">
      {/* HERO */}

      <section className="my-applications__header">
        <img
          src={myApplicationsHero}
          alt=""
          className="my-applications__hero-image"
        />

        <div className="my-applications__hero-overlay" aria-hidden="true" />

        <div className="my-applications__header-inner">
          <p className="my-applications__eyebrow">My Applications</p>

          <h1>Your Adoption Applications</h1>

          <p className="my-applications__hero-description">
            View submitted adoption requests and track their current status.
          </p>
        </div>
      </section>

      <section className="my-applications__container">
        {/* FILTERS */}

        <div className="my-applications__filters">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? "my-applications__filter my-applications__filter--active"
                  : "my-applications__filter"
              }
            >
              {status}
            </button>
          ))}
        </div>

        {/* LIST */}

        <div className="my-applications__list">
          {filteredApplications.map((application) => (
            <article className="my-applications__card" key={application.id}>
              <button
                type="button"
                className="my-applications__image"
                onClick={() => setExpandedPet(application)}
                aria-label={`View full image of ${application.petName}`}
              >
                {application.image ? (
                  <img src={application.image} alt={application.petName} />
                ) : (
                  <span>Pet Image</span>
                )}
              </button>

              <div className="my-applications__pet">
                <h2>{application.petName}</h2>

                <p>
                  {application.type} · {application.breed}
                </p>
              </div>

              <div className="my-applications__date">
                <span>Application Date</span>

                <strong>{application.date}</strong>
              </div>

              <div className="my-applications__status">
                <span
                  className={`status status--${application.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {application.status}
                </span>
              </div>

              <Link
                to={`/adoptable-pets/${application.petId}`}
                className="my-applications__view"
              >
                View Pet
              </Link>

              {application.status === "Rejected" && (
                <div className="my-applications__reason">
                  <strong>Reason for rejection</strong>

                  <p>
                    {application.rejectionReason ||
                      "No reason was provided."}
                  </p>
                </div>
              )}
            </article>
          ))}

          {filteredApplications.length === 0 && (
            <p className="my-applications__empty">
              No applications found for this status.
            </p>
          )}
        </div>
      </section>

      {/* EXPANDED IMAGE */}

      {expandedPet && (
        <div
          className="my-applications__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${expandedPet.petName} full image`}
          onClick={() => setExpandedPet(null)}
        >
          <button
            type="button"
            className="my-applications__lightbox-close"
            onClick={() => setExpandedPet(null)}
            aria-label="Close image"
          >
            <X size={22} />
          </button>

          <div
            className="my-applications__lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            {expandedPet.image ? (
              <img src={expandedPet.image} alt={expandedPet.petName} />
            ) : (
              <div className="my-applications__lightbox-placeholder">
                Pet Image
              </div>
            )}

            <p>{expandedPet.petName}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyApplications;