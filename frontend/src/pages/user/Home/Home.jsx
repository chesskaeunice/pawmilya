import { Link } from "react-router-dom";

import homeHero from "../../../assets/images/users/home/home-hero.jpg";
import { aboutPlaceholders } from "../../../assets/images/placeholders/index.js";

import ScrollStrip from "../../../components/landing/ScrollStrip.jsx";
import PetPreviewCard from "../../../components/landing/PetPreviewCard.jsx";
import ArticleCard from "../../../components/landing/ArticleCard.jsx";

import useAuth from "../../../hooks/useAuth.js";
import useScrollReveal from "../../../hooks/useScrollReveal.js";
import { useGoToSection } from "../../../hooks/useSectionScroll.js";
import {
  getLatestAdoptablePets,
  getLatestArticles,
  getLatestMissingReports,
} from "../../../services/previewService.js";

import "./Home.css";
import "./HomeSections.css";

const adoptablePets = getLatestAdoptablePets(6);
const missingReports = getLatestMissingReports(6);
const articles = getLatestArticles(6);

const aboutGoals = [
  "Make it easy for families to find and adopt pets in need of a home.",
  "Help lost pets and their owners find each other quickly.",
  "Share clear, trustworthy guides on responsible pet care.",
  "Support the local animal pound with simple, organized records.",
];

function Home() {
  const { isLoggedIn } = useAuth();
  const goToSection = useGoToSection();

  useScrollReveal();

  return (
    <div className="home">

      <section className="home__hero" id="home">
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
                to="/#adoptable-pets"
                className="home__primary-button"
                onClick={(event) => {
                  event.preventDefault();
                  goToSection({
                    id: "adoptable-pets",
                    path: "/adoptable-pets",
                  });
                }}
              >
                Browse Adoptable Pets
              </Link>

              {/* Guests: Create an Account. Logged-in users: View My Applications. */}
              {isLoggedIn ? (
                <Link
                  to="/my-applications"
                  className="home__secondary-button"
                >
                  View My Applications
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="home__secondary-button"
                >
                  Create an Account
                </Link>
              )}
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


      <section className="home__process reveal">

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


      <section className="landing-section reveal" id="adoptable-pets">
        <header className="landing-section__header">
          <p className="landing-section__eyebrow">Find a Companion</p>
          <h2>Adoptable Pets</h2>
          <p className="landing-section__intro">
            The newest animals waiting for a loving home.
          </p>
        </header>

        <ScrollStrip label="adoptable pets" autoScroll>
          {adoptablePets.map((pet) => (
            <PetPreviewCard key={pet.id} kind="adoptable" item={pet} />
          ))}
        </ScrollStrip>

        <div className="landing-section__action">
          <Link to="/adoptable-pets" className="landing-section__button">
            Meet More Pets
          </Link>
        </div>
      </section>


      <section className="landing-section reveal" id="missing-pets">
        <header className="landing-section__header">
          <p className="landing-section__eyebrow">Lost &amp; Found</p>
          <h2>Missing Pets</h2>
          <p className="landing-section__intro">
            Recent reports from the community. Help a pet get back home.
          </p>
        </header>

        <ScrollStrip label="missing pet reports" autoScroll>
          {missingReports.map((report) => (
            <PetPreviewCard key={report.id} kind="missing" item={report} />
          ))}
        </ScrollStrip>

        <div className="landing-section__action">
          <Link to="/missing-pets" className="landing-section__button">
            See All Reports
          </Link>
        </div>
      </section>


      <section className="landing-section reveal" id="articles">
        <header className="landing-section__header">
          <p className="landing-section__eyebrow">Learn</p>
          <h2>Pet Care Corner</h2>
          <p className="landing-section__intro">
            Guides for pet owners, adopters and anyone who cares for animals.
          </p>
        </header>

        <ScrollStrip label="articles" showDots>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </ScrollStrip>

        <div className="landing-section__action">
          <Link to="/articles" className="landing-section__button">
            Read More Guides
          </Link>
        </div>
      </section>


      <section className="landing-section about reveal" id="about">

        <div className="about__images">
          <img
            src={aboutPlaceholders[0]}
            alt="PAWmilya team caring for rescued pets"
            loading="lazy"
          />
          <img
            src={aboutPlaceholders[1]}
            alt="A family with their newly adopted pet"
            loading="lazy"
          />
        </div>

        <div className="about__text">
          <p className="landing-section__eyebrow">About Us</p>
          <h2>Every pet deserves a safe place to call home.</h2>

          <h3>Our Vision</h3>
          <p>
            A community where no pet is left without care, and every
            animal can find a loving family.
          </p>

          <h3>Our Mission</h3>
          <p>
            To connect adopters, pet owners and the animal pound through one
            simple platform for adoption, lost-and-found reports and pet
            education.
          </p>

          <h3>Our Goals</h3>
          <ul className="about__goals">
            {aboutGoals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </div>

      </section>

    </div>
  );
}

export default Home;
