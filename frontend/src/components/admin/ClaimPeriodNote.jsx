import { formatClaimDate } from "../../utils/claimPeriod.js";

import "./ClaimPeriodNote.css";

// Shown on staff screens while a pet from a report can still be claimed by its owner
// (the API only sends claimDeadlineAt during the claim period)
function ClaimPeriodNote({ animal, compact = false }) {
  if (!animal?.claimDeadlineAt) return null;

  const date = formatClaimDate(animal.claimDeadlineAt);

  return (
    <p className={compact ? "claim-note claim-note--compact" : "claim-note"} role="note">
      This pet is still in its claim period until {date}. Health clearance opens after that.
    </p>
  );
}

export default ClaimPeriodNote;
