import {
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileImage,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import missingPets from "../../../data/missingPets.js";

import "./MissingPetReportDetails.css";


const STATUS_OPTIONS = [
  "Lost",
  "Sighted",
  "Found",
  "Reunited",
  "Adopted",
  "Transfer",
  "Adoptable",
];


function MissingPetReportDetails() {
  const { reportId } =
    useParams();


  const pet =
    missingPets.find(
      (item) =>
        item.id ===
        Number(reportId)
    );


  const [currentStatus, setCurrentStatus] =
    useState(
      pet?.status ||
        "Lost"
    );


  const [selectedStatus, setSelectedStatus] =
    useState(
      pet?.status ||
        "Lost"
    );


  const [selectedPhoto, setSelectedPhoto] =
    useState(0);


  if (!pet) {
    return (
      <div className="staff-page">

        <Link
          to="/admin/missing-pets"
          className="missing-details__back"
        >
          <ArrowLeft size={15} />

          Back to Missing Pet Reports
        </Link>


        <div className="missing-details__not-found">

          <h1>
            Missing pet report not found
          </h1>

          <p>
            The requested report could
            not be found.
          </p>

        </div>

      </div>
    );
  }


  const reportIdFormatted =
    `MPR-${String(
      pet.id
    ).padStart(
      3,
      "0"
    )}`;


  const petImages =
    pet.petImages?.length
      ? pet.petImages
      : pet.image
      ? [pet.image]
      : [];


  const mainPhoto =
    petImages[
      selectedPhoto
    ];


  const reporterName =
    [
      pet.reporterFirstName,
      pet.reporterLastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Not provided";


  const handleUpdateStatus = () => {
    setCurrentStatus(
      selectedStatus
    );


    window.alert(
      `Status changed to ${selectedStatus}. This is frontend-only until Laravel is connected.`
    );
  };


  return (
    <div className="staff-page missing-details">

      {/* =====================================
          BACK
      ====================================== */}

      <Link
        to="/admin/missing-pets"
        className="missing-details__back"
      >
        <ArrowLeft size={15} />

        Back to Missing Pet Reports
      </Link>


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="missing-details__header">

        <div>

          <p className="staff-page__breadcrumb">
            Missing Pets /
            {" "}
            {reportIdFormatted}
          </p>


          <div className="missing-details__heading">

            <h1 className="staff-page__title">
              {pet.name}
            </h1>


            <StatusBadge
              status={
                currentStatus
              }
            />

          </div>


          <p className="staff-page__subtitle">
            Review the complete information
            submitted for this missing pet
            report.
          </p>

        </div>

      </div>


      {/* =====================================
          MAIN
      ====================================== */}

      <section className="missing-details__grid">

        {/* ===================================
            LEFT
        ==================================== */}

        <div className="missing-details__left">

          {/* PET PHOTOS */}

          <section className="missing-details__card">

            <div className="missing-details__section-heading">

              <div>

                <h2>
                  Pet Photos
                </h2>

                <p>
                  Images submitted to help
                  identify the pet.
                </p>

              </div>

            </div>


            <div className="missing-details__gallery">

              <div className="missing-details__main-photo">

                {mainPhoto ? (
                  <img
                    src={mainPhoto}
                    alt={pet.name}
                  />
                ) : (
                  <div className="missing-details__photo-placeholder">

                    <FileImage
                      size={30}
                    />

                    <strong>
                      Pet Image
                    </strong>

                    <span>
                      No image available
                    </span>

                  </div>
                )}

              </div>


              <div className="missing-details__thumbnails">

                {Array.from({
                  length: 3,
                }).map(
                  (_, index) => {

                    const photo =
                      petImages[
                        index
                      ];


                    return (
                      <button
                        type="button"
                        key={index}
                        className={
                          selectedPhoto ===
                          index
                            ? "missing-details__thumbnail missing-details__thumbnail--active"
                            : "missing-details__thumbnail"
                        }
                        disabled={!photo}
                        onClick={() =>
                          setSelectedPhoto(
                            index
                          )
                        }
                      >

                        {photo ? (
                          <img
                            src={photo}
                            alt={`${pet.name} ${index + 1}`}
                          />
                        ) : (
                          <span>
                            Photo{" "}
                            {index + 1}
                          </span>
                        )}

                      </button>
                    );
                  }
                )}

              </div>

            </div>

          </section>


          {/* LAST SEEN PHOTOS */}

          <section className="missing-details__card">

            <div className="missing-details__section-heading">

              <div>

                <h2>
                  Last Seen Photos
                </h2>

                <p>
                  Photos submitted with
                  the report that may help
                  identify the pet or the
                  area where it was seen.
                </p>

              </div>

            </div>


            <div className="missing-details__last-seen-gallery">

              {Array.from({
                length: 3,
              }).map(
                (_, index) => {

                  const photo =
                    pet.lastSeenImages?.[
                      index
                    ];


                  return (
                    <div
                      className="missing-details__last-seen-photo"
                      key={index}
                    >

                      {photo ? (
                        <img
                          src={photo}
                          alt={`${pet.name} last seen ${index + 1}`}
                        />
                      ) : (
                        <div className="missing-details__photo-placeholder">

                          <FileImage
                            size={23}
                          />

                          <strong>
                            Last Seen Photo
                          </strong>

                          <span>
                            Image{" "}
                            {index + 1}
                          </span>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>

          </section>


          {/* ADDITIONAL DETAILS */}

          <section className="missing-details__card">

            <div className="missing-details__section-heading">

              <div>

                <h2>
                  Additional Details
                </h2>

                <p>
                  Extra information included
                  by the reporter.
                </p>

              </div>

            </div>


            <p className="missing-details__description">
              {pet.details ||
                "No additional information was provided."}
            </p>

          </section>

        </div>


        {/* ===================================
            RIGHT
        ==================================== */}

        <div className="missing-details__right">

          {/* PET INFORMATION */}

          <section className="missing-details__card">

            <div className="missing-details__section-heading">

              <div>

                <h2>
                  Pet Information
                </h2>

                <p>
                  Identifying information
                  for the reported pet.
                </p>

              </div>

            </div>


            <Detail
              icon={
                <PawPrint size={15} />
              }
              label="Pet Name"
              value={
                pet.name
              }
            />


            <Detail
              icon={
                <PawPrint size={15} />
              }
              label="Animal Type"
              value={
                pet.type
              }
            />


            <Detail
              icon={
                <PawPrint size={15} />
              }
              label="Breed"
              value={
                pet.breed
              }
            />


            <Detail
              icon={
                <PawPrint size={15} />
              }
              label="Color / Markings"
              value={
                pet.color
              }
            />


            <Detail
              icon={
                <PawPrint size={15} />
              }
              label="Sex"
              value={
                pet.sex
              }
            />

          </section>


          {/* LAST SEEN */}

          <section className="missing-details__card">

            <div className="missing-details__section-heading">

              <div>

                <h2>
                  Last Seen Information
                </h2>

                <p>
                  Location and report
                  timestamps.
                </p>

              </div>

            </div>


            <InfoBox
              icon={
                <MapPin size={17} />
              }
              label="Last Known Location"
              value={
                pet.location
              }
            />


            <InfoBox
              icon={
                <Clock3 size={17} />
              }
              label="Last Seen"
              value={
                formatTimestamp(
                  pet.lastSeen
                )
              }
            />


            <InfoBox
              icon={
                <CalendarDays
                  size={17}
                />
              }
              label="Report Submitted"
              value={
                formatTimestamp(
                  pet.reportedAt
                )
              }
            />

          </section>


          {/* REPORTER CONTACT */}

          <section className="missing-details__card">

            <div className="missing-details__section-heading">

              <div>

                <h2>
                  Reporter Contact
                </h2>

                <p>
                  Contact information submitted
                  with the report. This is for
                  staff use.
                </p>

              </div>

            </div>


            <ContactRow
              icon={
                <UserRound
                  size={15}
                />
              }
              label="Reporter"
              value={
                reporterName
              }
            />


            <ContactRow
              icon={
                <Phone
                  size={15}
                />
              }
              label="Contact Number"
              value={
                pet.reporterPhone
              }
            />


            <ContactRow
              icon={
                <Mail
                  size={15}
                />
              }
              label="Email Address"
              value={
                pet.reporterEmail
              }
            />

          </section>


          {/* STATUS MANAGEMENT */}

          <section className="missing-details__card">

            <div className="missing-details__section-heading">

              <div>

                <h2>
                  Report Status
                </h2>

                <p>
                  Update the report as the
                  case progresses.
                </p>

              </div>

            </div>


            <div className="missing-details__status-editor">

              <label htmlFor="reportStatus">
                Current Status
              </label>


              <select
                id="reportStatus"
                value={
                  selectedStatus
                }
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
              >

                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}

              </select>


              <button
                type="button"
                onClick={
                  handleUpdateStatus
                }
                disabled={
                  selectedStatus ===
                  currentStatus
                }
              >
                <Save size={14} />

                Update Status
              </button>

            </div>

          </section>

        </div>

      </section>

    </div>
  );
}


/* =========================================
   DETAIL
========================================= */

function Detail({
  icon,
  label,
  value,
}) {
  return (
    <div className="missing-details__row">

      <span className="missing-details__row-icon">
        {icon}
      </span>


      <span>
        {label}
      </span>


      <strong>
        {value ||
          "Not specified"}
      </strong>

    </div>
  );
}


/* =========================================
   INFO BOX
========================================= */

function InfoBox({
  icon,
  label,
  value,
}) {
  return (
    <div className="missing-details__info-box">

      <span className="missing-details__info-icon">
        {icon}
      </span>


      <div>

        <small>
          {label}
        </small>

        <strong>
          {value ||
            "Not specified"}
        </strong>

      </div>

    </div>
  );
}


/* =========================================
   CONTACT
========================================= */

function ContactRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="missing-details__contact">

      <span>
        {icon}
      </span>


      <div>

        <small>
          {label}
        </small>

        <strong>
          {value ||
            "Not provided"}
        </strong>

      </div>

    </div>
  );
}


/* =========================================
   STATUS
========================================= */

function StatusBadge({
  status,
}) {
  const className =
    status
      ?.toLowerCase()
      .replaceAll(
        " ",
        "-"
      );


  return (
    <span
      className={`missing-details__status missing-details__status--${className}`}
    >
      {status}
    </span>
  );
}


/* =========================================
   DATE
========================================= */

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


export default MissingPetReportDetails;