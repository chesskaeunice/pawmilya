import {
  Link,
  useParams,
} from "react-router-dom";

import pets from "../../../data/pets.js";

import "../AddAnimal/AddAnimal.css";
import "./EditAnimal.css";

function EditAnimal() {
  const { animalId } =
    useParams();

  const pet =
    pets.find(
      (item) =>
        item.id === Number(animalId)
    );

  if (!pet) {
    return (
      <div className="staff-page">
        <h1>
          Animal not found.
        </h1>
      </div>
    );
  }

  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Animals / {pet.name} /
            Edit
          </p>

          <h1 className="staff-page__title">
            Edit {pet.name}
          </h1>
        </div>
      </div>

      <form className="staff-detail-card staff-form">
        <div className="staff-form__grid">
          <Field label="Animal Name">
            <input
              defaultValue={pet.name}
            />
          </Field>

          <Field label="Animal Type">
            <select
              defaultValue={pet.type}
            >
              <option>Dog</option>
              <option>Cat</option>
            </select>
          </Field>

          <Field label="Breed">
            <input
              defaultValue={
                pet.breed
              }
            />
          </Field>

          <Field label="Sex">
            <select
              defaultValue={pet.sex}
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          </Field>

          <Field label="Status">
            <select
              defaultValue={
                pet.status
              }
            >
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

          <Field label="Location">
            <input
              defaultValue={
                pet.location
              }
            />
          </Field>

          <div className="staff-form__field staff-form__field--full">
            <label>
              Description
            </label>

            <textarea
              rows="5"
              defaultValue={
                pet.description
              }
            />
          </div>
        </div>

        <div className="staff-form__actions">
          <Link
            to={`/admin/animals/${pet.id}`}
            className="staff-button staff-button--outline"
          >
            Cancel
          </Link>

          <button className="staff-button">
            Save Changes
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

export default EditAnimal;