import { useState } from "react";

import Modal from "../common/Modal.jsx";
import ImageDropzone from "./ImageDropzone.jsx";
import { submitClaim } from "../../services/claimService.js";
import { formatApiError } from "../../services/authService.js";
import { displayPetName } from "../../utils/petName.js";
import useAuth from "../../hooks/useAuth.js";

const toISO = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

function ClaimForm({ report, onClose, onSubmitted }) {
  const { user } = useAuth();

  // contact details start from the account
  const [values, setValues] = useState({
    name: user?.name ?? "",
    number: user?.phone ?? "",
    email: user?.email ?? "",
    pickup: "",
  });
  const [proof, setProof] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // pickup: today or later, and no later than 7 days from today (worked out once, when the form opens)
  const [pickupRange] = useState(() => {
    const today = new Date();
    const latest = new Date();
    latest.setDate(latest.getDate() + 7);

    return { min: toISO(today), max: toISO(latest) };
  });

  const setField = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const body = new FormData();
    body.append("contact_name", values.name.trim());
    body.append("contact_number", values.number.trim());
    body.append("contact_email", values.email.trim());
    body.append("pickup_date", values.pickup);
    proof.forEach((item) => body.append("proof_images[]", item.file));

    setErrors({});
    setSubmitting(true);

    try {
      await submitClaim(report.id, body);
      setDone(true);
      onSubmitted?.();
    } catch (error) {
      const { message, fields } = formatApiError(error);
      setErrors(Object.keys(fields).length ? fields : { form: message });
    }

    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="mform">
        <p>
          <strong>Claim submitted.</strong> Pound staff will review your proof of ownership and
          contact you. You can follow its status under My Missing Pet Reports.
        </p>

        <div className="emergency__nav">
          <button type="button" className="mform__primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const fieldError = (field) =>
    errors[field] && (
      <p className="mform__error" role="alert">{errors[field]}</p>
    );

  return (
    <form className="mform" onSubmit={handleSubmit} noValidate>
      <p className="emergency__hint">
        Claim {displayPetName(report.name)} if this is your pet. Send your contact details, the
        day you can pick it up, and 2 to 3 photos that show it is yours.
      </p>

      <div className={`mform__field ${errors.contact_name ? "mform__field--invalid" : ""}`}>
        <label className="mform__label" htmlFor="claim-name">Your Name</label>
        <input
          id="claim-name"
          className="mform__input"
          type="text"
          autoComplete="name"
          maxLength={255}
          value={values.name}
          onChange={setField("name")}
        />
        {fieldError("contact_name")}
      </div>

      <div className="mform__row">
        <div className={`mform__field ${errors.contact_number ? "mform__field--invalid" : ""}`}>
          <label className="mform__label" htmlFor="claim-number">Contact Number</label>
          <input
            id="claim-number"
            className="mform__input"
            type="tel"
            autoComplete="tel"
            placeholder="0917 123 4567"
            value={values.number}
            onChange={setField("number")}
          />
          {fieldError("contact_number")}
        </div>

        <div className={`mform__field ${errors.contact_email ? "mform__field--invalid" : ""}`}>
          <label className="mform__label" htmlFor="claim-email">
            Email <span className="mform__optional">(optional)</span>
          </label>
          <input
            id="claim-email"
            className="mform__input"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={setField("email")}
          />
          {fieldError("contact_email")}
        </div>
      </div>

      <div className={`mform__field ${errors.pickup_date ? "mform__field--invalid" : ""}`}>
        <label className="mform__label" htmlFor="claim-pickup">Pickup Date</label>
        <input
          id="claim-pickup"
          className="mform__input"
          type="date"
          min={pickupRange.min}
          max={pickupRange.max}
          value={values.pickup}
          onChange={setField("pickup")}
        />
        {fieldError("pickup_date")}
      </div>

      <div className={`mform__field ${errors.proof_images ? "mform__field--invalid" : ""}`}>
        <span className="mform__label">Proof of Ownership (2 to 3 photos)</span>
        <ImageDropzone items={proof} onChange={setProof} maxFiles={3} />
        {fieldError("proof_images")}
      </div>

      {(errors.report || errors.form) && (
        <p className="mform__error" role="alert">{errors.report || errors.form}</p>
      )}

      <div className="emergency__nav">
        <button type="button" className="mform__secondary" onClick={onClose}>
          Cancel
        </button>

        <button type="submit" className="mform__primary" disabled={submitting}>
          {submitting ? "Sending..." : "Submit Claim"}
        </button>
      </div>
    </form>
  );
}

// "Claim Pet" form: contact details, pickup date and proof of ownership photos.
// Rendered by the page (outside the clickable card), mounted only while open so it always starts empty.
function ClaimPetModal({ report, onClose, onSubmitted }) {
  return (
    <Modal
      isOpen={Boolean(report)}
      onClose={onClose}
      title={report ? `Claim ${displayPetName(report.name)}` : "Claim Pet"}
      size="large"
      hideScrollbar
    >
      {report && <ClaimForm report={report} onClose={onClose} onSubmitted={onSubmitted} />}
    </Modal>
  );
}

export default ClaimPetModal;
