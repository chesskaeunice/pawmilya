import { useState } from "react";

import { passwordChecks, passwordStrength, STRENGTH_LABELS } from "../../utils/passwordRules.js";

import "./PasswordInput.css";

// Password field with a show/hide toggle.
// Optional: `onFocus` / `onBlur` fire when focus enters / leaves the whole field
// (the Show button counts as inside), `describedBy` lists the ids of its error and help text,
// `invalid` marks it as having an error (red border, see globals.css).
export function PasswordInput({
  id, name, autoComplete, placeholder, value, onChange, required, onFocus, onBlur, describedBy, invalid,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="password-input"
      onFocus={onFocus}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.(event);
      }}
    >
      <input
        type={visible ? "text" : "password"}
        id={id}
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
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

// Strength meter and live rule checklist.
// Always visible by default. With `collapsible` it stays in the DOM (screen readers
// still read it) but is folded away unless the password field has focus (`focused`),
// the password is typed but not valid yet, or `forceOpen` (a failed submit) applies.
export function PasswordHelp({ password, context, id, collapsible = false, focused = false, forceOpen = false }) {
  const strength = passwordStrength(password, context);
  const valid = passwordChecks(password, context).every((check) => check.ok);
  const open = !collapsible || focused || (Boolean(password) && !valid) || (forceOpen && !valid);

  return (
    <div
      id={id}
      className={collapsible ? `password-help password-help--collapsible${open ? " is-open" : ""}` : "password-help"}
    >
      <div className="password-help__meter" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <span key={level} className={level <= strength ? `is-on level-${strength}` : ""} />
        ))}
      </div>

      <p className="password-help__label" aria-live="polite">
        {password ? `Strength: ${STRENGTH_LABELS[strength]}` : "Choose a strong password"}
      </p>

      <ul className="password-help__list" aria-live={collapsible ? "polite" : undefined}>
        {passwordChecks(password, context).map((check) => {
          // Display only: nothing shows as passed until something is typed
          const passed = Boolean(password) && check.ok;

          return (
            <li key={check.label} className={passed ? "is-ok" : ""}>
              {passed ? "✓" : "○"} {check.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
