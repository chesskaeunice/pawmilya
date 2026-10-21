import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import Modal from "../common/Modal.jsx";
import ImageDropzone from "./ImageDropzone.jsx";
import { formatDateTime } from "../../utils/formatDateTime.js";
import { displayPetName } from "../../utils/petName.js";
import { submitMissingPetReport } from "../../services/missingPetService.js";
import { formatApiError } from "../../services/authService.js";

import "../common/ModalForm.css";
import "./EmergencyReportModal.css";

const TOTAL_STEPS = 2;

const emptyForm = {
  // Step 1: the pet
  petName: "",
  species: "",
  otherSpecies: "",
  breed: "",
  description: "",
  // Step 2: last seen + contact
  reportType: "Lost",
  location: "",
  dateTime: "",
  contactName: "",
  contactNumber: "",
  contactEmail: "",
};

const STEP_1_FIELDS = ["species", "otherSpecies"];
const STEP_2_FIELDS = ["location", "dateTime", "contactName", "contactNumber", "contactEmail"];

function isFutureDateTime(value) {
  const time = new Date(value).getTime();
  return !Number.isNaN(time) && time > Date.now();
}

function validate(values) {
  const errors = {};

  // Step 1 (Pet Name is optional)
  if (!values.species) {
    errors.species = "Please choose the type of animal.";
  }
  if (values.species === "Others" && !values.otherSpecies.trim()) {
    errors.otherSpecies = "Please tell us what animal it is.";
  }

  // Step 2
  if (!values.location.trim()) {
    errors.location = "Please tell us where the pet was last seen.";
  }
  if (!values.dateTime) {
    errors.dateTime = "Please enter the date and time.";
  } else if (isFutureDateTime(values.dateTime)) {
    errors.dateTime = "The date and time cannot be in the future.";
  }
  if (!values.contactName.trim()) {
    errors.contactName = "Please enter your name.";
  }

  const digits = values.contactNumber.replace(/\D/g, "");
  if (!values.contactNumber.trim()) {
    errors.contactNumber = "Please enter a contact number.";
  } else if (digits.length < 7 || /[^\d\s+()-]/.test(values.contactNumber)) {
    errors.contactNumber = "Enter a valid contact number, for example 0917 123 4567.";
  }

  if (values.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail.trim())) {
    errors.contactEmail = "Enter a valid email address, or leave it empty.";
  }

  return errors;
}

// "a, b and c"
function joinList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// Open to guests (no login needed); the report goes to the API.
// Step 1: the pet (2 photos + details). Step 2: where it was last seen + contact.
function EmergencyReportFlow({ onClose }) {
  const rootRef = useRef(null);

  const [step, setStep] = useState(1);
  const [values, setValues] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  // each slot holds 0 or 1 photo ({ id, file, url })
  const [photo1, setPhoto1] = useState([]);
  const [photo2, setPhoto2] = useState([]);
  const [area1, setArea1] = useState([]);
  const [area2, setArea2] = useState([]);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(values);
  const showError = (field) => (touched[field] ? errors[field] : "");

  /* ---------- what is still missing in each step ---------- */

  const petPhotos = photo1.length + photo2.length;
  const areaPhotos = area1.length + area2.length;

  const step1Missing = [];
  if (petPhotos < 2) step1Missing.push(petPhotos === 0 ? "2 pet photos" : "1 more pet photo");
  if (errors.species) step1Missing.push("the species");
  if (errors.otherSpecies) step1Missing.push("what animal it is");

  const step2Missing = [];
  if (areaPhotos < 1) step2Missing.push("at least 1 area photo");
  if (!values.location.trim()) step2Missing.push("the last seen location");
  if (errors.dateTime) step2Missing.push(values.dateTime ? "a date and time that is not in the future" : "the date and time");
  if (!values.contactName.trim()) step2Missing.push("your name");
  if (errors.contactNumber) step2Missing.push(values.contactNumber.trim() ? "a valid contact number" : "a contact number");
  if (errors.contactEmail) step2Missing.push("a valid email (or leave it empty)");

  const step1Ready = step1Missing.length === 0;
  const step2Ready = step2Missing.length === 0;

  /* ---------- helpers ---------- */

  const goToStep = (next) => {
    setStep(next);
    // start the new step at the top of the pop-up
    rootRef.current?.closest(".modal")?.scrollTo({ top: 0 });
  };

  const setField = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const markTouched = (field) => () =>
    setTouched((current) => ({ ...current, [field]: true }));

  const touchAll = (fields) =>
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(fields.map((field) => [field, true])),
    }));

  const fieldClass = (field) =>
    `mform__field ${showError(field) ? "mform__field--invalid" : ""}`;

  const fieldError = (field) =>
    showError(field) && (
      <p className="mform__error" role="alert">{showError(field)}</p>
    );

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Enter on Step 1 moves on (only when Step 1 is complete); it never submits
    if (step === 1) {
      touchAll(STEP_1_FIELDS);
      if (step1Ready) goToStep(2);
      return;
    }

    touchAll(STEP_2_FIELDS);
    if (!step1Ready || !step2Ready) return;

    // a second click while the first is still sending does nothing
    if (submitting) return;

    const body = new FormData();
    body.append("name", values.petName.trim());
    body.append("species", values.species === "Others" ? "Other" : values.species);
    body.append("other_species", values.species === "Others" ? values.otherSpecies.trim() : "");
    body.append("breed", values.breed.trim());
    body.append("details", values.description.trim());
    body.append("status", values.reportType);
    body.append("location", values.location.trim());
    body.append("last_seen_at", values.dateTime);
    body.append("contact_name", values.contactName.trim());
    body.append("contact_number", values.contactNumber.trim());
    body.append("contact_email", values.contactEmail.trim());
    [...photo1, ...photo2].forEach((item) => body.append("pet_images[]", item.file));
    [...area1, ...area2].forEach((item) => body.append("last_seen_images[]", item.file));

    setSubmitError("");
    setSubmitting(true);

    try {
      const report = await submitMissingPetReport(body);

      setResult({
        reference: `MPR-${String(report.id).padStart(3, "0")}`,
        submittedAt: new Date().toISOString(),
      });
    } catch (error) {
      const { message, fields } = formatApiError(error);
      setSubmitError(Object.values(fields)[0] || message);
    }

    setSubmitting(false);
  };

  /* ---------- confirmation ---------- */

  if (result?.reference) {
    return (
      <div className="mform__success">
        <span className="mform__success-icon">
          <CheckCircle2 size={36} aria-hidden="true" />
        </span>

        <h3>Report submitted</h3>

        <p>
          Thank you. Your report for <strong>{displayPetName(values.petName)}</strong> has
          been received. Keep your reference number for follow-ups.
        </p>

        <dl className="emergency__summary">
          <div>
            <dt>Reference</dt>
            <dd>{result.reference}</dd>
          </div>
          <div>
            <dt>Last seen</dt>
            <dd>{values.location.trim()}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>{formatDateTime(result.submittedAt)}</dd>
          </div>
        </dl>

        <div className="emergency__done-actions">
          <Link to="/missing-pets" className="mform__secondary" onClick={onClose}>
            View Missing Pets
          </Link>

          <button type="button" className="mform__primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    );
  }

  /* ---------- form (2 steps) ---------- */

  return (
    <form className="mform" onSubmit={handleSubmit} noValidate ref={rootRef}>

      <div className="emergency__steps">
        <p className="emergency__step-label" aria-live="polite">
          Step {step} of {TOTAL_STEPS}
        </p>

        <div
          className="emergency__progress"
          role="progressbar"
          aria-label="Report progress"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
        >
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <span
              key={index}
              className={
                index < step
                  ? "emergency__progress-part emergency__progress-part--done"
                  : "emergency__progress-part"
              }
            />
          ))}
        </div>
      </div>

      {/* Both steps stay mounted (the other one is only hidden), so photos,
          their previews and typed answers are kept when moving Back/Next */}

      {/* ================= STEP 1: the pet ================= */}

      <section className="emergency__step" hidden={step !== 1}>
        <h3 className="emergency__step-title">Photos of your pet</h3>

        <p className="mform__intro">
          Add 2 clear photos so people can recognize your pet.
        </p>

        <div className="emergency__photo-slots">
          <ImageDropzone items={photo1} onChange={setPhoto1} maxFiles={1} label="Photo 1" />
          <ImageDropzone items={photo2} onChange={setPhoto2} maxFiles={1} label="Photo 2" />
        </div>

        <div className="mform__row">
          <div className="mform__field">
            <label className="mform__label" htmlFor="er-name">
              Pet Name <span className="mform__optional">(optional)</span>
            </label>
            <input
              id="er-name"
              className="mform__input"
              type="text"
              placeholder="Example: Miming"
              value={values.petName}
              onChange={setField("petName")}
              aria-describedby="er-name-help"
            />
            <p className="emergency__hint" id="er-name-help">
              Leave blank if you don't know the name.
            </p>
          </div>

          <div className={fieldClass("species")}>
            <label className="mform__label" htmlFor="er-species">Species</label>
            <select
              id="er-species"
              className="mform__select"
              value={values.species}
              onChange={setField("species")}
              onBlur={markTouched("species")}
              aria-invalid={Boolean(showError("species"))}
            >
              <option value="" disabled>Select species</option>
              <option>Dog</option>
              <option>Cat</option>
              <option>Others</option>
            </select>
            {fieldError("species")}
          </div>
        </div>

        {values.species === "Others" && (
          <div className={fieldClass("otherSpecies")}>
            <label className="mform__label" htmlFor="er-other-species">Specify the animal</label>
            <input
              id="er-other-species"
              className="mform__input"
              type="text"
              placeholder="Example: Rabbit, Bird, Turtle"
              value={values.otherSpecies}
              onChange={setField("otherSpecies")}
              onBlur={markTouched("otherSpecies")}
              aria-invalid={Boolean(showError("otherSpecies"))}
            />
            {fieldError("otherSpecies")}
          </div>
        )}

        <div className="mform__field">
          <label className="mform__label" htmlFor="er-breed">
            Breed <span className="mform__optional">(optional)</span>
          </label>
          <input
            id="er-breed"
            className="mform__input"
            type="text"
            placeholder="Example: Aspin, Puspin, Shih Tzu"
            value={values.breed}
            onChange={setField("breed")}
          />
        </div>

        <div className="mform__field">
          <label className="mform__label" htmlFor="er-description">
            Description <span className="mform__optional">(optional)</span>
          </label>
          <textarea
            id="er-description"
            className="mform__textarea"
            placeholder="Color, markings, collar, behavior, anything that helps identify the pet"
            value={values.description}
            onChange={setField("description")}
          />
        </div>

        <p className="emergency__hint" aria-live="polite">
          {step1Ready
            ? "Step 1 is complete. You can continue."
            : `To continue, add ${joinList(step1Missing)}.`}
        </p>

        <button
          type="button"
          className="mform__primary"
          onClick={() => goToStep(2)}
          disabled={!step1Ready}
        >
          Next
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>

      {/* ================= STEP 2: last seen + contact ================= */}

      <section className="emergency__step" hidden={step !== 2}>
        <h3 className="emergency__step-title">Last seen location</h3>

        <p className="mform__intro">
          Add photos of the area where you last saw your pet.
        </p>

        <div className="emergency__photo-slots">
          <ImageDropzone items={area1} onChange={setArea1} maxFiles={1} label="Area photo 1" />
          <ImageDropzone items={area2} onChange={setArea2} maxFiles={1} label="Area photo 2" />
        </div>

        <p className="emergency__hint">
          At least 1 area photo is required. The second one is optional.
        </p>

        <div className={fieldClass("location")}>
          <label className="mform__label" htmlFor="er-location">Last Seen Location</label>
          <input
            id="er-location"
            className="mform__input"
            type="text"
            placeholder="Street, barangay, city"
            value={values.location}
            onChange={setField("location")}
            onBlur={markTouched("location")}
            aria-invalid={Boolean(showError("location"))}
          />
          {fieldError("location")}
        </div>

        <fieldset className="emergency__type">
          <legend className="mform__label">What are you reporting?</legend>

          <label className={values.reportType === "Lost" ? "emergency__choice emergency__choice--on" : "emergency__choice"}>
            <input
              type="radio"
              name="reportType"
              value="Lost"
              checked={values.reportType === "Lost"}
              onChange={setField("reportType")}
            />
            My pet is lost
          </label>

          <label className={values.reportType === "Sighted" ? "emergency__choice emergency__choice--on" : "emergency__choice"}>
            <input
              type="radio"
              name="reportType"
              value="Sighted"
              checked={values.reportType === "Sighted"}
              onChange={setField("reportType")}
            />
            I spotted a pet
          </label>
        </fieldset>

        <div className={fieldClass("dateTime")}>
          <label className="mform__label" htmlFor="er-datetime">
            Date &amp; Time {values.reportType === "Lost" ? "Lost" : "Spotted"}
          </label>
          <input
            id="er-datetime"
            className="mform__input"
            type="datetime-local"
            value={values.dateTime}
            onChange={setField("dateTime")}
            onBlur={markTouched("dateTime")}
            aria-invalid={Boolean(showError("dateTime"))}
          />
          {fieldError("dateTime")}
        </div>

        <h3 className="emergency__heading">Your contact details</h3>

        <div className="mform__row">
          <div className={fieldClass("contactName")}>
            <label className="mform__label" htmlFor="er-contact-name">Your Name</label>
            <input
              id="er-contact-name"
              className="mform__input"
              type="text"
              autoComplete="name"
              placeholder="Juan Dela Cruz"
              value={values.contactName}
              onChange={setField("contactName")}
              onBlur={markTouched("contactName")}
              aria-invalid={Boolean(showError("contactName"))}
            />
            {fieldError("contactName")}
          </div>

          <div className={fieldClass("contactNumber")}>
            <label className="mform__label" htmlFor="er-contact-number">Contact Number</label>
            <input
              id="er-contact-number"
              className="mform__input"
              type="tel"
              autoComplete="tel"
              placeholder="0917 123 4567"
              value={values.contactNumber}
              onChange={setField("contactNumber")}
              onBlur={markTouched("contactNumber")}
              aria-invalid={Boolean(showError("contactNumber"))}
            />
            {fieldError("contactNumber")}
          </div>
        </div>

        <div className={fieldClass("contactEmail")}>
          <label className="mform__label" htmlFor="er-contact-email">
            Email <span className="mform__optional">(optional)</span>
          </label>
          <input
            id="er-contact-email"
            className="mform__input"
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            value={values.contactEmail}
            onChange={setField("contactEmail")}
            onBlur={markTouched("contactEmail")}
            aria-invalid={Boolean(showError("contactEmail"))}
          />
          {fieldError("contactEmail")}
        </div>

        <p className="emergency__hint" aria-live="polite">
          {step2Ready
            ? "Everything is ready. You can submit your report."
            : `To submit, add ${joinList(step2Missing)}.`}
        </p>

        {submitError && (
          <p className="mform__error" role="alert">{submitError}</p>
        )}

        <div className="emergency__nav">
          <button
            type="button"
            className="mform__secondary"
            onClick={() => goToStep(1)}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Back
          </button>

          <button
            type="submit"
            className="mform__primary mform__primary--danger"
            disabled={!step2Ready || !step1Ready || submitting}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </section>

    </form>
  );
}

function EmergencyReportModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report a Missing Pet"
      size="large"
    >
      {/* mounted only while open, so every opening starts with an empty form */}
      <EmergencyReportFlow onClose={onClose} />
    </Modal>
  );
}

export default EmergencyReportModal;
