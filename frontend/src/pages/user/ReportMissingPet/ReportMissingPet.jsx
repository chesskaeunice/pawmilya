import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { X } from "lucide-react";

import { BREEDS } from "../../../config/petBreeds.js";
import { submitMissingPetReport } from "../../../services/missingPetService.js";
import { formatApiError } from "../../../services/authService.js";

import "./ReportMissingPet.css";
import BackButton from "../../../components/common/BackButton.jsx";

const STATUS_OPTIONS = [
  {
    value: "Sighted",
    summary: "Found somewhere",
    description:
      "The pet has recently been seen in a reported location, but has not yet been safely found.",
  },
  {
    value: "Found",
    summary: "Returned to pound",
    description:
      "The pet has been found and is currently being kept safe while its owner is being located.",
  },
];

const MIN_IMAGES = 2;
const MAX_IMAGES = 3;

const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function Required() {
  return (
    <span className="report-pet__required" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

/* Multiple-image upload: choose 2–3 images.
   Files picked in separate selections are added together, and each one
   can be removed individually. */
function ImageUpload({ id, label }) {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const sameFile = (a, b) =>
    a.name === b.name &&
    a.size === b.size &&
    a.lastModified === b.lastModified;

  // Keep the real <input> in sync so native "required" validation still works
  // (the form reads the chosen files from this input when it is submitted)
  const updateFiles = (next, notice = "") => {
    const input = inputRef.current;

    const transfer = new DataTransfer();
    next.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;

    const message =
      next.length < MIN_IMAGES
        ? `Please upload at least ${MIN_IMAGES} images.`
        : "";

    // Blocks form submission until at least 2 images are chosen
    input.setCustomValidity(message);

    setFiles(next);
    setError(notice || message);
  };

  const handleChange = (event) => {
    const picked = Array.from(event.target.files);

    const merged = [...files];

    picked.forEach((file) => {
      if (!merged.some((existing) => sameFile(existing, file))) {
        merged.push(file);
      }
    });

    const notice =
      merged.length > MAX_IMAGES
        ? `You can upload up to ${MAX_IMAGES} images. The extra images were not added.`
        : "";

    updateFiles(merged.slice(0, MAX_IMAGES), notice);
  };

  const removeFile = (index) => {
    updateFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="report-pet__upload">
      <label htmlFor={id}>
        <span>
          {label}
          <Required />
        </span>
      </label>

      <p className="report-pet__hint">
        Please provide {MIN_IMAGES}–{MAX_IMAGES} images. You can select
        multiple files at once, or add them one at a time.
      </p>

      <input
        ref={inputRef}
        id={id}
        name={id}
        type="file"
        accept="image/*"
        multiple
        required
        onChange={handleChange}
      />

      {files.length > 0 && (
        <ul className="report-pet__file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`}>
              <span>{file.name}</span>

              <button
                type="button"
                className="report-pet__file-remove"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="report-pet__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Open to guests (no login needed). A logged-in citizen's report is linked to the account.
function ReportMissingPet() {
  const navigate = useNavigate();

  const [petType, setPetType] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // a second click while the first is still sending does nothing
    if (submitting) return;

    const form = event.currentTarget.elements;
    const body = new FormData();

    body.append("name", form.petName.value);
    body.append("species", form.petType.value);
    body.append("breed", form.breed.value);
    body.append("color", form.color.value);
    body.append("last_seen_at", `${form.lastSeenDate.value} 00:00:00`);
    body.append("location", form.location.value);
    body.append("status", form.status.value);
    body.append("details", form.details.value);
    body.append("contact_name", `${form.firstName.value} ${form.lastName.value}`.trim());
    body.append("contact_number", form.contactNumber.value);
    body.append("contact_email", form.contactEmail.value);
    Array.from(form.petImages.files).forEach((file) => body.append("pet_images[]", file));
    Array.from(form.lastSeenImages.files).forEach((file) => body.append("last_seen_images[]", file));

    setErrors([]);
    setSubmitting(true);

    try {
      await submitMissingPetReport(body);
      navigate("/missing-pets");
    } catch (err) {
      const { message, fields } = formatApiError(err);
      const messages = Object.values(fields);
      setErrors(messages.length ? messages : [message]);
      setSubmitting(false);
    }
  };

  return (
    <div className="report-pet">
      <BackButton fallback="/missing-pets" />

      <section className="report-pet__header">
        <p className="report-pet__eyebrow">Missing Pet Report</p>

        <h1>Report a Missing Pet</h1>

        <p>
          Provide as much information as possible to help identify and locate
          the missing pet. Fields marked with{" "}
          <span className="report-pet__required">*</span> are required.
        </p>
      </section>

      <form className="report-pet__form" onSubmit={handleSubmit}>
        <section className="report-pet__section">
          <h2>Pet Information</h2>

          <div className="report-pet__grid">
            <label>
              <span>Pet Name (optional)</span>
              <input type="text" name="petName" maxLength={100} />
              <span className="report-pet__hint">
                Leave blank if you don't know the name.
              </span>
            </label>

            <label>
              <span>
                Pet Type
                <Required />
              </span>

              <select
                name="petType"
                value={petType}
                onChange={(event) => setPetType(event.target.value)}
                required
              >
                <option value="" disabled>
                  Select type
                </option>
                <option>Dog</option>
                <option>Cat</option>
              </select>
            </label>

            <label>
              <span>
                Breed
                <Required />
              </span>

              {/* the choices depend on the pet type; changing the type resets the breed */}
              <select
                name="breed"
                key={petType}
                defaultValue=""
                required
                disabled={!petType}
              >
                <option value="" disabled>
                  {petType ? "Select breed" : "Select a pet type first"}
                </option>
                {(BREEDS[petType] ?? []).map((breed) => (
                  <option key={breed}>{breed}</option>
                ))}
              </select>
            </label>

            <label>
              <span>
                Color / Markings
                <Required />
              </span>
              <input type="text" name="color" maxLength={100} required />
            </label>
          </div>

          <ImageUpload id="petImages" label="Upload Pet Images" />
        </section>

        <section className="report-pet__section">
          <h2>Last Seen Information</h2>

          <div className="report-pet__grid">
            <label>
              <span>
                Date Last Seen
                <Required />
              </span>
              <input type="date" name="lastSeenDate" max={todayISO()} required />
            </label>

            <label>
              <span>
                Last Known Location
                <Required />
              </span>
              <input type="text" name="location" maxLength={255} required />
            </label>
          </div>

          <fieldset className="report-pet__radio-group">
            <legend>
              Status
              <Required />
            </legend>

            <div className="report-pet__radio-options">
              {STATUS_OPTIONS.map((option) => (
                <label key={option.value} className="report-pet__radio">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    required
                  />

                  <span>{option.value}</span>

                  <small className="report-pet__radio-note">
                    {option.summary} – {option.description}
                  </small>
                </label>
              ))}
            </div>
          </fieldset>

          <ImageUpload id="lastSeenImages" label="Upload Images" />

          <label>
            <span>Additional Details (optional)</span>

            <textarea name="details" rows="5" maxLength={2000} />
          </label>
        </section>

        <section className="report-pet__section">
          <h2>Contact Information</h2>

          <div className="report-pet__grid">
            <label>
              <span>
                First Name
                <Required />
              </span>
              <input type="text" name="firstName" maxLength={100} required />
            </label>

            <label>
              <span>
                Last Name
                <Required />
              </span>
              <input type="text" name="lastName" maxLength={100} required />
            </label>

            <label>
              <span>
                Contact Number
                <Required />
              </span>
              <input type="tel" name="contactNumber" required />
            </label>

            <label>
              <span>
                Email Address
                <Required />
              </span>
              <input type="email" name="contactEmail" required />
            </label>
          </div>
        </section>

        {errors.length > 0 && (
          <ul className="report-pet__error" role="alert">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <button type="submit" className="report-pet__submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Missing Pet Report"}
        </button>
      </form>
    </div>
  );
}

export default ReportMissingPet;
