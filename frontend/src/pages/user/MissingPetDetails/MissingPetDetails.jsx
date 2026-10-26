import { useState } from "react";

import {
  CalendarDays,
  Clock3,
  MapPin,
  PawPrint,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

import useFetch from "../../../hooks/useFetch.js";
import { getMissingPet } from "../../../services/missingPetService.js";

import { petPlaceholders } from "../../../assets/images/placeholders/index.js";
import { displayPetName } from "../../../utils/petName.js";
import StatusHelp from "../../../components/common/StatusHelp/StatusHelp.jsx";
import { claimPeriodText } from "../../../utils/claimPeriod.js";
import useAuth from "../../../hooks/useAuth.js";
import useModals from "../../../hooks/useModals.js";
import useMyClaims from "../../../hooks/useMyClaims.js";
import ClaimPetButton from "../../../components/report/ClaimPetButton.jsx";
import ClaimPetModal from "../../../components/report/ClaimPetModal.jsx";

import "./MissingPetDetails.css";
import BackButton from "../../../components/common/BackButton.jsx";
import SafeImage from "../../../components/common/SafeImage.jsx";
import Modal from "../../../components/common/Modal.jsx";


function MissingPetDetails() {
  const { reportId } =
    useParams();

  // index of the last seen photo shown larger (null: none)
  const [viewing, setViewing] =
    useState(null);

  // "Claim Pet": guests get the sign-in pop-up first, citizens get the claim form
  const { isLoggedIn } = useAuth();
  const { openSignIn } = useModals();
  const { pendingReportIds, reload: reloadClaims } = useMyClaims();
  const [claiming, setClaiming] = useState(null);


  const { data: pet, loading } =
    useFetch(
      () => getMissingPet(reportId),
      [reportId]
    );


  if (loading) {
    return (
      <div className="missing-detail">
        <p>Loading...</p>
      </div>
    );
  }


  if (!pet) {
    return (
      <div className="missing-detail">

        <BackButton fallback="/missing-pets" />


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


  const lastSeenPhotos =
    pet.lastSeenImages ?? [];


  return (
    <div className="missing-detail">

      {/* BACK */}

      <BackButton fallback="/missing-pets" />


      {/* HEADER */}

      <div className="missing-detail__heading">

        <div>

          <p className="missing-detail__eyebrow">
            Missing Pet Report
          </p>


          <div className="missing-detail__title-row">

            <h1>
              {displayPetName(pet.name)}
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


          {["Rescued", "For Adoption"].includes(pet.status) && pet.claimDeadlineAt && (
            <p className="missing-detail__claim">
              {claimPeriodText(pet.claimDeadlineAt)}
            </p>
          )}

          <div className="missing-detail__claim-action">
            <ClaimPetButton
              report={pet}
              pendingReportIds={pendingReportIds}
              onClaim={(report) => {
                if (!isLoggedIn) {
                  openSignIn(`/missing-pets/${report.id}`, "You need an account to claim a pet.");
                  return;
                }

                setClaiming(report);
              }}
            />
          </div>

        </div>

      </div>


      {/* MAIN */}

      <section className="missing-detail__main">

        {/* PHOTO */}

        <div className="missing-detail__photo">

          <SafeImage type={pet.type}
            src={
              pet.image ||
              petPlaceholders[pet.type] ||
              petPlaceholders.Other
            }
            alt={displayPetName(pet.name)}
          />

        </div>


        {/* BASIC INFORMATION */}

        <div className="missing-detail__card">

          <h2>
            Pet Information
          </h2>


          <DetailRow
            icon={<PawPrint size={16} />}
            label="Pet Name"
            value={displayPetName(pet.name)}
          />


          <DetailRow
            icon={<PawPrint size={16} />}
            label="Animal Type"
            value={pet.type}
          />


          <DetailRow
            icon={<PawPrint size={16} />}
            label="Breed"
            value={pet.breed || "Not given"}
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


  {lastSeenPhotos.length > 0 ? (
    <div className="missing-detail__thumbs">

      {lastSeenPhotos.map(
        (photo, index) => (
          <button
            type="button"
            className="missing-detail__thumb"
            key={index}
            onClick={() => setViewing(index)}
            aria-label={`View last seen photo ${index + 1} larger`}
          >

            {/* a missing or broken file shows "Photo not available" at the same size */}
            <SafeImage
              src={photo}
              alt={`${displayPetName(pet.name)} last seen ${index + 1}`}
              loading="lazy"
            />

          </button>
        )
      )}

    </div>
  ) : (
    <div className="missing-detail__no-photo">
      No photo of the last seen area
    </div>
  )}

  <Modal
    isOpen={viewing !== null}
    onClose={() => setViewing(null)}
    title={`Last seen photo ${(viewing ?? 0) + 1} of ${lastSeenPhotos.length}`}
    size="large"
  >
    <SafeImage
      className="missing-detail__lightbox-image"
      src={lastSeenPhotos[viewing ?? 0]}
      alt={`${displayPetName(pet.name)} last seen ${(viewing ?? 0) + 1}`}
    />
  </Modal>

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

      <ClaimPetModal
        report={claiming}
        onClose={() => setClaiming(null)}
        onSubmitted={reloadClaims}
      />

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