import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  CalendarDays,
  HeartPulse,
  MapPin,
  PawPrint,
  Pencil,
  QrCode,
  Syringe,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth.js";
import useFetch from "../../../hooks/useFetch.js";
import {
  getAnimal,
  getAnimalHistory,
  getAnimalQr,
} from "../../../services/animalService.js";
import { listVaccinations } from "../../../services/vaccinationService.js";
import { healthStatusClass, statusClass } from "../../../config/animalStatus.js";

import "./AnimalDetails.css";
import BackButton from "../../../components/common/BackButton.jsx";
import ClaimPeriodNote from "../../../components/admin/ClaimPeriodNote.jsx";
import PhotoGallery from "../../../components/common/PhotoGallery/PhotoGallery.jsx";

const TABS = [
  { id: "about", label: "About", icon: PawPrint },
  { id: "medical", label: "Medical Records", icon: HeartPulse },
  { id: "vaccinations", label: "Vaccinations", icon: Syringe },
  { id: "history", label: "History", icon: null },
];

const VACCINATION_STATUS_CLASS = {
  "Up to date": "staff-status--current",
  "Due Soon": "staff-status--due",
  Overdue: "staff-status--overdue",
};

// How an audit entry reads on the History tab
function describeHistory(entry) {
  const details = entry.details ?? {};

  switch (entry.action) {
    case "animal.created":
      return "Animal record created";
    case "animal.updated": {
      const changed = Object.keys(details.to ?? {});
      const parts = changed.map((field) => {
        const label = field.replace("_", " ");
        const from = details.from?.[field];
        const to = details.to[field];
        return typeof to === "object" ? label : `${label}: ${from ?? "-"} → ${to}`;
      });
      return `Updated ${parts.join(", ") || "details"}`;
    }
    case "vaccination.created":
      return `Vaccination recorded: ${details.vaccine}`;
    case "vaccination.updated":
      return `Vaccination record updated: ${details.vaccine}`;
    case "vaccination.deleted":
      return `Vaccination record deleted: ${details.vaccine}`;
    case "application.submitted":
      return "Adoption application submitted";
    case "application.approved":
      return "Adoption application approved (animal adopted)";
    case "application.rejected":
      return `Adoption application rejected${details.reason ? `: ${details.reason}` : ""}`;
    default:
      return entry.action;
  }
}

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

function AnimalDetails() {
  const { animalId } = useParams();
  const { can } = useAuth();

  const { data: pet, loading } = useFetch(() => getAnimal(animalId), [animalId]);
  const { data: qrSvg } = useFetch(
    () => (can("qr.view") ? getAnimalQr(animalId) : Promise.resolve("")),
    [animalId]
  );

  // The tabs below the photos
  const [tab, setTab] = useState("about");
  const { data: vaccinationData } = useFetch(
    () => listVaccinations({ animal_id: animalId }),
    [animalId]
  );
  const { data: historyData } = useFetch(() => getAnimalHistory(animalId), [animalId]);

  const vaccinations = vaccinationData ?? [];
  const history = historyData ?? [];

  if (loading) {
    return (
      <div className="staff-page">
      <BackButton fallback="/admin/animals" />

        <p>Loading...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="staff-page">
        <h1>Animal not found.</h1>
      </div>
    );
  }

  const name = pet.name || "Unnamed";
  const canEdit =
    can("animals.edit") ||
    can("animals.adoptionUpdate") ||
    can("animals.healthUpdate") ||
    can("animals.husbandryUpdate");

  return (
    <div className="staff-page">
      <BackButton fallback="/admin/animals" />


      <div className="staff-page__top">

        <div>
          <p className="staff-page__breadcrumb">
            Animals / Animal Details
          </p>

          <div className="animal-details__title-row">

            <h1 className="staff-page__title">
              {name}{" "}
              <span>
                ({pet.animal_code})
              </span>
            </h1>


            <span className={`staff-status ${statusClass(pet.status)}`}>
              {pet.status}
            </span>

          </div>
        </div>


        {canEdit && (
          <Link
            to={`/admin/animals/${pet.id}/edit`}
            className="staff-button"
          >
            <Pencil size={13} />
            Edit Profile
          </Link>
        )}

      </div>


      <ClaimPeriodNote animal={pet} />

      <section className="animal-details__top">

        <div className="animal-details__gallery">

          <PhotoGallery
            key={pet.id}
            photos={pet.images?.length ? pet.images : [pet.image].filter(Boolean)}
            alt={name}
            type={pet.type}
            emptyContent="Animal Photo"
          />

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
              label="Health Status"
              value={pet.health_status}
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
              value={pet.ageLabel || "-"}
            />

            <DetailRow
              icon={<PawPrint size={13} />}
              label="Gender"
              value={pet.sex}
            />

            <DetailRow
              icon={<CalendarDays size={13} />}
              label="Date Rescued"
              value={formatDate(pet.dateAdded)}
            />

            <DetailRow
              icon={<MapPin size={13} />}
              label="Location"
              value={pet.location}
            />

          </div>

        </div>

      </section>


      <section className="animal-details__tabs" role="tablist">

        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={
              tab === id
                ? "animal-details__tab animal-details__tab--active"
                : "animal-details__tab"
            }
            onClick={() => setTab(id)}
          >
            {Icon && <Icon size={13} />}
            {label}
          </button>
        ))}

      </section>


      {tab === "medical" && (
        <section className="staff-detail-card">

          <h2 className="staff-detail-card__title">
            Medical Records
          </h2>

          <p>
            Health status:{" "}
            <span className={`staff-status ${healthStatusClass(pet.health_status)}`}>
              {pet.health_status}
            </span>
          </p>

          <p>
            Vaccinations on record: {vaccinations.length}
            {" · "}
            Overdue: {vaccinations.filter((record) => record.status === "Overdue").length}
            {" · "}
            Due soon: {vaccinations.filter((record) => record.status === "Due Soon").length}
          </p>

          <p>
            Vaccination details are on the Vaccinations tab. Health status changes
            are on the History tab.
          </p>

        </section>
      )}


      {tab === "vaccinations" && (
        <section className="staff-detail-card">

          <h2 className="staff-detail-card__title">
            Vaccinations
          </h2>

          {vaccinations.length === 0 ? (
            <p>No vaccinations recorded for {name} yet.</p>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Date Given</th>
                  <th>Next Due</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {vaccinations.map((record) => (
                  <tr key={record.id}>
                    <td>{record.vaccine}</td>
                    <td>{formatDate(record.date)}</td>
                    <td>{formatDate(record.nextDue)}</td>
                    <td>
                      <span className={`staff-status ${VACCINATION_STATUS_CLASS[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </section>
      )}


      {tab === "history" && (
        <section className="staff-detail-card">

          <h2 className="staff-detail-card__title">
            History
          </h2>

          {history.length === 0 ? (
            <p>Nothing has been recorded for {name} yet.</p>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>What happened</th>
                  <th>By</th>
                </tr>
              </thead>

              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDateTime(entry.createdAt)}</td>
                    <td>{describeHistory(entry)}</td>
                    <td>{entry.user ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </section>
      )}


      {tab === "about" && (
      <>
      <section className="staff-detail-card animal-details__about">

        <div>

          <h2>
            About {name}
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
              {pet.ideal_home ||
                "A safe and responsible household that can provide appropriate care, attention, and long-term support."}
            </p>

          </div>

        </div>

      </section>


      {can("qr.view") && (
      <section className="staff-detail-card animal-details__about">

        <div>

          <h2>
            <QrCode size={14} /> Stray QR Code
          </h2>

          <p>
            Scanning this code opens a public page with {name}&apos;s
            information and the owner&apos;s contact details, if known.
          </p>

          <p>
            Owner: {pet.owner_name || "Not known"}
            {pet.owner_contact ? ` (${pet.owner_contact})` : ""}
          </p>

          <Link
            to={`/admin/animals/${pet.id}/collar-tag`}
            className="staff-button"
          >
            <QrCode size={13} />
            View QR / Collar Tag
          </Link>

        </div>


        <div
          style={{ maxWidth: 260 }}
          // The SVG comes from our own API
          dangerouslySetInnerHTML={{ __html: qrSvg ?? "" }}
        />

      </section>
      )}
      </>
      )}

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
