import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  PawPrint,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import missingPets from "../../../data/missingPets.js";

import StatusHelp from "../../../components/common/StatusHelp/StatusHelp.jsx";

import "./MissingPetDetails.css";


function MissingPetDetails() {
  const { reportId } =
    useParams();

  const navigate =
    useNavigate();


  const pet =
    missingPets.find(
      (item) =>
        item.id === Number(reportId)
    );


  if (!pet) {
    return (
      <div className="missing-detail">

        <button
          type="button"
          className="missing-detail__back"
          onClick={() =>
            navigate("/missing-pets")
          }
        >
          <ArrowLeft size={17} />
          Back to Missing Pets
        </button>


        <div className="missing-detail__not-found">
          <h1>
            Missing pet report not found
          </h1>

          <p>
            The report may have been removed
            or is no longer available.
          </p>
        </div>

      </div>
    );
  }


  return (
    <div className="missing-detail">

      {/* BACK */}

      <button
        type="button"
        className="missing-detail__back"
        onClick={() =>
          navigate(-1)
        }
      >
        <ArrowLeft size={17} />
        Back
      </button>


      {/* HEADER */}

      <div className="missing-detail__heading">

        <div>

          <p className="missing-detail__eyebrow">
            Missing Pet Report
          </p>


          <div className="missing-detail__title-row">

            <h1>
              {pet.name}
            </h1>


            <span
              className={`missing-detail__status missing-detail__status--${pet.status
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {pet.status}
            </span>

          </div>


          <p>
            View the complete information
            provided for this missing pet report.
          </p>

        </div>

      </div>


      {/* MAIN */}

      <section className="missing-detail__main">

        {/* PHOTO */}

        <div className="missing-detail__photo">

          {pet.image ? (
            <img
              src={pet.image}
              alt={pet.name}
            />
          ) : (
            <span>
              Pet Image
            </span>
          )}

        </div>


        {/* BASIC INFORMATION */}

        <div className="missing-detail__card">

          <h2>
            Pet Information
          </h2>


          <DetailRow
            icon={<PawPrint size={16} />}
            label="Pet Name"
            value={pet.name}
          />


          <DetailRow
            icon={<PawPrint size={16} />}
            label="Animal Type"
            value={pet.type}
          />


          <DetailRow
            icon={<PawPrint size={16} />}
            label="Breed"
            value={pet.breed}
          />


          <DetailRow
            icon={<PawPrint size={16} />}
            label="Sex"
            value={pet.sex}
          />


          <DetailRow
            icon={<PawPrint size={16} />}
            label="Color / Markings"
            value={
              pet.color ||
              "Not specified"
            }
          />

        </div>

      </section>


      {/* LAST SEEN */}

      <section className="missing-detail__card missing-detail__location-card">

        <h2>
          Last Seen Information
        </h2>


        <div className="missing-detail__location-grid">

          <div>

            <span>
              <MapPin size={17} />
            </span>

            <div>
              <small>
                Last Known Location
              </small>

              <strong>
                {pet.location}
              </strong>
            </div>

          </div>


          <div>

            <span>
              <Clock3 size={17} />
            </span>

            <div>
              <small>
                Last Seen
              </small>

              <strong>
                {formatTimestamp(
                  pet.lastSeen
                )}
              </strong>
            </div>

          </div>


          <div>

            <span>
              <CalendarDays size={17} />
            </span>

            <div>
              <small>
                Report Submitted
              </small>

              <strong>
                {formatTimestamp(
                  pet.reportedAt
                )}
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================
    LAST SEEN PHOTOS
===================================== */}

<section className="missing-detail__card missing-detail__photos-card">

  <div className="missing-detail__section-heading">

    <div>
      <h2>
        Last Seen Photos
      </h2>

      <p>
        Photos submitted with the report that may help
        identify the pet or the area where it was last seen.
      </p>
    </div>

  </div>


  <div className="missing-detail__photo-gallery">

    {Array.from({ length: 3 }).map(
      (_, index) => {

        const photo =
          pet.lastSeenImages?.[index];


        return (
          <div
            className="missing-detail__gallery-photo"
            key={index}
          >

            {photo ? (
              <img
                src={photo}
                alt={`${pet.name} last seen ${index + 1}`}
              />
            ) : (
              <div className="missing-detail__gallery-placeholder">

                <span>
                  Last Seen Photo
                </span>

                <small>
                  Image {index + 1}
                </small>

              </div>
            )}

          </div>
        );
      }
    )}

  </div>

</section>


      {/* ADDITIONAL DETAILS */}

      <section className="missing-detail__card">

        <h2>
          Additional Details
        </h2>


        <p className="missing-detail__description">
          {pet.details ||
            "No additional information was provided for this report."}
        </p>

      </section>


      <StatusHelp />

    </div>
  );
}


function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="missing-detail__row">

      <span className="missing-detail__row-icon">
        {icon}
      </span>


      <span className="missing-detail__row-label">
        {label}
      </span>


      <strong>
        {value || "Not specified"}
      </strong>

    </div>
  );
}


function formatTimestamp(value) {
  if (!value) {
    return "Not specified";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not specified";
  }


  const datePart =
    date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );


  const timePart =
    date.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );


  return `${datePart} • ${timePart}`;
}


export default MissingPetDetails;