import { useState } from "react";
import { Link } from "react-router-dom";

import pets from "../../../data/pets.js";
import adoptablePetsHero from "../../../assets/images/users/home/adoptablePets-hero.jpg";

import "./AdoptablePets.css";

function AdoptablePets() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [age, setAge] = useState("All");

  const filteredPets = pets.filter((pet) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      pet.name.toLowerCase().includes(searchValue) ||
      pet.breed.toLowerCase().includes(searchValue);

    const matchesType =
      type === "All" || pet.type === type;

    const matchesAge =
      age === "All" ||
      (age === "Young" && pet.age <= 1) ||
      (age === "Adult" && pet.age > 1 && pet.age < 7) ||
      (age === "Senior" && pet.age >= 7);

    return matchesSearch && matchesType && matchesAge;
  });

  return (
    <div className="adoptable">

      <section
        className="adoptable__header"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(77, 42, 0, 0.58),
              rgba(77, 42, 0, 0.58)
            ),
            url(${adoptablePetsHero})
          `,
        }}
      >
        <div className="adoptable__header-content">
          <p className="adoptable__eyebrow">
            Find a Companion
          </p>

          <h1>Adoptable Pets</h1>

          <p>
            Browse animals currently available for adoption
            and find a pet that may be the right match for your home.
          </p>
        </div>
      </section>


      <section className="adoptable__container">

        <div className="adoptable__filters">

          <input
            type="text"
            placeholder="Search by name or breed"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value)
            }
          >
            <option value="All">All Types</option>
            <option value="Dog">Dogs</option>
            <option value="Cat">Cats</option>
          </select>


          <select
            value={age}
            onChange={(event) =>
              setAge(event.target.value)
            }
          >
            <option value="All">Any Age</option>
            <option value="Young">Young</option>
            <option value="Adult">Adult</option>
            <option value="Senior">Senior</option>
          </select>

        </div>


        <p className="adoptable__result-count">
          {filteredPets.length} pets found
        </p>


        <div className="adoptable__grid">

          {filteredPets.map((pet) => (
            <article
              className="adoptable__card"
              key={pet.id}
            >

              <div className="adoptable__image-placeholder">
                Pet Image
              </div>

              <div className="adoptable__card-content">

                <div className="adoptable__card-heading">

                  <div>
                    <h2>{pet.name}</h2>

                    <p>
                      {pet.breed} · {pet.ageLabel}
                    </p>
                  </div>

                  <span className="adoptable__status">
                    {pet.status}
                  </span>

                </div>


                <div className="adoptable__tags">

                  {pet.personality.map((trait) => (
                    <span key={trait}>
                      {trait}
                    </span>
                  ))}

                </div>


                <Link
                  to={`/adoptable-pets/${pet.id}`}
                  className="adoptable__details-link"
                >
                  View Details →
                </Link>

              </div>

            </article>
          ))}

        </div>

      </section>

    </div>
  );
}

export default AdoptablePets;