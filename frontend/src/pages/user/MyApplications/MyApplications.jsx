import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { X } from "lucide-react";

import useFetch from "../../../hooks/useFetch.js";
import { listMyApplications } from "../../../services/adoptionService.js";
import usePoundInfo from "../../../hooks/usePoundInfo.js";

import myApplicationsHero from "../../../assets/images/users/home/MyApplications-hero.jpg";

import "./MyApplications.css";
import BackButton from "../../../components/common/BackButton.jsx";
import SafeImage from "../../../components/common/SafeImage.jsx";
import Modal from "../../../components/common/Modal.jsx";

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"];

// "Unnamed dog" for an animal without a name, so a heading is never blank
function petLabel(application) {
  const name = typeof application.petName === "string" ? application.petName.trim() : "";

  return name || `Unnamed ${(application.type || "pet").toLowerCase()}`;
}

// What an approved applicant sees: the good news, what happens next and how to reach the pound
function ApprovedDetails({ application, onClose }) {
  const pound = usePoundInfo();

  return (
    <Modal isOpen onClose={onClose} title="Adoption approved" size="medium">
      <div className="my-applications__approved">

        <div className="my-applications__approved-pet">
          <div className="my-applications__approved-photo">
            <SafeImage type={application.type} src={application.image} alt={petLabel(application)} />
          </div>

          <div>
            <strong>{petLabel(application)}</strong>
            <p>{application.type} · {application.breed}</p>
          </div>
        </div>

        <h3 className="my-applications__approved-title">Congratulations!</h3>

        <p>
          Your adoption application was approved
          {application.approvedAt ? ` on ${application.approvedAt}` : ""}.
        </p>

        <section className="my-applications__approved-card">
          <h4>What happens next?</h4>

          <ol>
            <li>
              The pound will contact you
              {application.phone ? ` at ${application.phone}` : ""} to arrange the pick-up.
            </li>
            <li>
              Once the application has been approved, another surprise visit happens in a span of
              3 months.
            </li>
          </ol>
        </section>

        <section className="my-applications__approved-card">
          <h4>{pound.name}</h4>

          <ul>
            {pound.address && <li>{pound.address}</li>}
            {pound.phone && <li>{pound.phone}</li>}
            {pound.hours && <li>{pound.hours}</li>}
          </ul>
        </section>

      </div>
    </Modal>
  );
}

function MyApplications() {
  // set by the Adoption Application page right after a successful submit
  const submittedPet = useLocation().state?.submittedPet;

  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedPet, setExpandedPet] = useState(null);
  const [approvedDetails, setApprovedDetails] = useState(null);

  const { data, loading } = useFetch(() => listMyApplications(), []);
  const applications = data ?? [];

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
      <div className="page-back">
        <BackButton fallback="/" />
      </div>

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
        {submittedPet && (
          <p className="my-applications__notice" role="status">
            Your application for {submittedPet} was submitted and is now pending review.
          </p>
        )}

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
                aria-label={`View full image of ${petLabel(application)}`}
              >
                {application.image ? (
                  <SafeImage type={application.type} src={application.image} alt={petLabel(application)} />
                ) : (
                  <span>Pet Image</span>
                )}
              </button>

              <div className="my-applications__pet">
                <h2>{petLabel(application)}</h2>

                <p>
                  {application.type} · {application.breed}
                </p>

                {application.status === "Pending" && (
                  <p className="my-applications__id-status">
                    Valid ID:{" "}
                    {application.idVerificationStatus === "Verified"
                      ? "Verified"
                      : "Under review"}
                  </p>
                )}
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

              {application.status === "Pending" && (
                <Link
                  to={`/adoptable-pets/${application.petId}`}
                  className="my-applications__view"
                >
                  View Pet
                </Link>
              )}

              {application.status === "Approved" && (
                <button
                  type="button"
                  className="my-applications__view"
                  onClick={() => setApprovedDetails(application)}
                >
                  View Details
                </button>
              )}

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

          {loading && (
            <p className="my-applications__empty">Loading your applications...</p>
          )}

          {!loading && filteredApplications.length === 0 && (
            <p className="my-applications__empty">
              No applications found for this status.
            </p>
          )}
        </div>
      </section>

      {/* APPROVED: details and what happens next */}

      {approvedDetails && (
        <ApprovedDetails
          application={approvedDetails}
          onClose={() => setApprovedDetails(null)}
        />
      )}

      {/* EXPANDED IMAGE */}

      {expandedPet && (
        <div
          className="my-applications__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${petLabel(expandedPet)} full image`}
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
              <SafeImage src={expandedPet.image} alt={petLabel(expandedPet)} />
            ) : (
              <div className="my-applications__lightbox-placeholder">
                Pet Image
              </div>
            )}

            <p>{petLabel(expandedPet)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyApplications;