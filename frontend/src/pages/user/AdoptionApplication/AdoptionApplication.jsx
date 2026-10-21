import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import useFetch from "../../../hooks/useFetch.js";
import { getPet } from "../../../services/animalService.js";
import { submitApplication } from "../../../services/adoptionService.js";
import { formatApiError } from "../../../services/authService.js";
import { isAdoptable } from "../../../services/previewService.js";
import ImageDropzone from "../../../components/report/ImageDropzone.jsx";

import "./AdoptionApplication.css";
// error text style used by ImageDropzone (.mform__error)
import "../../../components/common/ModalForm.css";
import BackButton from "../../../components/common/BackButton.jsx";

const STATUS_OPTIONS = ["Single", "Married", "Other"];
const PRONOUN_OPTIONS = ["She/her", "He/him", "They/them"];
const PROMPT_OPTIONS = ["Friends", "Website", "Social Media", "Others"];
const EMPLOYMENT_OPTIONS = ["Student", "Employed", "Self-employed", "Unemployed"];
const SELF_EMPLOYED_FIELDS = [
  "Retail / Sales",
  "Food & Beverage",
  "Freelance / Online",
  "Agriculture / Fishing",
  "Transport",
  "Services",
  "Other",
];

// Home photos: at least 2, at most 3 images
const MIN_HOME_PHOTOS = 2;
const MAX_HOME_PHOTOS = 3;

const HOME_PHOTO_CHECKLIST = [
  "Front of the house",
  "Street photo",
  "Living room",
  "Dining area",
  "Kitchen",
  "Bedrooms",
  "Windows",
  "Front & backyard",
];

function Required() {
  return (
    <span className="adoption-form__required" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

// Uncontrolled by default; pass value + onChange to control it
function RadioGroup({ name, options, legend, value, onChange }) {
  return (
    <fieldset className="adoption-form__field adoption-form__radio-group">
      <legend>
        {legend}
        <Required />
      </legend>

      <div className="adoption-form__radio-options">
        {options.map((option) => (
          <label key={option} className="adoption-form__radio">
            <input
              type="radio"
              name={name}
              value={option}
              required
              {...(onChange && {
                checked: value === option,
                onChange: () => onChange(option),
              })}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function AgreeCheckbox({ id, children }) {
  return (
    <label htmlFor={id} className="adoption-form__agree">
      <input id={id} type="checkbox" required />
      <span>
        {children}
        <Required />
      </span>
    </label>
  );
}

function AdoptionApplication() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [submitErrors, setSubmitErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [hasPets, setHasPets] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [work, setWork] = useState("");
  const [selfEmployedField, setSelfEmployedField] = useState("");
  const [selfEmployedFieldOther, setSelfEmployedFieldOther] = useState("");
  const [validId, setValidId] = useState(null);
  // home photos as ImageDropzone items: { id, file, url }
  const [photos, setPhotos] = useState([]);
  const [photosError, setPhotosError] = useState("");
  const photosRef = useRef(null);

  const { data: pet, loading: petLoading } = useFetch(() => getPet(petId), [petId]);

  if (petLoading) {
    return (
      <div className="adoption-form__not-found">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdoptable(pet)) {
    return (
      <div className="adoption-form__not-found">
        <h1>Pet not found.</h1>

        <Link to="/adoptable-pets">Back to Adoptable Pets</Link>
      </div>
    );
  }

  // switching status clears the extra fields
  const handleEmploymentChange = (next) => {
    setEmploymentStatus(next);
    setWork("");
    setSelfEmployedField("");
    setSelfEmployedFieldOther("");
  };

  const handlePhotos = (next) => {
    setPhotos(next);
    if (next.length >= MIN_HOME_PHOTOS) setPhotosError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // a second click while the first is still sending does nothing
    if (submitting) return;

    if (photos.length < MIN_HOME_PHOTOS) {
      setPhotosError(
        `Please add at least ${MIN_HOME_PHOTOS} home photos. You have added ${photos.length}.`
      );
      photosRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Fields are read by id / radio name; the files go as multipart
    const form = event.currentTarget.elements;
    const body = new FormData();
    const add = (key, value) => body.append(key, value ?? "");

    add("animal_id", pet.id);
    add("first_name", form.firstName.value);
    add("last_name", form.lastName.value);
    add("address", form.address.value);
    add("phone", form.contact.value);
    add("email", form.email.value);
    add("birth_date", form.birthDate.value);
    add("employment_status", employmentStatus);
    add("work", work);
    add("self_employed_field", selfEmployedField);
    add("self_employed_field_other", selfEmployedFieldOther);
    add("social_media", form.socialMedia.value);
    add("civil_status", form.civilStatus.value);
    add("pronouns", form.pronouns.value);
    add("referral_source", form.prompt.value);
    add("adopted_before", form.adoptedBefore.value === "Yes" ? 1 : 0);
    add("residence", form.residence.value);
    add("household_members", form.household.value);
    add("has_pets", hasPets === "Yes" ? 1 : 0);
    add("pet_count", hasPets === "Yes" ? form.petCount.value : "");
    add("pet_experience", form.experience.value);
    add("why_adopt", form.whyAdopt.value);
    add("how_care", form.howCare.value);
    add("terms_accepted", 1);
    body.append("valid_id", validId);
    photos.forEach((photo) => body.append("home_photos[]", photo.file));

    setSubmitErrors([]);
    setSubmitting(true);

    try {
      await submitApplication(body);
      navigate("/my-applications");
    } catch (err) {
      const { message, fields } = formatApiError(err);
      const messages = Object.values(fields);
      setSubmitErrors(messages.length ? messages : [message]);
      setSubmitting(false);
    }
  };

  return (
    <div className="adoption-form">
      <div className="adoption-form__container">
      <BackButton fallback="/adoptable-pets" />

        <section className="adoption-form__header">
          <p className="adoption-form__eyebrow">Adoption Application</p>

          <h1>Apply to adopt {pet.name}</h1>

          <p>
            Complete the form below so animal pound staff can review the
            adoption request. Fields marked with{" "}
            <span className="adoption-form__required">*</span> are required.
          </p>
        </section>

        <form className="adoption-form__layout" onSubmit={handleSubmit}>
          <div className="adoption-form__sections">
            {/* 01 — PERSONAL INFORMATION */}
            <section className="adoption-form__section">
              <div className="adoption-form__section-title">
                <span>01</span>
                <h2>Personal Information</h2>
              </div>

              <div className="adoption-form__grid">
                <div className="adoption-form__field">
                  <label htmlFor="firstName">
                    First Name
                    <Required />
                  </label>
                  <input id="firstName" type="text" required />
                </div>

                <div className="adoption-form__field">
                  <label htmlFor="lastName">
                    Last Name
                    <Required />
                  </label>
                  <input id="lastName" type="text" required />
                </div>

                <div className="adoption-form__field adoption-form__field--full">
                  <label htmlFor="address">
                    Address
                    <Required />
                  </label>
                  <input id="address" type="text" required />
                </div>

                <div className="adoption-form__field">
                  <label htmlFor="contact">
                    Phone Number
                    <Required />
                  </label>
                  <input id="contact" type="tel" required />
                </div>

                <div className="adoption-form__field">
                  <label htmlFor="email">
                    Email Address
                    <Required />
                  </label>
                  <input id="email" type="email" required />
                </div>

                <div className="adoption-form__field">
                  <label htmlFor="birthDate">
                    Birth Date
                    <Required />
                  </label>
                  <input id="birthDate" type="date" required />
                </div>

                <RadioGroup
                  legend="Employment Status"
                  name="employmentStatus"
                  options={EMPLOYMENT_OPTIONS}
                  value={employmentStatus}
                  onChange={handleEmploymentChange}
                />

                {(employmentStatus === "Employed" ||
                  employmentStatus === "Self-employed") && (
                  <div className="adoption-form__field">
                    <label htmlFor="work">
                      Work
                      <Required />
                    </label>
                    <input
                      id="work"
                      type="text"
                      value={work}
                      onChange={(event) => setWork(event.target.value)}
                      required
                    />
                  </div>
                )}

                {employmentStatus === "Self-employed" && (
                  <div className="adoption-form__field">
                    <label htmlFor="selfEmployedField">
                      Field
                      <Required />
                    </label>

                    <select
                      id="selfEmployedField"
                      value={selfEmployedField}
                      onChange={(event) => {
                        setSelfEmployedField(event.target.value);
                        setSelfEmployedFieldOther("");
                      }}
                      required
                    >
                      <option value="" disabled>
                        Select field
                      </option>
                      {SELF_EMPLOYED_FIELDS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {employmentStatus === "Self-employed" &&
                  selfEmployedField === "Other" && (
                    <div className="adoption-form__field">
                      <label htmlFor="selfEmployedFieldOther">
                        Specify Field
                        <Required />
                      </label>
                      <input
                        id="selfEmployedFieldOther"
                        type="text"
                        value={selfEmployedFieldOther}
                        onChange={(event) =>
                          setSelfEmployedFieldOther(event.target.value)
                        }
                        required
                      />
                    </div>
                  )}

                <div className="adoption-form__field">
                  <label htmlFor="socialMedia">
                    Social Media Link (Facebook, Instagram, etc.)
                    <Required />
                  </label>
                  <input
                    id="socialMedia"
                    type="url"
                    placeholder="https://"
                    required
                  />
                </div>

                <RadioGroup
                  legend="Status"
                  name="civilStatus"
                  options={STATUS_OPTIONS}
                />

                <RadioGroup
                  legend="Pronouns"
                  name="pronouns"
                  options={PRONOUN_OPTIONS}
                />

                <RadioGroup
                  legend="What prompted you to adopt from PAWmilya?"
                  name="prompt"
                  options={PROMPT_OPTIONS}
                />

                <RadioGroup
                  legend="Have you adopted from PAWmilya before?"
                  name="adoptedBefore"
                  options={["Yes", "No"]}
                />

                <div className="adoption-form__field adoption-form__field--full">
                  <label htmlFor="validId">
                    Upload Valid ID
                    <Required />
                  </label>

                  <input
                    id="validId"
                    type="file"
                    accept="image/*"
                    required
                    onChange={(event) =>
                      setValidId(event.target.files[0] || null)
                    }
                  />

                  {validId && (
                    <p className="adoption-form__file-name">{validId.name}</p>
                  )}
                </div>
              </div>
            </section>

            {/* 02 — HOME AND PET EXPERIENCE */}
            <section className="adoption-form__section">
              <div className="adoption-form__section-title">
                <span>02</span>
                <h2>Home and Pet Experience</h2>
              </div>

              <div className="adoption-form__grid">
                <div className="adoption-form__field">
                  <label htmlFor="residence">
                    Type of Residence
                    <Required />
                  </label>

                  <select id="residence" defaultValue="" required>
                    <option value="" disabled>
                      Select residence
                    </option>
                    <option>House</option>
                    <option>Apartment / Condominium</option>
                    <option>Dormitory</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="adoption-form__field">
                  <label htmlFor="household">
                    Number of People in Household
                    <Required />
                  </label>
                  <input id="household" type="number" min="1" required />
                </div>

                <div className="adoption-form__field">
                  <label htmlFor="hasPets">
                    Do you currently have pets?
                    <Required />
                  </label>

                  <select
                    id="hasPets"
                    value={hasPets}
                    onChange={(event) => setHasPets(event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select answer
                    </option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                {hasPets === "Yes" && (
                  <div className="adoption-form__field">
                    <label htmlFor="petCount">
                      How many pets do you have?
                      <Required />
                    </label>
                    <input id="petCount" type="number" min="1" required />
                  </div>
                )}

                <div className="adoption-form__field">
                  <label htmlFor="experience">
                    Pet Care Experience
                    <Required />
                  </label>

                  <select id="experience" defaultValue="" required>
                    <option value="" disabled>
                      Select experience
                    </option>
                    <option>No experience</option>
                    <option>Some experience</option>
                    <option>Experienced pet owner</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 03 — HOME PHOTOS */}
            <section className="adoption-form__section">
              <div className="adoption-form__section-title">
                <span>03</span>
                <h2>Home Photos</h2>
              </div>

              <p className="adoption-form__note">
                Please attach photos of your home in a <strong>COLLAGE</strong>{" "}
                way, otherwise your application may get rejected.
              </p>

              <ul className="adoption-form__checklist">
                {HOME_PHOTO_CHECKLIST.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="adoption-form__field" ref={photosRef}>
                <label id="homePhotosLabel">
                  Upload Image
                  <Required />
                </label>

                <p className="adoption-form__note">
                  Add {MIN_HOME_PHOTOS} to {MAX_HOME_PHOTOS} images (JPG, PNG or
                  WEBP, up to 5 MB each).
                </p>

                <ImageDropzone
                  items={photos}
                  onChange={handlePhotos}
                  maxFiles={MAX_HOME_PHOTOS}
                  error={photosError}
                />

                <p className="adoption-form__file-name" aria-live="polite">
                  {photos.length} of {MAX_HOME_PHOTOS} added
                </p>
              </div>

              <div className="adoption-form__note adoption-form__note--notice">
                <p>
                  <strong>Surprise visit during processing:</strong> A surprise
                  visit may be conducted within 1–2 weeks while your adoption
                  application is being processed.
                </p>
              </div>

              <div className="adoption-form__note adoption-form__note--notice">
                <p>
                  <strong>Surprise visit after adoption:</strong> Another
                  surprise visit will be conducted in a span of 3 months after you have
                  successfully adopted an animal to ensure their well-being.
                </p>
              </div>
            </section>

            {/* 04 — ADOPTION QUESTIONS */}
            <section className="adoption-form__section">
              <div className="adoption-form__section-title">
                <span>04</span>
                <h2>Adoption Questions</h2>
              </div>

              <div className="adoption-form__field">
                <label htmlFor="whyAdopt">
                  Why would you like to adopt {pet.name}?
                  <Required />
                </label>
                <textarea id="whyAdopt" rows="5" required />
              </div>

              <div className="adoption-form__field">
                <label htmlFor="howCare">
                  How will you care for the pet?
                  <Required />
                </label>
                <textarea id="howCare" rows="5" required />
              </div>
            </section>

            {/* 05 — TERMS AND CONDITIONS */}
            <section className="adoption-form__section">
              <div className="adoption-form__section-title">
                <span>05</span>
                <h2>Terms and Conditions</h2>
              </div>

              <div className="adoption-form__terms">
                <ul>
                  <li>
                    All information and photos I provided are true and
                    accurate.
                  </li>
                  <li>
                    Submitting this application does not guarantee approval of
                    the adoption.
                  </li>
                  <li>
                    PAWmilya staff may reject an application that is
                    incomplete or does not follow the photo requirements.
                  </li>
                  <li>
                    I will provide proper food, shelter, and veterinary care
                    for the pet I adopt.
                  </li>
                  <li>
                    I understand that surprise visits will be conducted as
                    stated in the What happens next? section.
                  </li>
                </ul>
              </div>

              <fieldset className="adoption-form__field adoption-form__radio-group">
                <legend className="adoption-form__visually-hidden">
                  Terms and conditions agreement
                </legend>

                <label className="adoption-form__radio">
                  <input type="radio" name="terms" value="agree" required />
                  <span>
                    I agree to the Terms and Conditions
                    <Required />
                  </span>
                </label>
              </fieldset>
            </section>
          </div>

          <aside className="adoption-form__pet-card">
            <p className="adoption-form__eyebrow">Selected Pet</p>

            <div className="adoption-form__pet-image">Pet Image</div>

            <h2>{pet.name}</h2>

            <p>
              {pet.type}
            </p>

            <p>{pet.breed}</p>

            <div className="adoption-form__pet-tags">
              {pet.personality.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>

            <div className="adoption-form__next">
              <h3>What happens next?</h3>

              <ol>
                <li>Submit the application.</li>
                <li>Animal pound staff reviews it.</li>
                <li>A surprise visit may happen within 1–2 weeks.</li>
                <li>Once the application has been approved, another surprise visit happens in a span of 3 months.</li>
              </ol>
            </div>

            {submitErrors.length > 0 && (
              <ul className="adoption-form__error" role="alert">
                {submitErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              className="adoption-form__submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>

            <Link
              to={`/adoptable-pets/${pet.id}`}
              className="adoption-form__cancel"
            >
              Cancel
            </Link>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default AdoptionApplication;