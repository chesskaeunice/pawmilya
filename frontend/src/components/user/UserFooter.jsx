import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, HandHeart, Mail, MapPin, Phone } from "lucide-react";

import { checkHealth } from "../../services/api";
import { sectionLinks, siteInfo } from "../../data/siteInfo.js";
import { useGoToSection } from "../../hooks/useSectionScroll.js";
import DonateInKindModal from "./DonateInKindModal.jsx";
import donationQr from "../../assets/images/placeholders/donation-qr-placeholder.svg";

import "./UserFooter.css";

// Footer "Explore" = header links + the articles section
const exploreLinks = [
  ...sectionLinks,
  { id: "articles", label: "Pet Care Corner", path: "/" },
];

function UserFooter() {
  // "checking" | "online" | "offline"
  const [apiStatus, setApiStatus] = useState("checking");
  const [inKindOpen, setInKindOpen] = useState(false);
  const goToSection = useGoToSection();

  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  const { contact, donation, legalLinks, brandName } = siteInfo;

  // Columns, left to right: Donate, In-Kind, Explore, Legal, Contact Us
  return (
    <footer className="site-footer">

      <div className="site-footer__container">

        <section className="site-footer__column site-footer__column--donate">
          <h3 className="site-footer__heading">Donate</h3>

          <img
            src={donationQr}
            alt="Donation QR code (placeholder)"
            className="site-footer__qr"
            width="120"
            height="120"
          />

          <p className="site-footer__qr-caption">{donation.caption}</p>
        </section>


        <section className="site-footer__column site-footer__column--inkind">
          <h3 className="site-footer__heading">Donate In-Kind</h3>

          <p className="site-footer__text">
            Prefer to give supplies? See what our shelter needs.
          </p>

          <button
            type="button"
            className="site-footer__inkind"
            onClick={() => setInKindOpen(true)}
            aria-haspopup="dialog"
          >
            <HandHeart size={16} aria-hidden="true" />
            Donate In-Kind
          </button>
        </section>


        <nav className="site-footer__column" aria-label="Explore">
          <h3 className="site-footer__heading">Explore</h3>

          <ul className="site-footer__list">
            {exploreLinks.map((link) => (
              <li key={link.id}>
                <Link
                  to={`/#${link.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    goToSection(link);
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>


        <nav className="site-footer__column" aria-label="Legal">
          <h3 className="site-footer__heading">Legal</h3>

          <ul className="site-footer__list">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>


        <section className="site-footer__column site-footer__column--contact">
          <h3 className="site-footer__heading">Contact Us</h3>

          <ul className="site-footer__list site-footer__contact">
            <li>
              <MapPin size={16} aria-hidden="true" />
              <span>{contact.address}</span>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <span>{contact.phone}</span>
            </li>
            <li>
              <Mail size={16} aria-hidden="true" />
              <span>{contact.email}</span>
            </li>
            <li>
              <Clock size={16} aria-hidden="true" />
              <span>{contact.hours}</span>
            </li>
          </ul>
        </section>

      </div>


      <div className="site-footer__bottom">
        <p>© 2026 {brandName}. All rights reserved.</p>

        <span className={`api-status api-status--${apiStatus}`}>
          <span className="api-status__dot" />
          API {apiStatus === "checking" ? "checking…" : apiStatus}
        </span>
      </div>

      <DonateInKindModal
        isOpen={inKindOpen}
        onClose={() => setInKindOpen(false)}
      />

    </footer>
  );
}

export default UserFooter;
