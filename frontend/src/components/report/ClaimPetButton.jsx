import useAuth from "../../hooks/useAuth.js";
import { canClaim } from "../../utils/claimPeriod.js";

import "./ClaimPetButton.css";

// "Claim Pet" for a Rescued report inside its claim period, or a disabled "Claim submitted" when the
// citizen already has a Pending claim. Staff accounts cannot claim, so they do not see it.
// The click only asks the page to start the claim (the page opens the form or the sign-in pop-up).
function ClaimPetButton({ report, pendingReportIds, onClaim }) {
  const { isStaff } = useAuth();

  if (isStaff || !canClaim(report)) return null;

  if (pendingReportIds?.has(report.id)) {
    return (
      <button type="button" className="claim-button claim-button--done" disabled>
        Claim submitted
      </button>
    );
  }

  return (
    <button
      type="button"
      className="claim-button"
      onClick={(event) => {
        // the Missing Pets card is a link: this button must not open the details page
        event.preventDefault();
        event.stopPropagation();
        onClaim(report);
      }}
    >
      Claim Pet
    </button>
  );
}

export default ClaimPetButton;
