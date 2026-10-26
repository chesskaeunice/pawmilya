import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import Modal from "../common/Modal.jsx";
import ImageDropzone from "./ImageDropzone.jsx";
import BreedSelect from "../common/BreedSelect.jsx";
import ErrorBoundary from "../common/ErrorBoundary.jsx";
import SuggestInput from "../common/SuggestInput.jsx";
import { formatDateTime } from "../../utils/formatDateTime.js";
import { displayPetName } from "../../utils/petName.js";
import { submitMissingPetReport } from "../../services/missingPetService.js";
import { formatApiError } from "../../services/authService.js";
import {
  CITY,
  QUIAPO_BARANGAYS,
  QUIAPO_STREETS,
  formatQuiapoLocation,
  isQuiapoBarangay,
} from "../../config/quiapoLocations.js";

import "../common/ModalForm.css";
import "./EmergencyReportModal.css";

const TOTAL_STEPS = 2;

const emptyForm = {
  // Step 1: the pet
  petName: "",
  species: "",
  otherSpecies: "",
  breed: "",
  color: "",
  description: "",
  // Step 2: last seen + contact
  reporterType: "",
  street: "",
  barangay: "",
  dateTime: "",
  firstName: "",
  lastName: "",
  contactNumber: "",
  contactEmail: "",
};

const STEP_1_FIELDS = ["species", "otherSpecies", "color"];
const STEP_2_FIELDS = ["street", "barangay", "dateTime", "reporterType", "firstName", "lastName", "contactNumber", "contactEmail"];

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
  if (!values.color.trim()) {
    errors.color = "Please enter the color or markings.";
  }

  // Step 2
  if (!values.street.trim()) {
    errors.street = "Please enter the street name.";
  }
  if (!isQuiapoBarangay(values.barangay.trim())) {
    errors.barangay = "Please choose a barangay from the list.";
  }
  if (!values.dateTime) {
    errors.dateTime = "Please enter the date and time.";
  } else if (isFutureDateTime(values.dateTime)) {
    errors.dateTime = "The date and time cannot be in the future.";
  }
  if (!values.reporterType) {
    errors.reporterType = "Please choose one.";
  }
  if (!values.firstName.trim()) {
    errors.firstName = "Please enter your first name.";
  }
  if (!values.lastName.trim()) {
    errors.lastName = "Please enter your last name.";
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

  // The API still gets one `location` string
  const location = formatQuiapoLocation(values.street, values.barangay);

  /* ---------- what is still missing in each step ---------- */

  const petPhotos = photo1.length + photo2.length;
  const areaPhotos = area1.length + area2.length;

  const step1Missing = [];
  if (petPhotos < 2) step1Missing.push(petPhotos === 0 ? "2 pet photos" : "1 more pet photo");
  if (errors.species) step1Missing.push("the pet type");
  if (errors.otherSpecies) step1Missing.push("what animal it is");
  if (errors.color) step1Missing.push("the color / markings");

  const step2Missing = [];
  if (areaPhotos < 1) step2Missing.push("at least 1 area photo");
  if (errors.street) step2Missing.push("the street");
  if (errors.barangay) step2Missing.push("the barangay");
  if (errors.dateTime) step2Missing.push(values.dateTime ? "a date and time that is not in the future" : "the date and time");
  if (errors.reporterType) step2Missing.push("who is reporting (pet owner or concerned citizen)");
  if (errors.firstName) step2Missing.push("your first name");
  if (errors.lastName) step2Missing.push("your last name");
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

  // `reserve` puts the error in the gap below the field, so fields below do not move
  const fieldError = (field, reserve = false) =>
    (reserve || showError(field)) && (
      <p
        className={reserve ? "mform__error mform__error--reserved" : "mform__error"}
        role="alert"
      >
        {showError(field)}
      </p>
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
    body.append("color", values.color.trim());
    body.append("details", values.description.trim());
    body.append("location", location);
    body.append("last_seen_at", values.dateTime);
    body.append("reporter_type", values.reporterType);
    body.append("contact_name", `${values.firstName} ${values.lastName}`.trim());
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
      if (error.response?.status === 429 && error.response.data?.limit_reached) {
        // posting limit reached: the server's message has the time left; photos and answers stay
        setSubmitError(error.response.data.message);
      } else {
        const { message, fields } = formatApiError(error);
        setSubmitError(Object.values(fields)[0] || message);
      }
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
            <dd>{location}</dd>
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
            <label className="mform__label" htmlFor="er-species">Pet Type</label>
            <select
              id="er-species"
              className="mform__select"
              value={values.species}
              onChange={(event) =>
                setValues((current) => ({ ...current, species: event.target.value, breed: "" }))
              }
              onBlur={markTouched("species")}
              aria-invalid={Boolean(showError("species"))}
            >
              <option value="" disabled>Select pet type</option>
              <option>Dog</option>
              <option>Cat</option>
              <option>Others</option>
            </select>
            {fieldError("species", true)}
          </div>
        </div>

        {/* Only shown when the pet type is "Others" */}
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
          {fieldError("otherSpecies", true)}
        </div>
        )}

        {/* Optional. Depends on the pet type, so it starts over when the type changes (key).
            The Breed dropdown keeps its slot. */}
        <div className="mform__breed">
          <BreedSelect
            key={values.species || "none"}
            petType={values.species}
            inline
            reserveSpecify
            onChange={(breed) => setValues((current) => ({ ...current, breed }))}
          />
        </div>

        <div className={fieldClass("color")}>
          <label className="mform__label" htmlFor="er-color">Color / Markings</label>
          <input
            id="er-color"
            name="color"
            className="mform__input"
            type="text"
            maxLength={100}
            value={values.color}
            onChange={setField("color")}
            onBlur={markTouched("color")}
            aria-invalid={Boolean(showError("color"))}
          />
          {fieldError("color", true)}
        </div>

        <div className="mform__field">
          <label className="mform__label" htmlFor="er-description">
            Description <span className="mform__optional">(optional)</span>
          </label>
          <textarea
            id="er-description"
            className="mform__textarea"
            placeholder="Collar, behavior, scars, anything else that helps identify the pet"
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

        <div className={fieldClass("street")}>
          <label className="mform__label" htmlFor="er-street">Street</label>
          <SuggestInput
            listId="er-street-list"
            options={QUIAPO_STREETS}
            id="er-street"
            className="mform__input"
            maxLength={200}
            placeholder="Example: Hidalgo Street"
            value={values.street}
            onChange={setField("street")}
            onBlur={markTouched("street")}
            aria-invalid={Boolean(showError("street"))}
          />
          {fieldError("street", true)}
        </div>

        <div className="mform__row">
          <div className={fieldClass("barangay")}>
            <label className="mform__label" htmlFor="er-barangay">Barangay</label>
            <SuggestInput
              listId="er-barangay-list"
              options={QUIAPO_BARANGAYS}
              id="er-barangay"
              className="mform__input"
              placeholder="Example: Barangay 306"
              value={values.barangay}
              onChange={setField("barangay")}
              onBlur={markTouched("barangay")}
              aria-invalid={Boolean(showError("barangay"))}
            />
            {fieldError("barangay", true)}
          </div>

          <div className="mform__field">
            <label className="mform__label" htmlFor="er-city">City</label>
            <input
              id="er-city"
              className="mform__input"
              type="text"
              value={CITY}
              readOnly
            />
          </div>
        </div>

        {values.reporterType === "Citizen" && (
          <p className="emergency__note">
            <strong>The pet is brought to the pound.</strong> When you submit, the pet is registered at
            the pound as Rescued, and its owner has 7 days to claim it.
          </p>
        )}

        {values.reporterType === "Owner" && (
          <p className="emergency__note">
            <strong>Your pet will be listed as Lost</strong> so the community and the pound can help look
            for it. If a pet matching yours is brought to the pound, the pound will contact you.
          </p>
        )}

        <div className={fieldClass("dateTime")}>
          <label className="mform__label" htmlFor="er-datetime">
            {values.reporterType === "Citizen" ? "Date & Time Rescued" : "Date & Time Last Seen"}
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

        <fieldset className={`${fieldClass("reporterType")} emergency__who`}>
          <legend className="mform__label">I am the</legend>

          <div className="emergency__who-options">
            {[["Owner", "Pet owner"], ["Citizen", "Concerned citizen"]].map(([value, label]) => (
              <label key={value} className="emergency__who-option">
                <input
                  type="radio"
                  name="reporterType"
                  value={value}
                  checked={values.reporterType === value}
                  onChange={setField("reporterType")}
                  onBlur={markTouched("reporterType")}
                  aria-invalid={Boolean(showError("reporterType"))}
                />
                {label}
              </label>
            ))}
          </div>

          {fieldError("reporterType", true)}
        </fieldset>

        <div className="mform__row">
          <div className={fieldClass("firstName")}>
            <label className="mform__label" htmlFor="er-first-name">First Name</label>
            <input
              id="er-first-name"
              className="mform__input"
              type="text"
              autoComplete="given-name"
              maxLength={100}
              placeholder="Juan"
              value={values.firstName}
              onChange={setField("firstName")}
              onBlur={markTouched("firstName")}
              aria-invalid={Boolean(showError("firstName"))}
            />
            {fieldError("firstName")}
          </div>

          <div className={fieldClass("lastName")}>
            <label className="mform__label" htmlFor="er-last-name">Last Name</label>
            <input
              id="er-last-name"
              className="mform__input"
              type="text"
              autoComplete="family-name"
              maxLength={100}
              placeholder="Dela Cruz"
              value={values.lastName}
              onChange={setField("lastName")}
              onBlur={markTouched("lastName")}
              aria-invalid={Boolean(showError("lastName"))}
            />
            {fieldError("lastName")}
          </div>
        </div>

        <div className="mform__row">
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
      hideScrollbar
    >
      {/* mounted only while open, so every opening starts with an empty form; if the form
          fails to render, a message with a Close button replaces it */}
      <ErrorBoundary onClose={onClose}>
        <EmergencyReportFlow onClose={onClose} />
      </ErrorBoundary>
    </Modal>
  );
}

export default EmergencyReportModal;
