import { Siren } from "lucide-react";

import useModals from "../../hooks/useModals.js";
import useRole from "../../hooks/useRole.js";

import "./EmergencyButton.css";

// Fixed on every user page, for GUESTS ONLY. Logged-in users report through
// the menu (My Missing Pet Reports / Report Missing Pet page).
function EmergencyButton() {
  const { openEmergency } = useModals();
  const { isLoggedIn } = useRole();

  if (isLoggedIn) return null;

  return (
    <button
      type="button"
      className="emergency-button"
      onClick={openEmergency}
    >
      <Siren size={20} aria-hidden="true" />
      <span>Report a Missing Pet</span>
    </button>
  );
}

export default EmergencyButton;
