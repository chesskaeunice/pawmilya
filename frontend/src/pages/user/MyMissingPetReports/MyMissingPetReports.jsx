import { Link } from "react-router-dom";

import useFetch from "../../../hooks/useFetch.js";
import { petPlaceholders } from "../../../assets/images/placeholders/index.js";
import { displayPetName } from "../../../utils/petName.js";
import { listMyMissingReports } from "../../../services/missingPetService.js";

import "./MyMissingPetReports.css";
// status badge: same style as the Missing Pets page (missing-pets__status)
import "../MissingPets/MissingPets.css";
import BackButton from "../../../components/common/BackButton.jsx";
import SafeImage from "../../../components/common/SafeImage.jsx";

// Shown only to logged-in citizens: the route is wrapped in RequireSignIn,
// which opens the sign-in / sign-up prompt for guests.
function MyMissingPetReports() {
  const { data, loading } = useFetch(() => listMyMissingReports(), []);
  const reports = data ?? [];

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
              {pet.status}
            </span>


            <Link
              to={`/missing-pets/${pet.id}`}
              className="my-reports__details"
            >
              View details
            </Link>

          </article>

        ))}

      </section>

    </div>
  );
}

export default MyMissingPetReports;
