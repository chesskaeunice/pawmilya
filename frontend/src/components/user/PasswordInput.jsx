import { useState } from "react";

import { passwordChecks, passwordStrength, STRENGTH_LABELS } from "../../utils/passwordRules.js";

import "./PasswordInput.css";

// Password field with a show/hide toggle
export function PasswordInput({ id, name, autoComplete, placeholder, value, onChange, required }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <input
        type={visible ? "text" : "password"}
        id={id}
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />

      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

// Strength meter and live rule checklist
export function PasswordHelp({ password, context }) {
  const strength = passwordStrength(password, context);

  return (
    <div className="password-help">
      <div className="password-help__meter" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <span key={level} className={level <= strength ? `is-on level-${strength}` : ""} />
        ))}
      </div>

      <p className="password-help__label" aria-live="polite">
        {password ? `Strength: ${STRENGTH_LABELS[strength]}` : "Choose a strong password"}
      </p>

      <ul className="password-help__list">
        {passwordChecks(password, context).map((check) => (
          <li key={check.label} className={check.ok ? "is-ok" : ""}>
            {check.ok ? "✓" : "○"} {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FieldError({ message }) {
  return message ? <span className="auth-field-error" role="alert">{message}</span> : null;
}
