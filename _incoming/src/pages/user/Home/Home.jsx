import { Link } from "react-router-dom";
import homeHero from "../../../assets/images/users/home/home-hero.jpg";
import "./Home.css";

function Home() {
  const featuredPets = [
    {
      id: 1,
      name: "Milo",
      type: "Dog",
      breed: "Mixed Breed",
      age: "3 years old",
      personality: "Friendly",
    },
    {
      id: 2,
      name: "Luna",
      type: "Cat",
      breed: "Domestic Shorthair",
      age: "1 year old",
      personality: "Calm",
    },
    {
      id: 3,
      name: "Buddy",
      type: "Dog",
      breed: "Aspin Mix",
      age: "2 years old",
      personality: "Playful",
    },
  ];

  return (
    <div className="home">

      <section className="home__hero">
        <div className="home__hero-container">

          <div className="home__hero-content">
            <p className="home__eyebrow">
              Rescue · Reunite · Rehome
            </p>

            <h1 className="home__title">
              Helping pets find safer, loving homes.
            </h1>

            <p className="home__description">
              PAWmilya provides a simple way to discover animals available
              for adoption, submit adoption applications, and stay connected
              with the local animal pound.
            </p>

            <div className="home__hero-actions">
              <Link
                to="/adoptable-pets"
                className="home__primary-button"
              >
                Browse Adoptable Pets
              </Link>

              <Link
                to="/signup"
                className="home__secondary-button"
              >
                Create an Account
              </Link>
            </div>
          </div>

          <div className="home__hero-placeholder">
            <img
              src={homeHero}
              alt="Dogs under the care of PAWmilya"
            />
          </div>

        </div>
      </section>


      <section className="home__featured">
        <div className="home__section-header">

          <div>
            <p className="home__eyebrow">
              Featured Pets
            </p>

            <h2>
              Meet some pets looking for a home
            </h2>
          </div>

          <Link
            to="/adoptable-pets"
            className="home__view-all"
          >
            View All Pets →
          </Link>

        </div>


        <div className="home__pet-grid">

          {featuredPets.map((pet) => (
            <article
              className="home__pet-card"
              key={pet.id}
            >

              <div className="home__pet-placeholder">
                <span>Pet Image</span>
              </div>

              <div className="home__pet-content">
                <h3>{pet.name}</h3>

                <p className="home__pet-details">
                  {pet.type} · {pet.age} · {pet.breed}
                </p>

                <span className="home__pet-tag">
                  {pet.personality}
                </span>
              </div>

            </article>
          ))}

        </div>
      </section>


      <section className="home__process">

        <p className="home__eyebrow">
          How PAWmilya Works
        </p>

        <h2>
          A simpler adoption process
        </h2>

        <div className="home__process-grid">

          <article className="home__process-item">
            <span className="home__process-number">01</span>
            <h3>Explore</h3>
            <p>
              Browse animals currently available for adoption.
            </p>
          </article>

          <article className="home__process-item">
            <span className="home__process-number">02</span>
            <h3>Apply</h3>
            <p>
              Complete an adoption application for the pet we would like to adopt.
            </p>
          </article>

          <article className="home__process-item">
            <span className="home__process-number">03</span>
            <h3>Track</h3>
            <p>
              View the status of submitted applications through My Applications.
            </p>
          </article>

        </div>

      </section>

    </div>
  );
}

export default Home;