import { Link, useParams } from "react-router-dom";

import useFetch from "../../../hooks/useFetch.js";
import { getStray } from "../../../services/animalService.js";
import { petPlaceholders } from "../../../assets/images/placeholders/index.js";
import { displayPetName } from "../../../utils/petName.js";

import "./StrayInfo.css";
import BackButton from "../../../components/common/BackButton.jsx";

// Public page opened by scanning an animal's QR code (no login needed):
// pet information and the owner's information when it is known.
function StrayInfo() {
  const { token } = useParams();

  const { data: pet, loading } = useFetch(() => getStray(token), [token]);

  if (loading) {
    return (
      <div className="stray">
        <div className="stray__card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="stray">
        <div className="stray__card">
          <h1>QR code not recognized</h1>
          <p>This code does not match any animal at Pawmilya.</p>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    );
  }

  const name = displayPetName(pet.name);
  const image = pet.image || petPlaceholders[pet.type] || petPlaceholders.Other;

  return (
    <div className="stray">

      <div className="stray__card">
      <BackButton fallback="/" />


        <img
          className="stray__photo"
          src={image}
          alt={`Photo of ${name}`}
        />

        <p className="stray__eyebrow">Animal information</p>

        <h1>{name}</h1>

        <p className="stray__summary">
          {[pet.type, pet.breed, pet.sex, pet.ageLabel].filter(Boolean).join(" · ")}
        </p>

        <dl className="stray__data">
          {pet.color && (
            <div>
              <dt>Color</dt>
              <dd>{pet.color}</dd>
            </div>
          )}

          <div>
            <dt>Status</dt>
            <dd>{pet.status}</dd>
          </div>

          <div>
            <dt>Currently at</dt>
            <dd>{pet.location || "Pawmilya Animal Pound"}</dd>
          </div>
        </dl>

        {pet.description && <p>{pet.description}</p>}

        <section className="stray__owner">
          <h2>Owner information</h2>

          {pet.owner ? (
            <>
              {pet.owner.name && <p><strong>{pet.owner.name}</strong></p>}
              {pet.owner.contact && <p>{pet.owner.contact}</p>}
            </>
          ) : (
            <p>
              The owner is not known. If this is your pet, please contact the
              Pawmilya animal pound.
            </p>
          )}
        </section>

      </div>

    </div>
  );
}

export default StrayInfo;
