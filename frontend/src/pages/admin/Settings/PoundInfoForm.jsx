import { useState } from "react";

import { Landmark, Save } from "lucide-react";

import FieldError from "../../../components/common/FieldError.jsx";
import useFetch from "../../../hooks/useFetch.js";
import { getPoundInfo, savePoundInfo } from "../../../services/siteService.js";
import { formatApiError } from "../../../services/authService.js";

const MAX = { name: 120, address: 255, phone: 40, email: 255, hours: 255, vision: 1000, mission: 1000 };

// "Pound information" card (kennel manager): the contact details and About Us texts shown on the
// public site. The website name stays fixed.
function PoundInfoForm() {
  const { data, error: loadError, reload } = useFetch(() => getPoundInfo(), []);

  // what was typed since the last save; everything else comes from the server
  const [edits, setEdits] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  if (loadError) return <p role="alert">Could not load the pound information.</p>;
  if (!data) return null;

  const saved = {
    name: data.pound.name,
    address: data.pound.address,
    phone: data.pound.phone,
    email: data.pound.email,
    hours: data.pound.hours,
    vision: data.about.vision,
    mission: data.about.mission,
  };
  const values = { ...saved, ...edits };

  const change = (field) => (event) => {
    setEdits({ ...edits, [field]: event.target.value });
    setErrors({ ...errors, [field]: "" });
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await savePoundInfo(values);
      setEdits({});
      setErrors({});
      setMessage("Pound information saved. The public pages now show it.");
      reload();
    } catch (error) {
      const { message: text, fields } = formatApiError(error);
      setErrors(fields);
      setMessage(Object.keys(fields).length ? "" : text);
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, props = {}) => {
    const Tag = props.textarea ? "textarea" : "input";

    return (
      <label>
        {label}
        <Tag
          className={props.textarea ? "settings__textarea" : undefined}
          rows={props.textarea ? 4 : undefined}
          type={props.type}
          value={values[name]}
          maxLength={MAX[name]}
          onChange={change(name)}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={`pound-${name}-error`}
        />
        <FieldError id={`pound-${name}-error`} message={errors[name]} />
      </label>
    );
  };

  return (
    <form className="staff-detail-card settings__section" onSubmit={submit} noValidate>
      <h2 className="staff-detail-card__title">
        <Landmark size={15} />
        Pound information
      </h2>

      <div className="settings__fields">
        {field("name", "Pound name")}
        {field("phone", "Contact number")}
        {field("email", "Contact email", { type: "email" })}
        {field("hours", "Operating hours")}
      </div>

      <div className="settings__fields settings__fields--single">
        {field("address", "Address (street / barangay, Quiapo, Manila)")}
        {field("vision", "About Us: Vision", { textarea: true })}
        {field("mission", "About Us: Mission", { textarea: true })}
      </div>

      {message && <p role="status">{message}</p>}

      <div className="settings__actions">
        <button type="submit" className="staff-button" disabled={saving}>
          <Save size={13} />
          {saving ? "Saving..." : "Save Pound Information"}
        </button>
      </div>
    </form>
  );
}

export default PoundInfoForm;
