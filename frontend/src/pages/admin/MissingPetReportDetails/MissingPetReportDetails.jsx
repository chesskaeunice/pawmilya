import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  CalendarDays,
  Clock3,
  FileImage,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  QrCode,
  Save,
  UserRound,
} from "lucide-react";

import useFetch from "../../../hooks/useFetch.js";
import useAuth from "../../../hooks/useAuth.js";
import {
  getReportMatches,
  getStaffReport,
  registerAnimalFromReport,
  updateReportStatus,
} from "../../../services/missingPetService.js";
import { formatApiError } from "../../../services/authService.js";

import "./MissingPetReportDetails.css";
import BackButton from "../../../components/common/BackButton.jsx";
import SafeImage from "../../../components/common/SafeImage.jsx";
import { FormError } from "../../../components/common/FieldError.jsx";
import ReportClaims from "../../../components/admin/ReportClaims.jsx";
import { reportStatusLabel } from "../../../utils/reportStatusLabel.js";


const STATUS_OPTIONS = [
  "Lost",
  "Rescued",
  "Reunited",
];


function MissingPetReportDetails() {
  const { reportId } =
    useParams();

  const { can } = useAuth();

  const navigate = useNavigate();


  const { data: pet, loading, reload } =
    useFetch(
      () => getStaffReport(reportId),
      [reportId]
    );


  // Animals in the pound that could be this pet
  const { data: matchData } =
    useFetch(
      () => getReportMatches(reportId),
      [reportId]
    );

  const matches =
    matchData ?? [];


  // null = nothing chosen yet (the dropdown shows the saved status)
  const [selectedStatus, setSelectedStatus] =
    useState(null);


  const [saving, setSaving] =
    useState(false);


  const [selectedPhoto, setSelectedPhoto] =
    useState(0);


  // set when saving the status as Rescued added the pet to the Animals list
  const [addedAnimalId, setAddedAnimalId] =
    useState(null);


  // registering a Rescued pet as an animal in the pound
  const [registering, setRegistering] =
    useState(false);

  const [registerError, setRegisterError] =
    useState("");


  if (loading) {
    return (
      <div className="staff-page">
        <p>Loading...</p>
      </div>
    );
  }


  if (!pet) {
    return (
      <div className="staff-page">

        <BackButton fallback="/admin/missing-pets" />


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
    pet.reporterName ||
    "Not provided";

  // "I am the" on the report form
  const reportedBy =
    { Owner: "Pet owner", Citizen: "Concerned citizen" }[pet.reporterType] ||
    "Not specified";


  const currentStatus =
    pet.status;


  const chosenStatus =
    selectedStatus ?? currentStatus;


  const handleUpdateStatus = async () => {
    setSaving(true);

    try {
      const updated =
        await updateReportStatus(
          pet.id,
          chosenStatus
        );

      // saving Rescued registered the pet as an animal (it had none before)
      setAddedAnimalId(
        updated.animal_id && !pet.animal_id
          ? updated.animal_id
          : null
      );

      setSelectedStatus(null);
      reload();
    } catch (error) {
      window.alert(
        formatApiError(error).message
      );
    }

    setSaving(false);
  };


  // Rescued = the pet is at the pound: it can be registered as an animal, then its QR / collar tag made
  const canRegister =
    currentStatus === "Rescued" &&
    !pet.animal_id &&
    can("animals.registerFromReport");

  const canOpenTag =
    Boolean(pet.animal_id) &&
    can("qr.view");


  const handleRegister = async () => {
    if (
      !window.confirm(
        "Register this pet as an animal in the pound? " +
        "A new animal record with its photos and QR code will be created from this report."
      )
    ) {
      return;
    }

    setRegistering(true);
    setRegisterError("");

    try {
      const animal =
        await registerAnimalFromReport(
          pet.id
        );

      navigate(
        `/admin/animals/${animal.id}/collar-tag`
      );
    } catch (error) {
      setRegisterError(
        formatApiError(error).message
      );
      setRegistering(false);
    }
  };


  return (
    <div className="staff-page missing-details">

      {/* =====================================
          BACK
      ====================================== */}

      <BackButton fallback="/admin/missing-pets" />


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
                  <SafeImage type={pet.type}
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
                          <SafeImage type={pet.type}
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
                        <SafeImage
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


          {/* POSSIBLE MATCHES IN THE POUND */}

          <section className="missing-details__card">

            <div className="missing-details__section-heading">

              <div>

                <h2>
                  Possible Matches in the Pound
                </h2>

                <p>
                  Animals currently in the pound
                  with the same type and a similar
                  name, breed or color.
                </p>

              </div>

            </div>


            {matches.length === 0 ? (

              <p className="missing-details__description">
                No similar animals were found in the pound.
              </p>

            ) : (

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 12,
                }}
              >

                {matches.map((match) => (

                  <li
                    key={match.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >

                    {match.image ? (
                      <SafeImage
                        src={match.image}
                        alt={match.name || "Animal"}
                        style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
                      />
                    ) : (
                      <div
                        style={{ width: 56, height: 56, borderRadius: 8, background: "#faf7f1" }}
                      />
                    )}


                    <div style={{ flex: 1 }}>

                      <strong>
                        {match.name || "Unnamed"}
                      </strong>
                      {" "}
                      ({match.animal_code})

                      <br />

                      <small>
                        {[match.breed, match.color, match.sex, match.status]
                          .filter(Boolean)
                          .join(" · ")}
                      </small>

                      <br />

                      <small>
                        {match.reasons.join(", ")}
                      </small>

                    </div>


                    <Link to={`/admin/animals/${match.id}`}>
                      View animal
                    </Link>

                  </li>

                ))}

              </ul>

            )}

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
                pet.breed || "Not given"
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
                <UserRound
                  size={15}
                />
              }
              label="Reported by"
              value={
                reportedBy
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


            {can("missingPets.updateStatus") ? (
            <div className="missing-details__status-editor">

              <label htmlFor="reportStatus">
                Current Status
              </label>


              <select
                id="reportStatus"
                value={
                  chosenStatus
                }
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
              >

                {/* set by the system after the claim period: shown, not selectable */}
                {currentStatus === "For Adoption" && (
                  <option value="For Adoption" disabled>
                    For Adoption
                  </option>
                )}

                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={
                        currentStatus === "For Adoption" &&
                        option === "Rescued"
                      }
                    >
                      {reportStatusLabel(option)}
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
                  saving ||
                  chosenStatus ===
                  currentStatus
                }
              >
                <Save size={14} />

                Update Status
              </button>

            </div>
            ) : (
              /* no permission to change it: the current status, read-only, in the same place */
              <div className="missing-details__status-editor">

                <span>
                  Current Status
                </span>

                <StatusBadge
                  status={
                    currentStatus
                  }
                />

              </div>
            )}


            {addedAnimalId && (
              <p role="status" style={{ marginTop: 16 }}>
                The pet was added to the Animals list.
                You can now generate its QR code.{" "}
                <Link to={`/admin/animals/${addedAnimalId}`}>
                  View animal
                </Link>
              </p>
            )}


            {/* Rescued report: register the pet in the pound, or open its QR / collar tag */}
            {(canRegister || canOpenTag) && (
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>

                {canRegister && (
                  <button
                    type="button"
                    className="staff-button"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    <QrCode size={13} />

                    {registering
                      ? "Registering..."
                      : "Register in pound and generate QR"}
                  </button>
                )}

                <FormError message={registerError} />

                {canOpenTag && (
                  <Link
                    to={`/admin/animals/${pet.animal_id}/collar-tag`}
                    className="staff-button"
                  >
                    <QrCode size={13} />

                    View QR / Collar Tag
                  </Link>
                )}

              </div>
            )}

          </section>

          {/* CLAIMS (pound staff and the kennel manager) */}

          {can("claims.view") && pet.status !== "Lost" && (
            <ReportClaims reportId={reportId} onDecided={reload} />
          )}

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
      {reportStatusLabel(status)}
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