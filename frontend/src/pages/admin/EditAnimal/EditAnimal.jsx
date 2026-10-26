import { useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { Lock } from "lucide-react";

import useAuth from "../../../hooks/useAuth.js";
import useFetch from "../../../hooks/useFetch.js";
import {
  addAnimalPhoto,
  getAnimal,
  removeAnimalPhoto,
  updateAnimal,
  updateAnimalPhoto,
} from "../../../services/animalService.js";
import { formatApiError } from "../../../services/authService.js";

import {
  ADOPTABLE_STATUS,
  ADOPTION_NEEDS_CLEARED_MESSAGE,
  allowedStatuses,
  canBeAdoptable,
  HEALTH_STATUSES,
} from "../../../config/animalStatus.js";

import ClaimPeriodNote from "../../../components/admin/ClaimPeriodNote.jsx";
import { formatClaimDate } from "../../../utils/claimPeriod.js";

import "./EditAnimal.css";
import BackButton from "../../../components/common/BackButton.jsx";
import SafeImage from "../../../components/common/SafeImage.jsx";


function EditAnimal() {
  const { animalId } = useParams();

  const { data: pet, loading } = useFetch(
    () => getAnimal(animalId),
    [animalId]
  );

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

  return <EditAnimalForm pet={pet} />;
}


function EditAnimalForm({ pet }) {
  const { can } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState(pet.status);
  const [healthStatus, setHealthStatus] = useState(pet.health_status);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState(pet.photos ?? []);
  const [photoMessage, setPhotoMessage] = useState("");

  const photo = photos[0]?.url;

  // An animal keeps 3 to 4 photos (the API enforces it too)
  const MIN_PHOTOS = 3;
  const MAX_PHOTOS = 4;

  // Runs one photo change; every change saves right away and is written to the audit log
  const runPhotoChange = async (change, doneMessage) => {
    try {
      const updated = await change();
      setPhotos(updated.photos ?? []);
      setPhotoMessage(doneMessage);
    } catch (err) {
      setPhotoMessage(formatApiError(err).message);
    }
  };

  // The chosen file must be a JPG, PNG or WebP of 5 MB or less
  const pickImage = (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return null;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoMessage("Use a JPG, PNG or WebP image.");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoMessage("The image must be 5 MB or smaller.");
      return null;
    }

    return file;
  };

  // Every staff role may replace the main photo
  const changePhoto = (event) => {
    const file = pickImage(event);
    if (file) runPhotoChange(() => updateAnimalPhoto(pet.id, file), "Main photo updated.");
  };

  // Pound staff may also add and remove photos
  const addPhoto = (event) => {
    const file = pickImage(event);
    if (file) runPhotoChange(() => addAnimalPhoto(pet.id, file), "Photo added.");
  };

  const removePhoto = (photoId) => {
    if (window.confirm("Remove this photo?")) {
      runPhotoChange(() => removeAnimalPhoto(pet.id, photoId), "Photo removed.");
    }
  };

  const petName = pet.name || "Unnamed";

  // Shown inline under the form
  // a pet from a report becomes adoptable by itself once the claim period has ended
  const inClaimPeriod = Boolean(pet.claimDeadlineAt);
  const claimMessage = !inClaimPeriod
    ? ""
    : (status === ADOPTABLE_STATUS && pet.status !== ADOPTABLE_STATUS) ||
        (healthStatus === "Cleared" && pet.health_status !== "Cleared")
      ? `This pet is still in its claim period until ${formatClaimDate(pet.claimDeadlineAt)}. Health clearance opens after that.`
      : "";

  const statusMessage = claimMessage || (canBeAdoptable(status, healthStatus) ? "" : ADOPTION_NEEDS_CLEARED_MESSAGE);


  /* =========================================
     FIELD PERMISSIONS (see RBAC Part 2)
     The API enforces the same rules.
  ========================================= */

  // Name, type, breed, sex, owner info: Pound Staff only
  const canEditBasic = can("animals.edit");

  // Add and remove photos: Pound Staff only
  const canManagePhotos = can("animals.edit");

  // General status: Pound Staff (Rescued / Reunited with Owner only), Counselor and Vet Tech (limited)
  const canEditStatus =
    can("animals.edit") ||
    can("animals.adoptionUpdate") ||
    can("animals.healthUpdate");

  // Health status: Pound Staff and Vet Tech
  const canEditHealth =
    can("animals.edit") ||
    can("animals.healthUpdate");

  // Kennel location: Pound Staff only
  const canEditLocation =
    can("animals.edit") ||
    can("animals.husbandryUpdate");

  // Description / behavior notes: Pound Staff and Adoption Counselor
  const canEditNotes =
    can("animals.edit") ||
    can("animals.adoptionUpdate") ||
    can("animals.husbandryUpdate");


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (statusMessage) {
      setErrors([statusMessage]);
      return;
    }

    // Disabled fields are not part of FormData, so only editable fields are sent
    const payload = Object.fromEntries(new FormData(event.currentTarget));

    setErrors([]);
    setSaving(true);

    try {
      await updateAnimal(pet.id, payload);
      navigate(`/admin/animals/${pet.id}`);
    } catch (err) {
      const { message, fields } = formatApiError(err);
      const messages = Object.values(fields);
      setErrors(messages.length ? messages : [message]);
      setSaving(false);
    }
  };


  return (
    <div className="staff-page">
      <BackButton fallback="/admin/animals" />


      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Animals / {petName} / Edit
          </p>

          <h1 className="staff-page__title">
            Edit {petName}
          </h1>
        </div>
      </div>


      <section className="staff-form__section">
        <div className="staff-form__section-header">
          <h2>{canManagePhotos ? "Photos" : "Main Photo"}</h2>
          <p>
            {canManagePhotos
              ? `The first photo is the main one. Keep ${MIN_PHOTOS} to ${MAX_PHOTOS} photos. Changes save right away.`
              : "Shown first on the animal's pages. Every staff role can change it."}
          </p>
        </div>

        {canManagePhotos ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {photos.map((item, index) => (
              <div key={item.id} style={{ width: 150 }}>
                <SafeImage
                  src={item.url}
                  alt={`${index === 0 ? "Main photo" : `Photo ${index + 1}`} of ${petName}`}
                  style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 12 }}
                />

                <p style={{ margin: "4px 0" }}>{index === 0 ? "Main photo" : `Photo ${index + 1}`}</p>

                <button
                  type="button"
                  className="staff-button staff-button--outline"
                  disabled={photos.length <= MIN_PHOTOS}
                  title={photos.length <= MIN_PHOTOS ? `Keep at least ${MIN_PHOTOS} photos` : "Remove this photo"}
                  onClick={() => removePhoto(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          photo && (
            <SafeImage src={photo} alt={`Main photo of ${petName}`} style={{ maxWidth: 180, borderRadius: 12 }} />
          )
        )}

        <label>
          Replace main photo
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={changePhoto} />
        </label>

        {canManagePhotos && (
          <label>
            Add a photo {photos.length >= MAX_PHOTOS && `(maximum of ${MAX_PHOTOS} reached)`}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={addPhoto}
              disabled={photos.length >= MAX_PHOTOS}
            />
          </label>
        )}

        {photoMessage && <p role="status">{photoMessage}</p>}
      </section>


      <ClaimPeriodNote animal={pet} />

      <form
        className="staff-form"
        onSubmit={handleSubmit}
      >

        {/* BASIC INFORMATION */}

        <section className="staff-form__section">

          <div className="staff-form__section-header">
            <h2>Basic Information</h2>
            <p>Core details of the animal.</p>

            {!canEditBasic && (
              <span className="staff-form__lock">
                <Lock size={11} />
                View only
              </span>
            )}
          </div>


          <div className="staff-form__grid">

            <Field label="Animal Name" htmlFor="name">
              <input
                id="name"
                name="name"
                defaultValue={pet.name ?? ""}
                disabled={!canEditBasic}
              />
            </Field>

            <Field label="Animal Type" htmlFor="species">
              <select
                id="species"
                name="species"
                defaultValue={pet.type}
                disabled={!canEditBasic}
              >
                <option>Dog</option>
                <option>Cat</option>
                <option>Other</option>
              </select>
            </Field>

            <Field label="Breed" htmlFor="breed">
              <input
                id="breed"
                name="breed"
                defaultValue={pet.breed ?? ""}
                disabled={!canEditBasic}
              />
            </Field>

            <Field label="Sex" htmlFor="sex">
              <select
                id="sex"
                name="sex"
                defaultValue={pet.sex}
                disabled={!canEditBasic}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Unknown</option>
              </select>
            </Field>

            <Field label="Owner Name (if known)" htmlFor="owner_name">
              <input
                id="owner_name"
                name="owner_name"
                defaultValue={pet.owner_name ?? ""}
                disabled={!canEditBasic}
              />
            </Field>

            <Field label="Owner Contact (if known)" htmlFor="owner_contact">
              <input
                id="owner_contact"
                name="owner_contact"
                defaultValue={pet.owner_contact ?? ""}
                disabled={!canEditBasic}
              />
            </Field>

          </div>

        </section>


        {/* SHELTER DETAILS */}

        <section className="staff-form__section">

          <div className="staff-form__section-header">
            <h2>Shelter Details</h2>
            <p>Current status and kennel location.</p>
          </div>


          <div className="staff-form__grid">

            <Field
              label="Status"
              htmlFor="status"
              locked={!canEditStatus}
            >
              <select
                id="status"
                name="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={!canEditStatus}
              >
                {/* the current status always stays listed, even when this role cannot pick it */}
                {[...new Set([pet.status, ...allowedStatuses(can, pet.status)])].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>

            <Field
              label="Health Status"
              htmlFor="health_status"
              locked={!canEditHealth}
            >
              <select
                id="health_status"
                name="health_status"
                value={healthStatus}
                onChange={(event) => setHealthStatus(event.target.value)}
                disabled={!canEditHealth}
              >
                {HEALTH_STATUSES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>

            <Field
              label="Shelter / Kennel Location"
              htmlFor="location"
              locked={!canEditLocation}
            >
              <input
                id="location"
                name="location"
                defaultValue={pet.location ?? ""}
                disabled={!canEditLocation}
              />
            </Field>

          </div>

        </section>


        {/* DESCRIPTION */}

        <section className="staff-form__section">

          <div className="staff-form__section-header">
            <h2>Description</h2>
            <p>
              Temperament, personality, and daily
              behavior notes.
            </p>
          </div>


          <Field
            label="Description"
            htmlFor="description"
            locked={!canEditNotes}
            full
          >
            <textarea
              id="description"
              name="description"
              rows="5"
              defaultValue={pet.description ?? ""}
              disabled={!canEditNotes}
            />
          </Field>

        </section>


        {(statusMessage || errors.length > 0) && (
          <ul className="staff-form__error" role="alert">
            {(errors.length ? errors : [statusMessage]).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}


        {/* ACTIONS */}

        <div className="staff-form__actions">

          <Link
            to={`/admin/animals/${pet.id}`}
            className="staff-button staff-button--outline"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="staff-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
}


function Field({
  label,
  htmlFor,
  locked,
  full,
  children,
}) {
  return (
    <div
      className={`staff-form__field${full ? " staff-form__field--full" : ""}`}
    >
      <label htmlFor={htmlFor}>
        {label}

        {locked && (
          <span className="staff-form__lock">
            <Lock size={11} />
            View only
          </span>
        )}
      </label>

      {children}
    </div>
  );
}


export default EditAnimal;
