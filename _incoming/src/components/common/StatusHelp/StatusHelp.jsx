import { useState } from "react";

import {
  CircleHelp,
  X,
} from "lucide-react";

import "./StatusHelp.css";


const statuses = [
  {
    name: "Lost",
    color: "#D90429",
    description:
      "The pet is currently missing and the owner is actively looking for it.",
  },

  {
    name: "Sighted",
    color: "#F4A261",
    description:
      "The pet has recently been seen in a reported location, but has not yet been safely found.",
  },

  {
    name: "Found",
    color: "#2A9D8F",
    description:
      "The pet has been found and is currently being kept safe while its owner is being located.",
  },

  {
    name: "Reunited",
    color: "#2EC4B6",
    description:
      "The pet has successfully been returned to its owner or family.",
  },

  {
    name: "Adopted",
    color: "#6C5CE7",
    description:
      "The animal has already been adopted and placed with a new family.",
  },

  {
    name: "Transfer",
    color: "#E9C46A",
    description:
      "The animal has been transferred to another shelter, pound, rescue organization, or facility.",
  },

  {
    name: "Adoptable",
    color: "#52B788",
    description:
      "The animal is currently available and eligible for adoption.",
  },
];


function StatusHelp() {
  const [isOpen, setIsOpen] =
    useState(false);


  return (
    <div className="status-help">

      {/* STATUS GUIDE POPUP */}

      {isOpen && (
        <div
          className="status-help__panel"
          role="dialog"
          aria-label="Pet status guide"
        >

          <div className="status-help__header">

            <div>

              <span className="status-help__eyebrow">
                Status Guide
              </span>

              <h2>
                What do the statuses mean?
              </h2>

            </div>


            <button
              type="button"
              className="status-help__close"
              onClick={() =>
                setIsOpen(false)
              }
              aria-label="Close status guide"
            >
              <X size={17} />
            </button>

          </div>


          <div className="status-help__list">

            {statuses.map((status) => (

              <div
                className="status-help__item"
                key={status.name}
              >

                <span
                  className="status-help__dot"
                  style={{
                    backgroundColor:
                      status.color,
                  }}
                />


                <div>

                  <strong>
                    {status.name}
                  </strong>

                  <p>
                    {status.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>
      )}


      {/* QUESTION MARK BUTTON */}

      <button
        type="button"
        className="status-help__button"
        onClick={() =>
          setIsOpen(
            (current) => !current
          )
        }
        aria-label="View pet status guide"
        aria-expanded={isOpen}
      >
        <CircleHelp
          size={28}
          strokeWidth={2}
        />
      </button>

    </div>
  );
}


export default StatusHelp;