import { useState } from "react";

import useFetch from "../../../hooks/useFetch.js";
import { petPlaceholders } from "../../../assets/images/placeholders/index.js";
import { displayPetName } from "../../../utils/petName.js";
import {
  listMyMissingReports,
  markMyReportReunited,
} from "../../../services/missingPetService.js";
import { formatApiError } from "../../../services/authService.js";

import "./MyMissingPetReports.css";
// status badge: same style as the Missing Pets page (missing-pets__status)
import "../MissingPets/MissingPets.css";
import BackButton from "../../../components/common/BackButton.jsx";

// Shown only to logged-in citizens: the route is wrapped in RequireSignIn,
// which opens the sign-in / sign-up prompt for guests.
function MyMissingPetReports() {
  const { data, loading, reload } = useFetch(() => listMyMissingReports(), []);
  const reports = data ?? [];

  // blocks a second click while the update is being saved
  const [busyId, setBusyId] = useState(null);

  const handleFound = async (report) => {
    const confirmed = window.confirm(
      `Mark ${displayPetName(report.name)} as found? The report will be closed as Reunited.`
    );

    if (!confirmed || busyId) return;

    setBusyId(report.id);

    try {
      await markMyReportReunited(report.id);
    } catch (error) {
      window.alert(formatApiError(error).message);
    }

    reload();
    setBusyId(null);
  };

  return (
    <div className="my-reports">
      <BackButton fallback="/" />


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

        {reports.map((pet) => (

          <article
            className="my-reports__card"
            key={pet.id}
          >

            <div className="my-reports__image">
              {pet.image ? (
                <img
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
              {pet.status}
            </span>


            <button type="button">
              Edit
            </button>


            <button
              type="button"
              disabled={pet.status === "Reunited" || busyId === pet.id}
              onClick={() => handleFound(pet)}
            >
              Mark as Found
            </button>

          </article>

        ))}

      </section>

    </div>
  );
}

export default MyMissingPetReports;
