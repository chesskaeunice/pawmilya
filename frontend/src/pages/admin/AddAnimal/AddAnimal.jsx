import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Plus, X } from "lucide-react";

import {
  ADOPTION_NEEDS_CLEARED_MESSAGE,
  canBeAdoptable,
  DEFAULT_HEALTH_STATUS,
  DEFAULT_STATUS,
  HEALTH_STATUSES,
} from "../../../config/animalStatus.js";

import { createAnimal } from "../../../services/animalService.js";
import { formatApiError } from "../../../services/authService.js";

import "./AddAnimal.css";
import BackButton from "../../../components/common/BackButton.jsx";

const MIN_IMAGES = 3;
const MAX_IMAGES = 4; // 1 main photo + 3 thumbnails, as on the Animal Details page
const MAX_TRAITS = 6;
const MAX_ABOUT = 500;

const TYPE_OPTIONS = ["Dog", "Cat"];

const LOCATION_SUGGESTIONS = ["Main Animal Pound", "Foster Home", "Vet Clinic"];

const SUGGESTED_TRAITS = [
  "Friendly",
  "Playful",
  "Curious",
  "Calm",
  "Shy",
  "Energetic",
  "Affectionate",
  "Independent",
];

const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function Required() {
  return (
    <span className="add-animal__required" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

/* Multiple-photo upload: 3–4 images. Files picked in separate selections are
   added together; each can be removed, and any photo can become the main one. */
function PhotoUpload({ id, files, onChange }) {
  const inputRef = useRef(null);
  const [notice, setNotice] = useState("");

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews]
  );

  // Keep the real <input> in sync so native "required" validation still works
  useEffect(() => {
    const input = inputRef.current;
    const transfer = new DataTransfer();

    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;

    input.setCustomValidity(
      files.length < MIN_IMAGES
        ? `Please upload at least ${MIN_IMAGES} photos.`
        : ""
    );
  }, [files]);

  const sameFile = (a, b) =>
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

  const handleChange = (event) => {
    const picked = Array.from(event.target.files);
    const merged = [...files];

    picked.forEach((file) => {
      if (!merged.some((existing) => sameFile(existing, file))) {
        merged.push(file);
      }
    });

    setNotice(
      merged.length > MAX_IMAGES
        ? `You can upload up to ${MAX_IMAGES} photos. The extra photos were not added.`
        : ""
    );

    onChange(merged.slice(0, MAX_IMAGES));
  };

  const removeFile = (index) => {
    setNotice("");
    onChange(files.filter((_, i) => i !== index));
  };

  const makeMain = (index) => {
    onChange([files[index], ...files.filter((_, i) => i !== index)]);
  };

  return (
    <div className="add-animal__upload">
      <label htmlFor={id}>
        <span>
          Animal Photos
          <Required />
        </span>
      </label>

      <p className="add-animal__hint">
        Upload {MIN_IMAGES}–{MAX_IMAGES} photos. The first photo is the main
        photo shown on the animal&apos;s profile.
      </p>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple
        required
        onChange={handleChange}
      />

      {files.length > 0 && (
        <ul className="add-animal__photos">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`}>
              <img src={previews[index]} alt={`Preview of ${file.name}`} />

              {index === 0 ? (
                <span className="add-animal__main-badge">Main photo</span>
              ) : (
                <button
                  type="button"
                  className="add-animal__make-main"
                  onClick={() => makeMain(index)}
                >
                  Make main
                </button>
              )}

              <button
                type="button"
                className="add-animal__photo-remove"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && files.length < MIN_IMAGES && (
        <p className="add-animal__error" role="alert">
          Add {MIN_IMAGES - files.length} more photo
          {MIN_IMAGES - files.length === 1 ? "" : "s"} to continue.
        </p>
      )}

      {notice && (
        <p className="add-animal__error" role="alert">
          {notice}
        </p>
      )}
    </div>
  );
}

function AddAnimal() {
  const navigate = useNavigate();
  const traitInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    type: "",
    breed: "",
    gender: "",
    neutered: "No",
    status: DEFAULT_STATUS,
    healthStatus: DEFAULT_HEALTH_STATUS,
    dateRescued: todayISO(),
    location: "",
    about: "",
    idealHome: "",
    ownerName: "",
    ownerContact: "",
  });

  const [images, setImages] = useState([]);
  const [traits, setTraits] = useState([]);
  const [traitInput, setTraitInput] = useState("");
  const [traitError, setTraitError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [serverErrors, setServerErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  // clears the status message once status / health status are valid again
  const updateStatus = (key) => (event) => {
    const next = { ...form, [key]: event.target.value };
    if (canBeAdoptable(next.status, next.healthStatus)) setStatusError("");
    setForm(next);
  };

  const animalName = form.name.trim();

  /* ----- personality traits ----- */

  const addTrait = (raw) => {
    const value = raw.trim().replace(/,+$/, "").trim();
    if (!value) return;

    const label = value.charAt(0).toUpperCase() + value.slice(1);

    if (traits.some((t) => t.toLowerCase() === label.toLowerCase())) {
      setTraitInput("");
      return;
    }

    if (traits.length >= MAX_TRAITS) {
      setTraitError(`You can add up to ${MAX_TRAITS} traits.`);
      return;
    }

    setTraits((current) => [...current, label]);
    setTraitInput("");
    setTraitError("");
  };

  const removeTrait = (trait) => {
    setTraits((current) => current.filter((t) => t !== trait));
    setTraitError("");
  };

  const handleTraitKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTrait(traitInput);
    }

    if (event.key === "Backspace" && !traitInput && traits.length) {
      setTraits((current) => current.slice(0, -1));
    }
  };

  /* ----- submit ----- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canBeAdoptable(form.status, form.healthStatus)) {
      setStatusError(ADOPTION_NEEDS_CLEARED_MESSAGE);
      return;
    }

    const pendingTrait = traitInput.trim();
    const finalTraits = pendingTrait
      ? [...traits, pendingTrait.charAt(0).toUpperCase() + pendingTrait.slice(1)]
      : traits;

    if (finalTraits.length === 0) {
      setTraitError("Add at least one personality trait.");
      traitInputRef.current?.focus();
      return;
    }

    // Sent as multipart because of the photos; the first photo is the main one
    const body = new FormData();
    body.append("name", animalName);
    body.append("species", form.type);
    body.append("breed", form.breed.trim());
    body.append("sex", form.gender);
    body.append("neutered", form.neutered === "Yes" ? 1 : 0);
    body.append("status", form.status);
    body.append("health_status", form.healthStatus);
    body.append("rescued_at", form.dateRescued);
    body.append("location", form.location.trim());
    body.append("description", form.about.trim());
    body.append("ideal_home", form.idealHome.trim());
    body.append("owner_name", form.ownerName.trim());
    body.append("owner_contact", form.ownerContact.trim());
    finalTraits.forEach((trait) => body.append("personality[]", trait));
    images.forEach((file) => body.append("images[]", file));

    setServerErrors([]);
    setSaving(true);

    try {
      await createAnimal(body);
      navigate("/admin/animals");
    } catch (err) {
      const { message, fields } = formatApiError(err);
      const messages = Object.values(fields);
      setServerErrors(messages.length ? messages : [message]);
      setSaving(false);
    }
  };

  return (
    <div className="add-animal">
      <BackButton fallback="/admin/animals" />

      <section className="add-animal__header">
        <p className="add-animal__eyebrow">Animals / Add Animal</p>

        <h1>Add a New Animal</h1>

        <p>
          Enter the animal&apos;s details to create a new record. Fields marked
          with <span className="add-animal__required">*</span> are required. An
          animal ID is assigned automatically.
        </p>
      </section>

      <form className="add-animal__form" onSubmit={handleSubmit}>
        {/* ---------- Basic Information ---------- */}
        <section className="add-animal__section">
          <h2>Basic Information</h2>

          <div className="add-animal__grid">
            <label>
              <span>
                Name
                <Required />
              </span>
              <input
                type="text"
                value={form.name}
                maxLength={40}
                onChange={update("name")}
                required
              />
            </label>

            <label>
              <span>
                Status
                <Required />
              </span>
              {/* a new animal always starts as Rescued; the status is changed later */}
              <select
                value={form.status}
                disabled
              >
                <option>{DEFAULT_STATUS}</option>
              </select>
            </label>

            <label>
              <span>
                Health Status
                <Required />
              </span>
              <select
                value={form.healthStatus}
                onChange={updateStatus("healthStatus")}
                required
              >
                {HEALTH_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              {statusError && (
                <p className="add-animal__error" role="alert">
                  {statusError}
                </p>
              )}
            </label>

            <label>
              <span>
                Type
                <Required />
              </span>
              <select value={form.type} onChange={update("type")} required>
                <option value="" disabled>
                  Select type
                </option>
                {TYPE_OPTIONS.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              <span>
                Breed
                <Required />
              </span>
              <input
                type="text"
                value={form.breed}
                onChange={update("breed")}
                required
              />
            </label>

            <label>
              <span>
                Gender
                <Required />
              </span>
              <select value={form.gender} onChange={update("gender")} required>
                <option value="" disabled>
                  Select gender
                </option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </label>

            <label>
              <span>
                Spayed / Neutered
                <Required />
              </span>
              <select value={form.neutered} onChange={update("neutered")} required>
                <option>No</option>
                <option>Yes</option>
              </select>
            </label>

            <label>
              <span>
                Date Rescued
                <Required />
              </span>
              <input
                type="date"
                value={form.dateRescued}
                max={todayISO()}
                onChange={update("dateRescued")}
                required
              />
            </label>

            <label>
              <span>
                Location
                <Required />
              </span>
              <input
                type="text"
                list="animal-locations"
                placeholder="e.g. Main Animal Pound"
                value={form.location}
                onChange={update("location")}
                required
              />

              <datalist id="animal-locations">
                {LOCATION_SUGGESTIONS.map((place) => (
                  <option key={place} value={place} />
                ))}
              </datalist>
            </label>

            <label>
              <span>Owner Name (if known)</span>
              <input
                type="text"
                maxLength={255}
                value={form.ownerName}
                onChange={update("ownerName")}
              />
            </label>

            <label>
              <span>Owner Contact (if known)</span>
              <input
                type="text"
                maxLength={50}
                value={form.ownerContact}
                onChange={update("ownerContact")}
              />
            </label>
          </div>

          <PhotoUpload id="animalPhotos" files={images} onChange={setImages} />
        </section>

        {/* ---------- About ---------- */}
        <section className="add-animal__section">
          <h2>About {animalName || "this animal"}</h2>

          <label>
            <span>
              Description
              <Required />
            </span>

            <textarea
              rows="5"
              maxLength={MAX_ABOUT}
              placeholder="A short introduction to the animal, shown on its public profile."
              value={form.about}
              onChange={update("about")}
              required
            />

            <small className="add-animal__counter">
              {form.about.length}/{MAX_ABOUT}
            </small>
          </label>
        </section>

        {/* ---------- Behavior & Personality ---------- */}
        <section className="add-animal__section">
          <h2>Behavior &amp; Personality</h2>

          <div className="add-animal__field">
            <label htmlFor="traitInput">
              <span>
                Personality Traits
                <Required />
              </span>
            </label>

            <p className="add-animal__hint">
              Type a trait and press Enter, or pick a suggestion. Add up to{" "}
              {MAX_TRAITS}.
            </p>

            <div className="add-animal__tags">
              {traits.map((trait) => (
                <span className="add-animal__tag" key={trait}>
                  {trait}

                  <button
                    type="button"
                    onClick={() => removeTrait(trait)}
                    aria-label={`Remove ${trait}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              <input
                id="traitInput"
                ref={traitInputRef}
                type="text"
                maxLength={20}
                placeholder={traits.length ? "Add another…" : "e.g. Curious"}
                value={traitInput}
                onChange={(event) => {
                  setTraitInput(event.target.value);
                  setTraitError("");
                }}
                onKeyDown={handleTraitKeyDown}
                onBlur={() => addTrait(traitInput)}
              />

              <button
                type="button"
                className="add-animal__tag-add"
                onClick={() => addTrait(traitInput)}
                aria-label="Add trait"
              >
                <Plus size={13} />
              </button>
            </div>

            <div className="add-animal__suggestions">
              {SUGGESTED_TRAITS.filter(
                (trait) => !traits.includes(trait)
              ).map((trait) => (
                <button
                  type="button"
                  key={trait}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addTrait(trait)}
                >
                  + {trait}
                </button>
              ))}
            </div>

            {traitError && (
              <p className="add-animal__error" role="alert">
                {traitError}
              </p>
            )}
          </div>

          <label>
            <span>
              Ideal Home
              <Required />
            </span>

            <textarea
              rows="4"
              placeholder="Describe the kind of home that would suit this animal best."
              value={form.idealHome}
              onChange={update("idealHome")}
              required
            />
          </label>
        </section>

        {serverErrors.length > 0 && (
          <ul className="add-animal__error" role="alert">
            {serverErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="add-animal__actions">
          <button
            type="button"
            className="add-animal__cancel"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button type="submit" className="add-animal__submit" disabled={saving}>
            {saving ? "Saving..." : "Add Animal"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAnimal;