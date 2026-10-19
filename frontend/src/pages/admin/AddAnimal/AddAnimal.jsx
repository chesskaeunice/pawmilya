import { Link } from "react-router-dom";

import "./AddAnimal.css";

function AddAnimal() {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Animals / Add Animal
          </p>

          <h1 className="staff-page__title">
            Add Animal
          </h1>

          <p className="staff-page__subtitle">
            Create a new animal record in Pawmilya.
          </p>
        </div>
      </div>

      <form
        className="staff-detail-card staff-form"
        onSubmit={handleSubmit}
      >
        <div className="staff-form__grid">
          <Field label="Animal Name">
            <input required />
          </Field>

          <Field label="Animal Type">
            <select required>
              <option value="">
                Select type
              </option>

              <option>Dog</option>
              <option>Cat</option>
            </select>
          </Field>

          <Field label="Breed">
            <input />
          </Field>

          <Field label="Sex">
            <select required>
              <option value="">
                Select sex
              </option>

              <option>Male</option>
              <option>Female</option>
            </select>
          </Field>

          <Field label="Estimated Age">
            <input
              type="number"
              min="0"
            />
          </Field>

          <Field label="Status">
            <select>
              <option>
                Available
              </option>

              <option>
                Under Observation
              </option>

              <option>
                Pending Adoption
              </option>

              <option>
                Adopted
              </option>
            </select>
          </Field>

          <Field label="Date Rescued">
            <input type="date" />
          </Field>

          <Field label="Location">
            <input />
          </Field>

          <div className="staff-form__field staff-form__field--full">
            <label>
              Description
            </label>

            <textarea rows="5" />
          </div>
        </div>

        <div className="staff-form__actions">
          <Link
            to="/admin/animals"
            className="staff-button staff-button--outline"
          >
            Cancel
          </Link>

          <button className="staff-button">
            Save Animal
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}) {
  return (
    <div className="staff-form__field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export default AddAnimal;