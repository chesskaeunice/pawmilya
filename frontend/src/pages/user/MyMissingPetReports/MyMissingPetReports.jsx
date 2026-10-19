import missingPets from "../../../data/missingPets.js";

import "./MyMissingPetReports.css";
// status badge: same style as the Missing Pets page (missing-pets__status)
import "../MissingPets/MissingPets.css";

function MyMissingPetReports() {
  return (
    <div className="my-reports">

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

        {missingPets.map((pet) => (

          <article
            className="my-reports__card"
            key={pet.id}
          >

            <div className="my-reports__image">
              Pet Image
            </div>


            <div>

              <h2>{pet.name}</h2>

              <p>
                {pet.type} · {pet.breed}
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


            <button type="button">
              Mark as Found
            </button>

          </article>

        ))}

      </section>

    </div>
  );
}

export default MyMissingPetReports;