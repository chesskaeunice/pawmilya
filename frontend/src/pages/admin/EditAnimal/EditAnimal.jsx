import {
  Link,
  useParams,
} from "react-router-dom";

import { Lock } from "lucide-react";

import pets from "../../../data/pets.js";

import useAuth from "../../../hooks/useAuth.js";

import "./EditAnimal.css";


function EditAnimal() {
  const { animalId } = useParams();
  const { can } = useAuth();

  const pet = pets.find(
    (item) => item.id === Number(animalId)
  );

  if (!pet) {
    return (
      <div className="staff-page">
        <h1>Animal not found.</h1>
      </div>
    );
  }


  /* =========================================
     FIELD PERMISSIONS (see RBAC Part 2)
  ========================================= */

  // Name, type, breed, sex: Kennel Manager only
  const canEditBasic = can("animals.edit");

  // General status: Kennel Manager full, Counselor / Vet Tech limited
  const canEditStatus =
    can("animals.edit") ||
    can("animals.adoptionUpdate") ||
    can("animals.healthUpdate");

  // Kennel location: Kennel Manager and Pound Staff
  const canEditLocation =
    can("animals.edit") ||
    can("animals.husbandryUpdate");

  // Description / behavior notes: all except Vet Tech
  const canEditNotes =
    can("animals.edit") ||
    can("animals.adoptionUpdate") ||
    can("animals.husbandryUpdate");


  const handleSubmit = (event) => {
    event.preventDefault();

    // TODO: send changes to the Laravel API.
    // The backend must also reject fields this role cannot edit.
  };


  return (
    <div className="staff-page">

      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Animals / {pet.name} / Edit
          </p>

          <h1 className="staff-page__title">
            Edit {pet.name}
          </h1>
        </div>
      </div>


      <form
        className="staff-form"
        onSubmit={handleSubmit}
      >

        {/* BASIC INFORMATION */}

        <section className="staff-form__section">

          <div className="staff-form__section-header">
            <h2>Basic Information</h2>
            <p>Core details of the animal.</p>

            {!canEditBasic && (
              <span className="staff-form__lock">
                <Lock size={11} />
                View only
              </span>
            )}
          </div>


          <div className="staff-form__grid">

            <Field label="Animal Name" htmlFor="name">
              <input
                id="name"
                defaultValue={pet.name}
                disabled={!canEditBasic}
              />
            </Field>

            <Field label="Animal Type" htmlFor="type">
              <select
                id="type"
                defaultValue={pet.type}
                disabled={!canEditBasic}
              >
                <option>Dog</option>
                <option>Cat</option>
              </select>
            </Field>

            <Field label="Breed" htmlFor="breed">
              <input
                id="breed"
                defaultValue={pet.breed}
                disabled={!canEditBasic}
              />
            </Field>

            <Field label="Sex" htmlFor="sex">
              <select
                id="sex"
                defaultValue={pet.sex}
                disabled={!canEditBasic}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </Field>

          </div>

        </section>


        {/* SHELTER DETAILS */}

        <section className="staff-form__section">

          <div className="staff-form__section-header">
            <h2>Shelter Details</h2>
            <p>Current status and kennel location.</p>
          </div>


          <div className="staff-form__grid">

            <Field
              label="Status"
              htmlFor="status"
              locked={!canEditStatus}
            >
              <select
                id="status"
                defaultValue={pet.status}
                disabled={!canEditStatus}
              >
                <option>Available</option>
                <option>Under Observation</option>
                <option>Pending Adoption</option>
                <option>Adopted</option>
              </select>
            </Field>

            <Field
              label="Shelter / Kennel Location"
              htmlFor="location"
              locked={!canEditLocation}
            >
              <input
                id="location"
                defaultValue={pet.location}
                disabled={!canEditLocation}
              />
            </Field>

          </div>

        </section>


        {/* DESCRIPTION */}

        <section className="staff-form__section">

          <div className="staff-form__section-header">
            <h2>Description</h2>
            <p>
              Temperament, personality, and daily
              behavior notes.
            </p>
          </div>


          <Field
            label="Description"
            htmlFor="description"
            locked={!canEditNotes}
            full
          >
            <textarea
              id="description"
              rows="5"
              defaultValue={pet.description}
              disabled={!canEditNotes}
            />
          </Field>

        </section>


        {/* ACTIONS */}

        <div className="staff-form__actions">

          <Link
            to={`/admin/animals/${pet.id}`}
            className="staff-button staff-button--outline"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="staff-button"
          >
            Save Changes
          </button>

        </div>

      </form>

    </div>
  );
}


function Field({
  label,
  htmlFor,
  locked,
  full,
  children,
}) {
  return (
    <div
      className={`staff-form__field${full ? " staff-form__field--full" : ""}`}
    >
      <label htmlFor={htmlFor}>
        {label}

        {locked && (
          <span className="staff-form__lock">
            <Lock size={11} />
            View only
          </span>
        )}
      </label>

      {children}
    </div>
  );
}


export default EditAnimal;