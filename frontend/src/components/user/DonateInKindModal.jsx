import { Check, Home, Info, PawPrint } from "lucide-react";

import Modal from "../common/Modal.jsx";
import inKindWishlist from "../../data/inKindWishlist.js";
import { siteInfo } from "../../data/siteInfo.js";

import "./DonateInKindModal.css";

const ICONS = { PawPrint, Home };

// "Donate In-Kind" pop-up opened from the footer (guests and logged-in users).
// Wishlists come from data/inKindWishlist.js; drop-off details from data/siteInfo.js.
function DonateInKindModal({ isOpen, onClose }) {
  const { address, hours, phone, email } = siteInfo.contact;

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
        {inKindWishlist.map((list) => {
          const Icon = ICONS[list.icon] || PawPrint;

          return (
            <section className="inkind__card" key={list.id} aria-labelledby={`inkind-${list.id}`}>
              <h3 className="inkind__card-title" id={`inkind-${list.id}`}>
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

      <p className="inkind__how">
        <strong>How to donate:</strong> Drop off your donations at {address}.
        Hours: {hours}. Contact: {phone} · {email}.
      </p>
    </Modal>
  );
}

export default DonateInKindModal;
