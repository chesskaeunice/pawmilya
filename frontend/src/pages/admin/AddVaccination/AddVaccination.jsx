import { Link } from "react-router-dom";

import pets from "../../../data/pets.js";

import "./AddVaccination.css";

function AddVaccination() {
  const handleSubmit = (event) => {
    event.preventDefault();

    alert(
      "Vaccination record saved. Laravel integration will be added later."
    );
  };

  return (
    <div className="admin-page">

      <div className="admin-page__heading">

        <div>
          <p className="admin-page__eyebrow">
            Animal Health
          </p>

          <h1>
            Add Vaccination Record
          </h1>
        </div>

      </div>


      <form
        className="admin-form-card"
        onSubmit={handleSubmit}
      >

        <div className="admin-form-grid">

          <div className="admin-form-field">

            <label>
              Animal
            </label>

            <select required>

              <option value="">
                Select animal
              </option>

              {pets.map((pet) => (

                <option
                  key={pet.id}
                  value={pet.id}
                >
                  {pet.name}
                </option>

              ))}

            </select>

          </div>


          <div className="admin-form-field">

            <label>
              Vaccine
            </label>

            <input
              type="text"
              required
            />

          </div>


          <div className="admin-form-field">

            <label>
              Date Given
            </label>

            <input
              type="date"
              required
            />

          </div>


          <div className="admin-form-field">

            <label>
              Next Due Date
            </label>

            <input
              type="date"
            />

          </div>

        </div>


        <div className="admin-form-actions">

          <Link
            to="/admin/vaccinations"
            className="admin-button admin-button--secondary"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="admin-button"
          >
            Save Record
          </button>

        </div>

      </form>

    </div>
  );
}

export default AddVaccination;