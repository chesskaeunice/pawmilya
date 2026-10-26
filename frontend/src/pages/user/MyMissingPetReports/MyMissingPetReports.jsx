import { Link } from "react-router-dom";

import { useState } from "react";

import useFetch from "../../../hooks/useFetch.js";
import { petPlaceholders } from "../../../assets/images/placeholders/index.js";
import { displayPetName } from "../../../utils/petName.js";
import { listMyMissingReports, markMyReportReunited } from "../../../services/missingPetService.js";
import useMyClaims from "../../../hooks/useMyClaims.js";
import { formatDate } from "../../../utils/formatDateTime.js";
import { reportStatusLabel } from "../../../utils/reportStatusLabel.js";
import { formatApiError } from "../../../services/authService.js";

import "./MyMissingPetReports.css";
// status badge: same style as the Missing Pets page (missing-pets__status)
import "../MissingPets/MissingPets.css";
import BackButton from "../../../components/common/BackButton.jsx";
import SafeImage from "../../../components/common/SafeImage.jsx";

// Shown only to logged-in citizens: the route is wrapped in RequireSignIn,
// which opens the sign-in / sign-up prompt for guests.
function MyMissingPetReports() {
  const { data, loading, reload } = useFetch(() => listMyMissingReports(), []);
  const reports = data ?? [];
  const { claims } = useMyClaims();

  // "Mark as Found": the owner has the pet back (only for a report that is still Lost)
  const [busyId, setBusyId] = useState(null);
  const [foundError, setFoundError] = useState("");

  const handleMarkFound = async (pet) => {
    if (!window.confirm(`Mark ${displayPetName(pet.name)} as found? The report will be closed as Reunited.`)) return;

    setBusyId(pet.id);
    setFoundError("");

    try {
      await markMyReportReunited(pet.id);
      reload();
    } catch (err) {
      setFoundError(formatApiError(err).message);
    }

    setBusyId(null);
  };

  return (
    <div className="my-reports">
      <div className="page-back">
        <BackButton fallback="/" />
      </div>


      <section className="my-reports__header">

        <p className="my-reports__eyebrow">
          My Reports
        </p>

        <h1>
          My Missing Pet Reports
        </h1>

        <p>
          View and manage missing pet reports
          submitted through Pawmilya.
        </p>

      </section>


      <section className="my-reports__container">

        {loading && <p>Loading your reports...</p>}

        {!loading && reports.length === 0 && (
          <p>You have not submitted any missing pet reports yet.</p>
        )}

        {foundError && <p role="alert">{foundError}</p>}

        {reports.map((pet) => (

          <article
            className="my-reports__card"
            key={pet.id}
          >

            <div className="my-reports__image">
              {pet.image ? (
                <SafeImage type={pet.type}
                  src={pet.image}
                  alt={displayPetName(pet.name)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                />
              ) : (
                <img
                  src={petPlaceholders[pet.type] || petPlaceholders.Other}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                />
              )}
            </div>


            <div>

              <h2>{displayPetName(pet.name)}</h2>

              <p>
                {pet.type} · {pet.breed || "Breed not given"}
              </p>

              <p>
                Last seen: {pet.location}
              </p>

            </div>


            <span
              className={`my-reports__status missing-pets__status missing-pets__status--${pet.status
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {reportStatusLabel(pet.status)}
            </span>


            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                to={`/missing-pets/${pet.id}`}
                className="my-reports__details"
              >
                View details
              </Link>

              {pet.status === "Lost" && (
                <button
                  type="button"
                  onClick={() => handleMarkFound(pet)}
                  disabled={busyId === pet.id}
                >
                  {busyId === pet.id ? "Saving..." : "Mark as Found"}
                </button>
              )}
            </div>

          </article>

        ))}

      </section>


      {/* MY CLAIMS: pets I asked to take back (Pending, Approved or Rejected with the reason) */}

      <section className="my-reports__container my-claims">

        <h2>My Claims</h2>

        {claims.length === 0 && (
          <p>You have not claimed a pet yet.</p>
        )}

        {claims.map((claim) => (

          <article className="my-claims__item" key={claim.id}>

            <div>

              <strong>{displayPetName(claim.petName)}</strong>

              <p>
                {claim.petType} · Pickup date: {formatDate(claim.pickupDate)}
              </p>

              {claim.status === "Rejected" && claim.rejectReason && (
                <p>Reason: {claim.rejectReason}</p>
              )}

            </div>

            <span className={`my-claims__status my-claims__status--${claim.status.toLowerCase()}`}>
              {claim.status}
            </span>

          </article>

        ))}

      </section>

    </div>
  );
}

export default MyMissingPetReports;
