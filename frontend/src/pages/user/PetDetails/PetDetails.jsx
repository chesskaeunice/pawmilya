import { Link, useParams } from "react-router-dom";

import useFetch from "../../../hooks/useFetch.js";
import { getPet } from "../../../services/animalService.js";

import BackButton from "../../../components/common/BackButton.jsx";
import PreviewStatus from "../../../components/landing/PreviewStatus.jsx";
import { getAdoptableStatus, isAdoptable } from "../../../services/previewService.js";
import useAuth from "../../../hooks/useAuth.js";
import useModals from "../../../hooks/useModals.js";

import "./PetDetails.css";
import PhotoGallery from "../../../components/common/PhotoGallery/PhotoGallery.jsx";

function PetDetails() {
  const { petId } = useParams();
  const { isLoggedIn } = useAuth();
  const { openSignIn } = useModals();

  const { data: pet, loading } = useFetch(() => getPet(petId), [petId]);

  if (loading) {
    return (
      <div className="pet-details__not-found">
        <p>Loading...</p>
      </div>
    );
  }

  // the API only returns animals open for adoption
  if (!isAdoptable(pet)) {
    return (
      <div className="pet-details__not-found">

        <h1>Pet not found.</h1>

        <Link to="/adoptable-pets">
          Back to Adoptable Pets
        </Link>

      </div>
    );
  }

  return (
    <div className="pet-details">

      <div className="pet-details__container">

        <BackButton fallback="/adoptable-pets" />

        <div className="pet-details__layout">

          <section className="pet-details__gallery">
            <PhotoGallery
              key={pet.id}
              photos={pet.images?.length ? pet.images : [pet.image].filter(Boolean)}
              alt={pet.name}
              type={pet.type}
            />
          </section>


          <section className="pet-details__info">

            <p className="pet-details__eyebrow">
              Available for Adoption
            </p>

            <h1>{pet.name}</h1>

            <PreviewStatus status={getAdoptableStatus(pet.status)} />

            <p className="pet-details__summary">
              {pet.type} · {pet.sex}
            </p>


            <p className="pet-details__description">
              {pet.description}
            </p>


            <div className="pet-details__data">

              <div>
                <span>Breed</span>
                <strong>{pet.breed}</strong>
              </div>

              <div>
                <span>Sex</span>
                <strong>{pet.sex}</strong>
              </div>

              <div>
                <span>Vaccination</span>

                <strong>
                  {pet.vaccinated
                    ? "Up to date"
                    : "Needs update"}
                </strong>
              </div>

              <div>
                <span>Spayed / Neutered</span>

                <strong>
                  {pet.neutered
                    ? "Yes"
                    : "No"}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>{pet.location}</strong>
              </div>

            </div>


            <div className="pet-details__personality">

              <h3>Personality</h3>

              <div>

                {pet.personality.map((trait) => (
                  <span key={trait}>
                    {trait}
                  </span>
                ))}

              </div>

            </div>

          </section>


          <aside className="pet-details__adoption">

            <p className="pet-details__eyebrow">
              Adoption
            </p>

            <h2>
              Interested in {pet.name}?
            </h2>

            <p>
              Submit an adoption application so the
              animal pound staff can review the request.
            </p>


            <Link
              to={`/adoptable-pets/${pet.id}/apply`}
              className="pet-details__apply"
              onClick={(event) => {
                // guests see the sign-in pop-up and stay on this page
                if (!isLoggedIn) {
                  event.preventDefault();
                  openSignIn(
                    `/adoptable-pets/${pet.id}/apply`,
                    "You need an account to apply for adoption."
                  );
                }
              }}
            >
              Apply for Adoption
            </Link>

          </aside>

        </div>

      </div>

    </div>
  );
}

export default PetDetails;