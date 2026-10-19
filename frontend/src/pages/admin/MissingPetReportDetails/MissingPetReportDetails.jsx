import { useParams } from "react-router-dom";

import {
  CalendarDays,
  MapPin,
  PawPrint,
} from "lucide-react";

import missingPets from "../../../data/missingPets.js";

import "./MissingPetReportDetails.css";

function MissingPetReportDetails() {
  const { reportId } =
    useParams();

  const pet =
    missingPets.find(
      (item) =>
        item.id === Number(reportId)
    );

  if (!pet) {
    return (
      <div className="staff-page">
        <h1>
          Missing pet report not found.
        </h1>
      </div>
    );
  }

  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Missing Pets /
            Missing Pet Details
          </p>

          <div className="missing-details__heading">
            <h1 className="staff-page__title">
              {pet.name}
            </h1>

            <span className="staff-status staff-status--active">
              Missing
            </span>
          </div>
        </div>
      </div>

      <section className="missing-details__top">
        <div className="missing-details__gallery">
          <div className="missing-details__photo">
            Animal Photo
          </div>

          <div className="missing-details__thumbnails">
            <div>Photo</div>
            <div>Photo</div>
            <div>Photo</div>
          </div>
        </div>

        <div className="staff-detail-card">
          <h2 className="staff-detail-card__title">
            Basic Information
          </h2>

          <Detail
            label="Status"
            value={pet.status}
          />

          <Detail
            label="Type"
            value={pet.type}
          />

          <Detail
            label="Breed"
            value={pet.breed}
          />

          <Detail
            label="Age"
            value={pet.age}
          />

          <Detail
            label="Gender"
            value={pet.sex}
          />

          <Detail
            label="Location Last Seen"
            value={pet.location}
          />
        </div>
      </section>

      <div className="missing-details__tabs">
        <button className="missing-details__tab missing-details__tab--active">
          <PawPrint size={12} />
          Pet Details
        </button>

        <button className="missing-details__tab">
          <CalendarDays size={12} />
          Last Seen
        </button>
      </div>

      <section className="staff-detail-card missing-details__additional">
        <h2>
          Additional Details
        </h2>

        <p>
          {pet.details}
        </p>
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="missing-details__row">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

export default MissingPetReportDetails;