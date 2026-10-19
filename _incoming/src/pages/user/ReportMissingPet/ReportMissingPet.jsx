import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ChevronLeft, X } from "lucide-react";

import "./ReportMissingPet.css";

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

function ReportMissingPet() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    alert(
      "Missing pet report submitted. Laravel integration will be added later."
    );
  };

  return (
    <div className="report-pet">
      <button
        type="button"
        className="report-pet__back"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={15} />
        Back
      </button>

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
              <span>
                Pet Name
                <Required />
              </span>
              <input type="text" required />
            </label>

            <label>
              <span>
                Pet Type
                <Required />
              </span>

              <select defaultValue="" required>
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
              <input type="text" required />
            </label>

            <label>
              <span>
                Color / Markings
                <Required />
              </span>
              <input type="text" required />
            </label>
          </div>

          <label>
            <span>
              Sex
              <Required />
            </span>

            <select defaultValue="" required>
              <option value="" disabled>
                Select sex
              </option>

              <option>Male</option>
              <option>Female</option>
              <option>Unknown</option>
            </select>
          </label>

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
              <input type="date" required />
            </label>

            <label>
              <span>
                Last Known Location
                <Required />
              </span>
              <input type="text" required />
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

            <textarea rows="5" />
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
              <input type="text" required />
            </label>

            <label>
              <span>
                Last Name
                <Required />
              </span>
              <input type="text" required />
            </label>

            <label>
              <span>
                Contact Number
                <Required />
              </span>
              <input type="tel" required />
            </label>

            <label>
              <span>
                Email Address
                <Required />
              </span>
              <input type="email" required />
            </label>
          </div>
        </section>

        <button type="submit" className="report-pet__submit">
          Submit Missing Pet Report
        </button>
      </form>
    </div>
  );
}

export default ReportMissingPet;