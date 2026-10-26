import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import useAuth from "../../../hooks/useAuth.js";
import { formatApiError } from "../../../services/authService.js";

import "./Profile.css";
import BackButton from "../../../components/common/BackButton.jsx";
import FieldError from "../../../components/common/FieldError.jsx";
import SuggestInput from "../../../components/common/SuggestInput.jsx";
import { loadPhLocations } from "../../../config/phLocations.js";

/* ---------- mock profile store (no API yet) ----------
   Kept in memory for this session, and in sessionStorage so the saved
   values also survive a page reload. */

const STORAGE_KEY = "pawmilya-mock-profile";

const DEFAULT_PROFILE = {
  fullName: "Username",
  birthDate: "",
  email: "user@email.com",
  phone: "",
  address: "",
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
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* storage can be blocked; the in-memory copy still works */
  }
}

/* ---------- validation ---------- */

const ADDRESS_FIELDS = ["province", "city", "barangay", "street"];
const FIELD_ORDER = ["fullName", "birthDate", "email", "phone", ...ADDRESS_FIELDS];

function todayLocal() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// `check` = { places, province, city, barangay, changed }: the address list and the typed values that
// matched a suggestion ("" when they did not)
function validate(values, check) {
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

  // province, city and barangay must be picked from the suggestions (checked when the address changed,
  // so an old single-line address in the street field does not block saving the other fields)
  const hasAddress = ADDRESS_FIELDS.some((field) => values[field].trim());

  if (check.changed && hasAddress) {
    if (!check.places) {
      errors.province = "The address list is still loading. Please try again in a moment.";
    } else {
      if (!check.province) errors.province = "Please choose your province from the list.";
      else if (!check.city) errors.city = "Please choose your city or municipality from the list.";
      else if (!check.barangay) errors.barangay = "Please choose your barangay from the list.";
    }
  }

  return errors;
}

const SAVED_MESSAGE_MS = 4000;

// "Maria Santos" -> "MS" (shown when there is no profile photo)
function initialsOf(name) {
  const letters = (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase());

  return letters.join("") || "U";
}

function Profile() {
  const { user, updateEmail, updateAddress, uploadAvatar, removeAvatar } = useAuth();

  // profile photo: the file picker is hidden behind the "Change photo" button
  const photoInputRef = useRef(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // the email and the address are the real ones from the account; the other fields are still the mock store
  const startProfile = () => {
    const mock = loadProfile();
    const address = user.address ?? {};
    const hasAddress = ADDRESS_FIELDS.some((field) => address[field]);

    return {
      ...mock,
      email: user.email,
      province: address.province ?? "",
      city: address.city ?? "",
      barangay: address.barangay ?? "",
      // an address written before the parts existed (one line) is shown in the street field
      street: hasAddress ? (address.street ?? "") : (mock.address ?? ""),
    };
  };

  const [saved, setSaved] = useState(startProfile);
  const [values, setValues] = useState(startProfile);
  // errors sent by the API ("This email is already registered.")
  const [emailError, setEmailError] = useState("");
  const [addressErrors, setAddressErrors] = useState({});

  // the Philippine address list (static data, loaded on this page only)
  const [places, setPlaces] = useState(null);

  useEffect(() => {
    let active = true;

    loadPhLocations()
      .then((loaded) => active && setPlaces(loaded))
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const fieldRefs = useRef({});
  const hideTimerRef = useRef(0);

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  // suggestions for province -> city -> barangay, each limited by the one before
  const provinceList = places?.provinces ?? [];
  const province = places ? places.pick(provinceList, values.province) : "";
  const cityList = useMemo(() => (province ? places.cities(province) : []), [places, province]);
  const city = places ? places.pick(cityList, values.city) : "";
  const barangayList = useMemo(() => (city ? places.barangays(province, city) : []), [places, province, city]);
  const barangay = places ? places.pick(barangayList, values.barangay) : "";

  const addressChanged = ADDRESS_FIELDS.some((field) => values[field] !== saved[field]);
  const errors = validate(values, { places, province, city, barangay, changed: addressChanged });
  const changed = FIELD_ORDER.some((field) => values[field] !== saved[field]);

  const errorFor = (field) =>
    (field === "email" && emailError) ||
    addressErrors[field] ||
    ((touched[field] || submitted) ? errors[field] : "");

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (field === "email") setEmailError("");
    setShowSaved(false);
  };

  // province / city: choosing another value clears the fields that depend on it
  const setPlace = (field) => (event) => {
    const typed = event.target.value;

    setValues((current) => {
      const next = { ...current, [field]: typed };

      if (places && field === "province") {
        const before = places.pick(places.provinces, current.province);
        if (places.pick(places.provinces, typed) !== before) {
          next.city = "";
          next.barangay = "";
        }
      }

      if (places && field === "city") {
        const list = places.cities(province);
        if (places.pick(list, typed) !== places.pick(list, current.city)) next.barangay = "";
      }

      return next;
    });

    setAddressErrors({});
    setShowSaved(false);
  };

  const markTouched = (field) => () =>
    setTouched((current) => ({ ...current, [field]: true }));

  const closeSaved = () => {
    clearTimeout(hideTimerRef.current);
    setShowSaved(false);
  };

  // upload right after choosing the file; the API checks type (jpg, png, webp) and size (2 MB)
  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPhotoBusy(true);
    setPhotoError("");

    try {
      await uploadAvatar(file);
    } catch (error) {
      const { message, fields } = formatApiError(error);
      setPhotoError(fields.avatar || message);
    }

    setPhotoBusy(false);
  };

  const handleRemovePhoto = async () => {
    setPhotoBusy(true);
    setPhotoError("");

    try {
      await removeAvatar();
    } catch (error) {
      setPhotoError(formatApiError(error).message);
    }

    setPhotoBusy(false);
  };

  const handleSubmit = async (event) => {
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

    // a changed email is saved in the account first (trimmed and lowercase by the API)
    let email = saved.email;
    const wantedEmail = values.email.trim().toLowerCase();

    if (wantedEmail !== saved.email) {
      try {
        email = (await updateEmail(wantedEmail)).email;
      } catch (error) {
        const { message, fields } = formatApiError(error);
        setEmailError(fields.email || message);
        fieldRefs.current.email?.focus();
        return;
      }
    }

    // a changed address is saved in the account too (the three list fields as written in the list)
    const address = {
      province: addressChanged && values.province.trim() ? province : values.province,
      city: addressChanged && values.city.trim() ? city : values.city,
      barangay: addressChanged && values.barangay.trim() ? barangay : values.barangay,
      street: values.street.trim(),
    };

    if (ADDRESS_FIELDS.some((field) => address[field] !== saved[field])) {
      try {
        await updateAddress(address);
      } catch (error) {
        const { message, fields } = formatApiError(error);
        setAddressErrors(Object.keys(fields).length ? fields : { street: message });
        return;
      }
    }

    const next = {
      ...values,
      ...address,
      fullName: values.fullName.trim(),
      email,
      phone: values.phone.trim(),
      address: "",
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
    id: `profile-${field}`,
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

      <section className="profile__header">

        <BackButton fallback="/" />

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

        <form className="profile__content" onSubmit={handleSubmit} noValidate>

          <div className="profile__photo">

            <div className="profile__avatar" aria-hidden="true">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" />
              ) : (
                initialsOf(user.name)
              )}
            </div>

            <h2 className="profile__name">{user.name}</h2>

            <p className="profile__email">{user.email}</p>

            <div className="profile__photo-buttons">
              <button
                type="button"
                className="profile__photo-change"
                onClick={() => photoInputRef.current?.click()}
                disabled={photoBusy}
              >
                {photoBusy ? "Saving..." : "Change photo"}
              </button>

              <button
                type="button"
                className="profile__photo-remove"
                onClick={handleRemovePhoto}
                disabled={photoBusy || !user.avatar_url}
              >
                Remove
              </button>
            </div>

            <FieldError id="profile-photo-error" message={photoError} />

            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handlePhoto}
              aria-describedby="profile-photo-error"
              aria-label="Profile photo"
            />

          </div>


          <section className="profile__section">

            <h2 className="profile__section-title">About you</h2>

            <div className="profile__row">
              <label className="profile__label" htmlFor="profile-fullName">Full Name</label>
              <div className="profile__control">
                <input
                  type="text"
                  autoComplete="name"
                  {...inputProps("fullName")}
                />
                {fieldError("fullName")}
              </div>
            </div>

            <div className="profile__row">
              <label className="profile__label" htmlFor="profile-birthDate">Date of Birth</label>
              <div className="profile__control">
                <input
                  type="date"
                  {...inputProps("birthDate")}
                />
                {fieldError("birthDate")}
              </div>
            </div>

          </section>


          <section className="profile__section">

            <h2 className="profile__section-title">Contact</h2>

            <div className="profile__row">
              <label className="profile__label" htmlFor="profile-email">Email Address</label>
              <div className="profile__control">
                <input
                  type="email"
                  autoComplete="email"
                  {...inputProps("email")}
                />
                <FieldError id="profile-email-error" message={errorFor("email")} />
                <p className="profile__help">Used to log in and to send you updates.</p>
              </div>
            </div>

            <div className="profile__row">
              <label className="profile__label" htmlFor="profile-phone">Phone Number</label>
              <div className="profile__control">
                <input
                  type="tel"
                  autoComplete="tel"
                  {...inputProps("phone")}
                />
                {fieldError("phone")}
                <p className="profile__help">
                  Used when staff need to contact you about your applications or reports.
                </p>
              </div>
            </div>

          </section>


          <section className="profile__section">

            <h2 className="profile__section-title">Address</h2>

            <div className="profile__row">
              <label className="profile__label" htmlFor="profile-province">Province</label>
              <div className="profile__control">
                <SuggestInput
                  listId="profile-province-list"
                  options={provinceList}
                  maxLength={120}
                  placeholder="Start typing your province"
                  {...inputProps("province")}
                  onChange={setPlace("province")}
                />
                <FieldError id="profile-province-error" message={errorFor("province")} />
              </div>
            </div>

            <div className="profile__row">
              <label className="profile__label" htmlFor="profile-city">City / Municipality</label>
              <div className="profile__control">
                <SuggestInput
                  listId="profile-city-list"
                  options={cityList}
                  maxLength={120}
                  disabled={!province}
                  placeholder={province ? "Start typing your city or municipality" : "Choose a province first"}
                  {...inputProps("city")}
                  onChange={setPlace("city")}
                />
                <FieldError id="profile-city-error" message={errorFor("city")} />
              </div>
            </div>

            <div className="profile__row">
              <label className="profile__label" htmlFor="profile-barangay">Barangay</label>
              <div className="profile__control">
                <SuggestInput
                  listId="profile-barangay-list"
                  options={barangayList}
                  maxLength={120}
                  disabled={!city}
                  placeholder={city ? "Start typing your barangay" : "Choose a city first"}
                  {...inputProps("barangay")}
                  onChange={setPlace("barangay")}
                />
                <FieldError id="profile-barangay-error" message={errorFor("barangay")} />
              </div>
            </div>

            <div className="profile__row">
              <label className="profile__label" htmlFor="profile-street">House no. / Street</label>
              <div className="profile__control">
                <input
                  type="text"
                  autoComplete="street-address"
                  maxLength={255}
                  placeholder="Example: 12 Hidalgo Street"
                  {...inputProps("street")}
                />
                <FieldError id="profile-street-error" message={errorFor("street")} />
              </div>
            </div>

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
