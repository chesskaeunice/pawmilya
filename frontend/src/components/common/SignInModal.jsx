import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

import Modal from "./Modal.jsx";

import "./SignInModal.css";

// "Please sign in to continue" pop-up for guests.
// `from` is where they were going; the Login page sends them back there.
function SignInModal({ isOpen, onClose, from, reason }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Please sign in to continue"
      size="small"
    >
      <div className="signin-modal">
        <span className="signin-modal__icon">
          <Lock size={26} aria-hidden="true" />
        </span>

        <p>
          {reason || "You need a PAWmilya account to continue."}{" "}
          Log in or create an account, and we will bring you back.
        </p>

        <div className="signin-modal__actions">
          <Link
            to="/login"
            state={{ from }}
            className="signin-modal__primary"
            onClick={onClose}
          >
            Log in
          </Link>

          <Link
            to="/signup"
            state={{ from }}
            className="signin-modal__secondary"
            onClick={onClose}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </Modal>
  );
}

export default SignInModal;
