import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ChevronLeft, Plus, X } from "lucide-react";

import {
  ADOPTION_NEEDS_CLEARED_MESSAGE,
  ANIMAL_STATUSES,
  canBeAdoptable,
  DEFAULT_HEALTH_STATUS,
  DEFAULT_STATUS,
  HEALTH_STATUSES,
} from "../../../config/animalStatus.js";

import "./AddAnimal.css";

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
    ageValue: "",
    ageUnit: "years",
    gender: "",
    status: DEFAULT_STATUS,
    healthStatus: DEFAULT_HEALTH_STATUS,
    dateRescued: todayISO(),
    location: "",
    about: "",
    idealHome: "",
  });

  const [images, setImages] = useState([]);
  const [traits, setTraits] = useState([]);
  const [traitInput, setTraitInput] = useState("");
  const [traitError, setTraitError] = useState("");
  const [statusError, setStatusError] = useState("");

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

  const handleSubmit = (event) => {
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

    const ageNumber = Number(form.ageValue);
    const unit = ageNumber === 1 ? form.ageUnit.slice(0, -1) : form.ageUnit;

    const animal = {
      name: animalName,
      type: form.type,
      breed: form.breed.trim(),
      age: `${ageNumber} ${unit} old`,
      gender: form.gender,
      status: form.status,
      health_status: form.healthStatus,
      dateRescued: form.dateRescued,
      location: form.location.trim(),
      about: form.about.trim(),
      personality: finalTraits,
      idealHome: form.idealHome.trim(),
      images,
    };

    console.log("New animal:", animal);

    alert(
      `${animal.name} was added. Laravel integration will be added later.`
    );

    navigate("/admin/animals");
  };

  return (
    <div className="add-animal">
      <button
        type="button"
        className="add-animal__back"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={15} />
        Back
      </button>

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
              <select
                value={form.status}
                onChange={updateStatus("status")}
                required
              >
                {ANIMAL_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
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

            <div className="add-animal__field">
              <label htmlFor="ageValue">
                <span>
                  Age
                  <Required />
                </span>
              </label>

              <div className="add-animal__age">
                <input
                  id="ageValue"
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={form.ageValue}
                  onChange={update("ageValue")}
                  required
                />

                <select
                  value={form.ageUnit}
                  onChange={update("ageUnit")}
                  aria-label="Age unit"
                >
                  <option value="months">months</option>
                  <option value="years">years</option>
                </select>
              </div>
            </div>

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

        <div className="add-animal__actions">
          <button
            type="button"
            className="add-animal__cancel"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button type="submit" className="add-animal__submit">
            Add Animal
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAnimal;