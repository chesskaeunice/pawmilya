import { useMemo } from "react";

import useAuth from "./useAuth.js";
import useFetch from "./useFetch.js";
import { listMyClaims } from "../services/claimService.js";
import { CITIZEN } from "../config/rolePermissions.js";

const NONE = [];

// The logged-in citizen's claims (guests and staff have none) and the reports they already
// have a Pending claim on, so the page can show "Claim submitted" instead of "Claim Pet".
function useMyClaims() {
  const { role } = useAuth();
  const isCitizen = role === CITIZEN;

  const { data, loading, reload } = useFetch(
    () => (isCitizen ? listMyClaims() : Promise.resolve(NONE)),
    [isCitizen]
  );

  const claims = data ?? NONE;

  const pendingReportIds = useMemo(
    () => new Set(claims.filter((claim) => claim.status === "Pending").map((claim) => claim.reportId)),
    [claims]
  );

  return { claims, pendingReportIds, loading, reload };
}

export default useMyClaims;
