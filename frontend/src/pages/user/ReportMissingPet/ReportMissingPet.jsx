import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { X } from "lucide-react";

import BreedSelect from "../../../components/common/BreedSelect.jsx";
import FieldError from "../../../components/common/FieldError.jsx";
import { submitMissingPetReport } from "../../../services/missingPetService.js";
import { formatApiError } from "../../../services/authService.js";
import useAuth from "../../../hooks/useAuth.js";

import "./ReportMissingPet.css";
import BackButton from "../../../components/common/BackButton.jsx";

// "I am the": value sent to the API, label shown
const REPORTER_TYPES = [
  { value: "Owner", label: "Pet owner" },
  { value: "Citizen", label: "Concerned citizen" },
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

// Surname parts that belong with the last word: "Juan Dela Cruz" -> "Juan" + "Dela Cruz"
const SURNAME_PARTICLES = new Set(["de", "del", "dela", "delos", "san", "santa", "van", "von"]);

// The account has one full name; the form has first and last name. A single word is only a first name.
function splitName(fullName) {
  const words = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return { firstName: words[0] ?? "", lastName: "" };

  let lastStart = words.length - 1;
  while (lastStart > 1 && SURNAME_PARTICLES.has(words[lastStart - 1].toLowerCase())) lastStart -= 1;

  return { firstName: words.slice(0, lastStart).join(" "), lastName: words.slice(lastStart).join(" ") };
}

// Open to guests (no login needed). A logged-in citizen's report is linked to the account.
function ReportMissingPet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const formRef = useRef(null);

  // A logged-in user's contact fields start filled with the account data (still editable). This runs
  // when the account arrives, and only fills fields that are still empty, so typing is never replaced.
  useEffect(() => {
    if (!user || !formRef.current) return;

    const { firstName, lastName } = splitName(user.name);
    const account = { firstName, lastName, contactNumber: user.phone, contactEmail: user.email };

    for (const [field, value] of Object.entries(account)) {
      const input = formRef.current.elements[field];
      if (input && value && !input.value) input.value = value;
    }
  }, [user]);

  const [petType, setPetType] = useState("");
  const isOther = petType === "Others";
  const [errors, setErrors] = useState([]);
  const [reporterTypeError, setReporterTypeError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // a second click while the first is still sending does nothing
    if (submitting) return;

    const form = event.currentTarget.elements;

    if (!form.reporterType.value) {
      setReporterTypeError("Please choose one.");
      form.reporterType[0].focus();
      return;
    }

    const body = new FormData();

    body.append("name", form.petName.value);
    body.append("species", isOther ? "Other" : form.petType.value);
    body.append("other_species", isOther ? form.otherSpecies.value.trim() : "");
    body.append("breed", form.breed.value);
    body.append("color", form.color.value);
    body.append("last_seen_at", `${form.lastSeenDate.value} 00:00:00`);
    body.append("location", form.location.value);
    body.append("details", form.details.value);
    body.append("reporter_type", form.reporterType.value);
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
      setReporterTypeError(fields.reporter_type ?? "");
      const messages = Object.values({ ...fields, reporter_type: undefined }).filter(Boolean);
      setErrors(messages.length ? messages : fields.reporter_type ? [] : [message]);
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

      <form className="report-pet__form" ref={formRef} onSubmit={handleSubmit}>
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
                <option>Others</option>
              </select>
            </label>

            {/* Under Pet Type, in the slot the Breed dropdown uses for dogs and cats */}
            {isOther && (
              <label className="report-pet__other">
                <span>
                  Specify the animal
                  <Required />
                </span>
                <input
                  type="text"
                  name="otherSpecies"
                  maxLength={100}
                  placeholder="Example: Rabbit, Bird, Turtle"
                  required
                />
              </label>
            )}

            {/* Breed type, Breed and Specify the breed; optional here; the field starts over when the pet type changes */}
            <BreedSelect key={petType || "none"} petType={petType} inline />

            <label className="report-pet__color">
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

          <p className="report-pet__note">
            <strong>The pet is brought to the pound.</strong> When you submit this report, the pet is
            registered at the pound as Rescued, and its owner has 7 days to claim it.
          </p>

          <ImageUpload id="lastSeenImages" label="Upload Images" />

          <label>
            <span>Additional Details (optional)</span>

            <textarea name="details" rows="5" maxLength={2000} />
          </label>
        </section>

        <section className="report-pet__section">
          <h2>Contact Information</h2>

          <fieldset className="report-pet__radio-group" aria-describedby="reporter-type-error">
            <legend>
              I am the
              <Required />
            </legend>

            <div className="report-pet__radio-field">
              <div className="report-pet__radio-options">
                {REPORTER_TYPES.map((option) => (
                  <label key={option.value} className="report-pet__radio">
                    <input
                      type="radio"
                      name="reporterType"
                      value={option.value}
                      onChange={() => setReporterTypeError("")}
                    />

                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              <FieldError id="reporter-type-error" message={reporterTypeError} />
            </div>
          </fieldset>

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
