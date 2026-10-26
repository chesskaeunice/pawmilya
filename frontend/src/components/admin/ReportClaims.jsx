import { useState } from "react";

import useAuth from "../../hooks/useAuth.js";
import useFetch from "../../hooks/useFetch.js";
import {
  approveClaim,
  listReportClaims,
  rejectClaim,
} from "../../services/claimService.js";
import { formatApiError } from "../../services/authService.js";
import { formatDate } from "../../utils/formatDateTime.js";

import "./ReportClaims.css";

// Claims on one missing pet report: claimant contact details, pickup date, proof images (signed
// links) and Approve / Reject (pound staff only; the kennel manager can only look).
function ReportClaims({ reportId, onDecided }) {
  const { can } = useAuth();

  const { data, loading, reload } = useFetch(() => listReportClaims(reportId), [reportId]);
  const claims = data ?? [];

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const decide = async (action) => {
    setBusy(true);
    setError("");

    try {
      await action();
      reload();
      onDecided?.();
    } catch (err) {
      const { message, fields } = formatApiError(err);
      setError(Object.values(fields)[0] || message);
    }

    setBusy(false);
  };

  const handleApprove = (claim) => {
    const ok = window.confirm(
      `Approve ${claim.contactName}'s claim?\n\nThe report becomes Reunited, the pet becomes "Reunited with Owner", and the other waiting claims are rejected.`
    );

    if (ok) decide(() => approveClaim(reportId, claim.id));
  };

  const handleReject = (claim) => {
    const reason = window.prompt(`Reject ${claim.contactName}'s claim?\n\nReason (shown to the claimant, optional):`);

    // Cancel leaves it as it is
    if (reason !== null) decide(() => rejectClaim(reportId, claim.id, reason.trim() || null));
  };

  return (
    <section className="missing-details__card report-claims">

      <h2 className="report-claims__title">Claims</h2>

      {loading && <p>Loading claims...</p>}

      {!loading && claims.length === 0 && (
        <p className="report-claims__empty">No one has claimed this pet.</p>
      )}

      {error && <p className="report-claims__error" role="alert">{error}</p>}

      {claims.map((claim) => (
        <article className="report-claims__item" key={claim.id}>

          <div className="report-claims__head">
            <strong>{claim.contactName}</strong>
            <span className={`report-claims__status report-claims__status--${claim.status.toLowerCase()}`}>
              {claim.status}
            </span>
          </div>

          <dl className="report-claims__details">
            <div><dt>Contact number</dt><dd>{claim.contactNumber}</dd></div>
            <div><dt>Email</dt><dd>{claim.contactEmail || "Not given"}</dd></div>
            <div><dt>Pickup date</dt><dd>{formatDate(claim.pickupDate)}</dd></div>
            <div><dt>Submitted</dt><dd>{formatDate(claim.submittedAt)}</dd></div>
          </dl>

          <div className="report-claims__proof">
            {claim.proofImages.map((url, index) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt={`Proof of ownership ${index + 1}`} loading="lazy" />
              </a>
            ))}
          </div>

          {claim.status === "Rejected" && claim.rejectReason && (
            <p className="report-claims__reason">Reason: {claim.rejectReason}</p>
          )}

          {claim.decidedBy && (
            <p className="report-claims__reason">
              {claim.status} by {claim.decidedBy}
            </p>
          )}

          {claim.status === "Pending" && can("claims.decide") && (
            <div className="report-claims__actions">
              <button type="button" className="staff-button" disabled={busy} onClick={() => handleApprove(claim)}>
                Approve
              </button>

              <button type="button" className="staff-button staff-button--outline" disabled={busy} onClick={() => handleReject(claim)}>
                Reject
              </button>
            </div>
          )}

        </article>
      ))}

    </section>
  );
}

export default ReportClaims;
