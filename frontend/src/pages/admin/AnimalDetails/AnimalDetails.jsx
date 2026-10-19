import { Link, useParams } from "react-router-dom";

import {
  CalendarDays,
  HeartPulse,
  MapPin,
  PawPrint,
  Pencil,
  Syringe,
} from "lucide-react";

import pets from "../../../data/pets.js";

import "./AnimalDetails.css";

function AnimalDetails() {
  const { animalId } = useParams();

  const pet = pets.find(
    (item) =>
      item.id === Number(animalId)
  );

  if (!pet) {
    return (
      <div className="staff-page">
        <h1>Animal not found.</h1>
      </div>
    );
  }

  return (
    <div className="staff-page">

      <div className="staff-page__top">

        <div>
          <p className="staff-page__breadcrumb">
            Animals / Animal Details
          </p>

          <div className="animal-details__title-row">

            <h1 className="staff-page__title">
              {pet.name}{" "}
              <span>
                (A-{String(pet.id).padStart(3, "0")})
              </span>
            </h1>


            <span className="staff-status staff-status--available">
              {pet.status}
            </span>

          </div>
        </div>


        <Link
          to={`/admin/animals/${pet.id}/edit`}
          className="staff-button"
        >
          <Pencil size={13} />
          Edit Profile
        </Link>

      </div>


      <section className="animal-details__top">

        <div className="animal-details__gallery">

          <div className="animal-details__main-photo">
            Animal Photo
          </div>


          <div className="animal-details__thumbnails">

            <button type="button">
              Photo
            </button>

            <button type="button">
              Photo
            </button>

            <button type="button">
              Photo
            </button>

          </div>

        </div>


        <div className="staff-detail-card animal-details__basic">

          <h2 className="staff-detail-card__title">
            Basic Information
          </h2>


          <div className="animal-details__info-list">

            <DetailRow
              icon={<PawPrint size={13} />}
              label="Status"
              value={pet.status}
            />

            <DetailRow
              icon={<PawPrint size={13} />}
              label="Type"
              value={pet.type}
            />

            <DetailRow
              icon={<PawPrint size={13} />}
              label="Breed"
              value={pet.breed}
            />

            <DetailRow
              icon={<CalendarDays size={13} />}
              label="Age"
              value={pet.ageLabel}
            />

            <DetailRow
              icon={<PawPrint size={13} />}
              label="Gender"
              value={pet.sex}
            />

            <DetailRow
              icon={<CalendarDays size={13} />}
              label="Date Rescued"
              value="Sep 26, 2026"
            />

            <DetailRow
              icon={<MapPin size={13} />}
              label="Location"
              value={pet.location}
            />

          </div>

        </div>

      </section>


      <section className="animal-details__tabs">

        <button
          type="button"
          className="animal-details__tab animal-details__tab--active"
        >
          <PawPrint size={13} />
          About
        </button>

        <button type="button" className="animal-details__tab">
          <HeartPulse size={13} />
          Medical Records
        </button>

        <button type="button" className="animal-details__tab">
          <Syringe size={13} />
          Vaccinations
        </button>

        <button type="button" className="animal-details__tab">
          History
        </button>

      </section>


      <section className="staff-detail-card animal-details__about">

        <div>

          <h2>
            About {pet.name}
          </h2>

          <p>
            {pet.description}
          </p>

          <p>
            This information is maintained by Pawmilya staff
            and may be updated as the animal receives further
            care, assessment, vaccination, or adoption review.
          </p>

        </div>


        <div>

          <h2>
            Behavior &amp; Personality
          </h2>


          <div className="animal-details__traits">

            {pet.personality.map((trait) => (
              <span key={trait}>
                {trait}
              </span>
            ))}

          </div>


          <div className="animal-details__home">

            <strong>
              Ideal Home
            </strong>

            <p>
              A safe and responsible household that can
              provide appropriate care, attention, and
              long-term support.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}


function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="animal-details__info-row">

      <span className="animal-details__info-icon">
        {icon}
      </span>

      <span className="animal-details__info-label">
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}

export default AnimalDetails;