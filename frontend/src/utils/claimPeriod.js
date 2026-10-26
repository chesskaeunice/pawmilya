const DAY_MS = 24 * 60 * 60 * 1000;

// "Nov 2, 2026" (Asia/Manila)
export function formatClaimDate(deadline) {
  return new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });
}

// Line shown on a Rescued report: "Claimable until Nov 2, 2026 (5 days left)", or
// "Claim period ended". Returns "" when the report has no deadline.
export function claimPeriodText(deadline, now = Date.now()) {
  if (!deadline) return "";

  const end = new Date(deadline);
  if (Number.isNaN(end.getTime())) return "";

  const daysLeft = Math.ceil((end.getTime() - now) / DAY_MS);
  if (daysLeft <= 0) return "Claim period ended";

  const date = formatClaimDate(end);

  return `Claimable until ${date} (${daysLeft} ${daysLeft === 1 ? "day" : "days"} left)`;
}

// True while a Rescued pet can still be claimed
export function canClaim(report) {
  return (
    report.status === "Rescued" &&
    Boolean(report.claimDeadlineAt) &&
    new Date(report.claimDeadlineAt).getTime() > Date.now()
  );
}
