import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";

import { petPlaceholders } from "../../assets/images/placeholders/index.js";
import PreviewStatus from "./PreviewStatus.jsx";
import ClaimPetButton from "../report/ClaimPetButton.jsx";
import { getAdoptableStatus } from "../../services/previewService.js";
import { formatDateTime } from "../../utils/formatDateTime.js";
import { displayPetName } from "../../utils/petName.js";

import "./PreviewCards.css";
import SafeImage from "../common/SafeImage.jsx";

// One card for both previews:
//   kind="adoptable" -> item from the adoptable pets API, opens /adoptable-pets/:id
//   kind="missing"   -> item from the missing reports API, opens /missing-pets/:id,
//                       with a Claim Pet button when the report can be claimed (the page owns the claim flow)
function PetPreviewCard({ kind, item, pendingReportIds, onClaim }) {
  const isMissing = kind === "missing";
  const name = displayPetName(item.name);

  const status = isMissing ? item.status : getAdoptableStatus(item.status);
  const image = item.image || petPlaceholders[item.type] || petPlaceholders.Other;
  const to = isMissing ? `/missing-pets/${item.id}` : `/adoptable-pets/${item.id}`;

  // the breed is optional on missing pet reports
  const meta = [item.type, item.breed].filter(Boolean).join(" · ");

  return (
    <article className="preview-card">

      <div className="preview-card__image">
        <SafeImage type={item.type}
          src={image}
          alt={`Photo of ${name}`}
          loading="lazy"
        />
      </div>

      <div className="preview-card__body">

        <div className="preview-card__heading">
          <div>
            <h3>{name}</h3>
            <p className="preview-card__meta">{meta}</p>
          </div>

          <PreviewStatus status={status} />
        </div>

        {isMissing && (
          <ul className="preview-card__facts">
            <li>
              <MapPin size={14} aria-hidden="true" />
              {item.location}
            </li>
            <li>
              <Clock size={14} aria-hidden="true" />
              {formatDateTime(item.reportedAt)}
            </li>
          </ul>
        )}

        {/* The link stretches over the whole card, so the card is clickable */}
        {isMissing ? (
          <div className="preview-card__actions">
            <Link
              to={to}
              className="preview-card__link"
              aria-label={`View report for ${name}`}
            >
              View Report
            </Link>

            {onClaim && (
              <ClaimPetButton report={item} pendingReportIds={pendingReportIds} onClaim={onClaim} />
            )}
          </div>
        ) : (
          <Link
            to={to}
            className="preview-card__link"
            aria-label={`View ${name}`}
          >
            View
          </Link>
        )}

      </div>

    </article>
  );
}

export default PetPreviewCard;
