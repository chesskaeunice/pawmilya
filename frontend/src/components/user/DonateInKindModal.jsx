import { Check, Home, Info, PawPrint } from "lucide-react";

import Modal from "../common/Modal.jsx";
import useSiteInfo from "../../hooks/useSiteInfo.js";

import "./DonateInKindModal.css";

const ICONS = { PawPrint, Home };

// "Donate In-Kind" pop-up opened from the footer (guests and logged-in users).
// Wishlists and drop-off details are edited by staff (Settings) and come from the API.
function DonateInKindModal({ isOpen, onClose }) {
  const site = useSiteInfo();
  const inKindWishlist = site?.inKind ?? [];
  const { address, hours, phone, email } = site?.pound ?? {};
  const contactLine = [phone, email].filter(Boolean).join(" · ");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Donate In-Kind"
      size="large"
    >
      <p className="inkind__intro">
        Besides cash, shelters always need supplies. Here is what Pawmilya&apos;s
        partner pound can use.
      </p>

      <div className="inkind__lists">
        {inKindWishlist.length === 0 && (
          <p className="inkind__intro">Our wishlist is being updated. Please check back soon.</p>
        )}

        {inKindWishlist.map((list, index) => {
          const Icon = ICONS[index % 2 === 0 ? "PawPrint" : "Home"];

          return (
            <section className="inkind__card" key={list.title} aria-labelledby={`inkind-${index}`}>
              <h3 className="inkind__card-title" id={`inkind-${index}`}>
                <span className="inkind__card-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                {list.title}
              </h3>

              <ul className="inkind__items">
                {list.items.map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="inkind__note">
        <Info size={18} aria-hidden="true" />
        <span>
          Please contact us before dropping off medicines or large items.
        </span>
      </p>

      {(address || hours || contactLine) && (
        <p className="inkind__how">
          <strong>How to donate:</strong>
          {address && ` Drop off your donations at ${address}.`}
          {hours && ` Hours: ${hours}.`}
          {contactLine && ` Contact: ${contactLine}.`}
        </p>
      )}
    </Modal>
  );
}

export default DonateInKindModal;
