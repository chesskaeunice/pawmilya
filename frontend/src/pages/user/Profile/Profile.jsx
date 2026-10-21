import { useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import "./Profile.css";
import BackButton from "../../../components/common/BackButton.jsx";

/* ---------- mock profile store (no API yet) ----------
   Kept in memory for this session, and (except the password) in
   sessionStorage so the saved values also survive a page reload. */

const STORAGE_KEY = "pawmilya-mock-profile";

const DEFAULT_PROFILE = {
  fullName: "Username",
  birthDate: "",
  email: "user@email.com",
  phone: "",
  address: "",
  password: "password123",
};

let memoryProfile = null;

function loadProfile() {
  if (memoryProfile) return memoryProfile;

  let stored = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    stored = {};
  }

  memoryProfile = { ...DEFAULT_PROFILE, ...stored };
  return memoryProfile;
}

function saveProfile(profile) {
  memoryProfile = profile;

  try {
    // never keep the password in browser storage, even as mock data
    const stored = { ...profile };
    delete stored.password;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* storage can be blocked; the in-memory copy still works */
  }
}

/* ---------- validation ---------- */

const FIELD_ORDER = ["fullName", "birthDate", "email", "phone", "address", "password"];

function todayLocal() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function validate(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Please enter your full name.";
  }

  if (values.birthDate && values.birthDate > todayLocal()) {
    errors.birthDate = "Date of birth cannot be in the future.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address, for example name@email.com.";
  }

  const digits = values.phone.replace(/\D/g, "");
  if (values.phone.trim() && (digits.length < 7 || /[^\d\s+()-]/.test(values.phone))) {
    errors.phone = "Enter a valid phone number, for example 0917 123 4567.";
  }

  if (!values.password) {
    errors.password = "Please enter a password.";
  } else if (values.password.length < 8) {
    errors.password = "Your password must have at least 8 characters.";
  }

  return errors;
}

const SAVED_MESSAGE_MS = 4000;

function Profile() {
  const [saved, setSaved] = useState(loadProfile);
  const [values, setValues] = useState(loadProfile);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const fieldRefs = useRef({});
  const hideTimerRef = useRef(0);

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  const errors = validate(values);
  const changed = FIELD_ORDER.some((field) => values[field] !== saved[field]);

  const errorFor = (field) =>
    (touched[field] || submitted) ? errors[field] : "";

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setShowSaved(false);
  };

  const markTouched = (field) => () =>
    setTouched((current) => ({ ...current, [field]: true }));

  const closeSaved = () => {
    clearTimeout(hideTimerRef.current);
    setShowSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!changed) return;

    setSubmitted(true);

    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      const input = fieldRefs.current[firstInvalid];
      input?.focus();
      input?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const next = {
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
    };

    saveProfile(next);
    setSaved(next);
    setValues(next);
    setTouched({});
    setSubmitted(false);

    setShowSaved(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowSaved(false), SAVED_MESSAGE_MS);
  };

  // props shared by every editable input
  const inputProps = (field) => ({
    ref: (element) => {
      fieldRefs.current[field] = element;
    },
    value: values[field],
    onChange: setField(field),
    onBlur: markTouched(field),
    "aria-invalid": Boolean(errorFor(field)),
    "aria-describedby": errorFor(field) ? `profile-${field}-error` : undefined,
  });

  const fieldError = (field) =>
    errorFor(field) && (
      <span className="profile__error" id={`profile-${field}-error`}>
        {errorFor(field)}
      </span>
    );

  return (
    <div className="profile">
      <BackButton fallback="/" />


      <section className="profile__header">

        <p className="profile__eyebrow">
          My Account
        </p>

        <h1>
          Welcome Back!
        </h1>

        <p>
          Manage your profile and keep your
          account information updated.
        </p>

      </section>


      <section className="profile__layout">

        <aside className="profile__sidebar">

          <div className="profile__avatar">
            U
          </div>

          <h2>{saved.fullName}</h2>

          <p>{saved.email}</p>


          <nav>

            <button type="button">
              Account Information
            </button>

          </nav>

        </aside>


        <form className="profile__content" onSubmit={handleSubmit} noValidate>

          <section className="profile__card">

            <div>
              <h2>
                Personal Information
              </h2>
            </div>


            <div className="profile__grid">

              <label>
                Full Name
                <input
                  type="text"
                  autoComplete="name"
                  {...inputProps("fullName")}
                />
                {fieldError("fullName")}
              </label>

              <label>
                Date of Birth
                <input
                  type="date"
                  {...inputProps("birthDate")}
                />
                {fieldError("birthDate")}
              </label>

            </div>

          </section>


          <section className="profile__card">

            <div>
              <h2>
                Contact Details
              </h2>
            </div>


            <div className="profile__grid">

              <label>
                Email Address
                <input
                  type="email"
                  autoComplete="email"
                  {...inputProps("email")}
                />
                {fieldError("email")}
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  autoComplete="tel"
                  {...inputProps("phone")}
                />
                {fieldError("phone")}
              </label>

              <label>
                Address
                <input
                  type="text"
                  autoComplete="street-address"
                  {...inputProps("address")}
                />
                {fieldError("address")}
              </label>

            </div>

          </section>


          <section className="profile__card">

            <div>
              <h2>
                Password & Security
              </h2>
            </div>

            <label className="profile__password">
              <span className="profile__sr-only">Password</span>
              <input
                type="password"
                autoComplete="new-password"
                {...inputProps("password")}
              />
              {fieldError("password")}
            </label>

          </section>


          <div className="profile__actions">

            <div role="status" aria-live="polite" className="profile__status">
              {showSaved && (
                <p className="profile__saved">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>Your changes have been saved.</span>
                  <button
                    type="button"
                    className="profile__saved-close"
                    onClick={closeSaved}
                    aria-label="Close message"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="profile__save"
              disabled={!changed}
            >
              Save Changes
            </button>

          </div>

        </form>

      </section>

    </div>
  );
}

export default Profile;
