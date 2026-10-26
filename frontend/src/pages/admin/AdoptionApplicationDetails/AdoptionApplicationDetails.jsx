import {
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  BadgeCheck,
  CalendarDays,
  Check,
  Download,
  FileCheck2,
  FileImage,
  FileText,
  HeartHandshake,
  Home,
  Image,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import useFetch from "../../../hooks/useFetch.js";
import useAuth from "../../../hooks/useAuth.js";
import {
  approveApplication,
  getApplication,
  rejectApplication,
  verifyApplicationId,
} from "../../../services/adoptionService.js";
import { formatApiError } from "../../../services/authService.js";

import "./AdoptionApplicationDetails.css";
import BackButton from "../../../components/common/BackButton.jsx";
import SafeImage from "../../../components/common/SafeImage.jsx";
import PhotoViewer from "./PhotoViewer.jsx";
import { formatDate } from "../../../utils/formatDateTime.js";

// Name of the animal for the page: "Unnamed Dog (Aspin)" when it has no name
function animalLabel(application) {
  const name = typeof application.petName === "string" ? application.petName.trim() : "";
  if (name) return name;

  const type = (application.petType || "pet").toLowerCase();

  return application.petBreed ? `Unnamed ${type} (${application.petBreed})` : `Unnamed ${type}`;
}


function AdoptionApplicationDetails() {
  const { applicationId } =
    useParams();

  const { can } = useAuth();

  // only roles with these permissions (the adoption counselor) review and decide
  const canApprove = can("adoptionApplications.approve");
  const canReject = can("adoptionApplications.reject");
  const canVerifyId = can("adoptionApplications.verifyId");


  const { data: fetched, loading, reload } =
    useFetch(
      () => getApplication(applicationId),
      [applicationId]
    );

  // blocks a second click while a decision is being saved
  const [busy, setBusy] =
    useState(false);

  // the application as the ID check returned it: the badges update without reloading the page
  const [updated, setUpdated] =
    useState(null);

  const [idNotice, setIdNotice] =
    useState("");

  // full-size viewer: { images, start, label } or null
  const [viewer, setViewer] =
    useState(null);

  // images that failed to load (the placeholder shows instead): they do not open the viewer
  const [brokenImages, setBrokenImages] =
    useState([]);

  const application =
    updated && updated.id === fetched?.id
      ? updated
      : fetched;

  const currentStatus =
    application?.status ||
    "Pending";


  if (loading) {
    return (
      <div className="staff-page">
        <p>Loading...</p>
      </div>
    );
  }


  if (!application) {
    return (
      <div className="staff-page">

        <BackButton fallback="/admin/adoption-applications" />


        <div className="application-details__not-found">

          <h1>
            Application not found
          </h1>

          <p>
            The requested adoption application
            could not be found.
          </p>

        </div>

      </div>
    );
  }


  const formattedId =
    `MPR-${String(
      application.id
    ).padStart(
      3,
      "0"
    )}`;


  // The API decides (and refuses a second decision); the page shows its message
  const decide = async (action) => {
    setBusy(true);
    setUpdated(null);
    setIdNotice("");

    try {
      await action();
    } catch (error) {
      window.alert(
        formatApiError(error).message
      );
    }

    reload();
    setBusy(false);
  };


  const handleApprove = () => {
    const confirmed =
      window.confirm(
        `Approve ${application.applicantName}'s application for ${animalLabel(application)}? The animal will be marked as Adopted and other pending applications for it will be rejected.`
      );


    if (confirmed) {
      decide(() =>
        approveApplication(
          application.id
        )
      );
    }
  };


  const handleReject = () => {
    const reason =
      window.prompt(
        `Reject ${application.applicantName}'s application for ${animalLabel(application)}?

Reason (shown to the applicant, optional):`
      );


    // Cancel leaves it as it is
    if (reason !== null) {
      decide(() =>
        rejectApplication(
          application.id,
          reason.trim() || null
        )
      );
    }
  };


  // Valid ID check (adoption counselor): Verified, or Rejected, which also rejects the application
  const checkId = async (status, reason) => {
    setBusy(true);
    setIdNotice("");

    try {
      const next = await verifyApplicationId(application.id, status, reason);

      setUpdated(next);
      setIdNotice(
        status === "Verified"
          ? "Valid ID marked as verified. You can approve the application now."
          : "Valid ID rejected. The application was rejected too."
      );
    } catch (error) {
      window.alert(
        formatApiError(error).message
      );
    }

    setBusy(false);
  };


  // Props that make an image (or the box around it) open the viewer: a button for mouse and keyboard.
  // No URL, or an image that failed to load, is not clickable.
  const zoomProps = (images, start, label) => {
    const url = images[start];

    if (!url || brokenImages.includes(url)) {
      return {};
    }

    const open = (event) => {
      setViewer({
        images: images.filter((item) => item && !brokenImages.includes(item)),
        start: images
          .filter((item) => item && !brokenImages.includes(item))
          .indexOf(url),
        label,
      });
      event.stopPropagation();
    };

    return {
      role: "button",
      tabIndex: 0,
      "aria-label": `View full photo: ${label}`,
      "data-zoomable": "true",
      onClick: open,
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(event);
        }
      },
    };
  };

  const markBroken = (url) => {
    setBrokenImages((current) =>
      current.includes(url) ? current : [...current, url]
    );
  };

  const homePhotoUrls = (application.homePhotos || []).map((photo) => photo.url);
  const animalPhotoUrls = application.petImages?.length
    ? application.petImages
    : [application.petImage];


  const handleVerifyId = () => {
    checkId("Verified");
  };


  const handleRejectId = () => {
    const reason =
      window.prompt(
        `Reject ${application.applicantName}'s valid ID?

This will also reject the whole application.

Reason (shown to the applicant, optional):`
      );


    // Cancel leaves it as it is
    if (reason !== null) {
      checkId("Rejected", reason.trim() || null);
    }
  };


  const idVerified =
    application.idVerificationStatus === "Verified";


  return (
    <div className="staff-page application-details">

      {/* BACK */}

      <BackButton fallback="/admin/adoption-applications" />


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="application-details__page-header">

        <div>

          <p className="staff-page__breadcrumb">
            Adoption Applications /
            {" "}
            {formattedId}
          </p>


          <div className="application-details__heading">

            <h1 className="staff-page__title">
              Application Details
            </h1>


            <StatusBadge
              status={
                currentStatus
              }
            />

          </div>


          <div className="application-details__header-meta">

            <span>
              Application ID:
              <strong>
                {formattedId}
              </strong>
            </span>


            <span>
              •
            </span>


            <span>
              Submitted:
              <strong>
                {application.date}
              </strong>
            </span>

          </div>

        </div>


        <button
          type="button"
          className="application-details__export"
          onClick={() =>
            window.print()
          }
        >
          <Download size={14} />

          Export Application
        </button>

      </div>


      {/* =====================================
          QUICK REVIEW
      ====================================== */}

      <section className="application-details__review-overview">

        <OverviewItem
          icon={
            <UserRound size={18} />
          }
          label="Applicant"
          value={
            application.applicantName
          }
        />


        <OverviewItem
          icon={
            <HeartHandshake size={18} />
          }
          label="Applying For"
          value={
            animalLabel(application)
          }
        />


        <OverviewItem
          icon={
            <ShieldCheck size={18} />
          }
          label="Valid ID"
          value={
            application.idVerificationStatus
          }
        />


        <OverviewItem
          icon={
            <Home size={18} />
          }
          label="Residence"
          value={
            application.residence
          }
        />

      </section>


      {/* =====================================
          COUNSELOR DECISION
          Pending: the buttons. Decided: a read-only summary.
      ====================================== */}

      {currentStatus !== "Pending" ? (
      <section
        className={`application-details__decision application-details__decision--decided application-details__decision--${currentStatus.toLowerCase()}`}
        aria-label="Counselor decision"
      >

        <div>

          <span className="application-details__decision-eyebrow">
            Counselor Decision
          </span>

          <h2>
            {currentStatus}
            {application.reviewedAt && ` on ${formatDate(application.reviewedAt)}`}
            {application.reviewedBy && ` by ${application.reviewedBy}`}
          </h2>

          {currentStatus === "Rejected" && (
            <p>
              Reason:{" "}
              {application.rejectionReason ||
                "No reason was given."}
            </p>
          )}

        </div>

      </section>
      ) : null}

      {/* =====================================
          COUNSELOR ACTIONS
      ====================================== */}

      {currentStatus === "Pending" && (canApprove || canReject) && (
      <section className="application-details__decision">

        <div>

          <span className="application-details__decision-eyebrow">
            Counselor Decision
          </span>


          <h2>
            Application Action
          </h2>


          <p>
            Review the applicant's information,
            home photos, valid ID, selected
            animal, and answers before making
            a decision.
          </p>

        </div>


        <div className="application-details__actions">

          {canReject && (
          <button
            type="button"
            className="application-details__reject"
            disabled={
              busy ||
              currentStatus !== "Pending"
            }
            onClick={
              handleReject
            }
          >
            <X size={14} />

            Reject
          </button>
          )}


          {canApprove && (
          <button
            type="button"
            className="application-details__approve"
            disabled={
              busy ||
              currentStatus !== "Pending" ||
              !idVerified
            }
            onClick={
              handleApprove
            }
          >
            <Check size={14} />

            Approve Application
          </button>
          )}

          {canApprove && !idVerified && (
            <span className="application-details__hint">
              Verify the valid ID first
            </span>
          )}

        </div>

      </section>
      )}


      {/* =====================================
          MAIN GRID
      ====================================== */}

      <section className="application-details__grid">

        {/* LEFT */}

        <div className="application-details__left">

          {/* =================================
              01 PERSONAL INFORMATION
          ================================== */}

          <section className="application-details__card">

            <SectionHeading
              number="01"
              icon={
                <UserRound size={16} />
              }
              title="Personal Information"
              description="Information submitted by the applicant."
            />


            <div className="application-details__applicant-grid">

              <Detail
                label="First Name"
                value={
                  application.firstName
                }
              />


              <Detail
                label="Last Name"
                value={
                  application.lastName
                }
              />


              <Detail
                label="Birth Date"
                value={
                  formatBirthDate(
                    application.birthDate
                  )
                }
              />


              <Detail
                label="Civil Status"
                value={
                  application.civilStatus
                }
              />


              <Detail
                label="Pronouns"
                value={
                  application.pronouns
                }
              />


              <Detail
                label="Employment Status"
                value={
                  application.employmentStatus
                }
              />


              {application.work && (
                <Detail
                  label="Work"
                  value={
                    application.work
                  }
                />
              )}


              {application.employmentStatus ===
                "Self-employed" && (
                <Detail
                  label="Field"
                  value={
                    application.selfEmployedField ===
                    "Other"
                      ? application.selfEmployedFieldOther
                      : application.selfEmployedField
                  }
                />
              )}


              <Detail
                label="Previously Adopted from PAWmilya"
                value={
                  application.adoptedBefore
                }
              />


              <Detail
                label="How They Found PAWmilya"
                value={
                  application.prompt
                }
              />

            </div>


            <div className="application-details__contact">

              <ContactRow
                icon={
                  <Phone size={14} />
                }
                label="Phone Number"
                value={
                  application.phone
                }
              />


              <ContactRow
                icon={
                  <Mail size={14} />
                }
                label="Email Address"
                value={
                  application.email
                }
              />


              <ContactRow
                icon={
                  <MapPin size={14} />
                }
                label="Address"
                value={
                  application.address
                }
              />


              <ContactRow
                icon={
                  <UserRound size={14} />
                }
                label="Social Media"
                value={
                  application.socialMedia
                }
              />

            </div>

          </section>


          {/* =================================
              02 HOME AND PET EXPERIENCE
          ================================== */}

          <section className="application-details__card">

            <SectionHeading
              number="02"
              icon={
                <Home size={16} />
              }
              title="Home and Pet Experience"
              description="Residence and previous pet-care information."
            />


            <div className="application-details__applicant-grid">

              <Detail
                label="Type of Residence"
                value={
                  application.residence
                }
              />


              <Detail
                label="People in Household"
                value={
                  application.householdMembers
                }
              />


              <Detail
                label="Currently Has Pets"
                value={
                  application.hasPets
                }
              />


              {application.hasPets ===
                "Yes" && (
                <Detail
                  label="Number of Pets"
                  value={
                    application.petCount
                  }
                />
              )}


              <Detail
                label="Pet Care Experience"
                value={
                  application.petExperience
                }
              />

            </div>

          </section>


          {/* =================================
              03 HOME PHOTOS
          ================================== */}

          <section className="application-details__card">

            <SectionHeading
              number="03"
              icon={
                <Image size={16} />
              }
              title="Home Photos"
              description="Home images submitted as part of the application."
            />


            <div className="application-details__home-photos">

              {application.homePhotos?.length >
              0 ? (

                application.homePhotos.map(
                  (photo, index) => (

                    <div
                      className="application-details__home-photo"
                      key={`${photo.name}-${index}`}
                      {...zoomProps(homePhotoUrls, index, `Home photo ${index + 1}`)}
                    >

                      {photo.url ? (
                        <SafeImage
                          src={
                            photo.url
                          }
                          alt={`Applicant home ${index + 1}`}
                          onError={() => markBroken(photo.url)}
                        />
                      ) : (
                        <div className="application-details__photo-placeholder">

                          <FileImage
                            size={23}
                          />

                          <span>
                            Home Photo
                            {" "}
                            {index + 1}
                          </span>

                          <small>
                            {photo.name}
                          </small>

                        </div>
                      )}

                    </div>

                  )
                )

              ) : (

                <div className="application-details__no-files">
                  No home photos submitted.
                </div>

              )}

            </div>


            <div className="application-details__photo-checklist">

              <span>
                Required collage should show:
              </span>

              <div>
                <small>
                  Front of house
                </small>

                <small>
                  Street
                </small>

                <small>
                  Living room
                </small>

                <small>
                  Dining area
                </small>

                <small>
                  Kitchen
                </small>

                <small>
                  Bedrooms
                </small>

                <small>
                  Windows
                </small>

                <small>
                  Front & backyard
                </small>
              </div>

            </div>

          </section>


          {/* =================================
              05 TERMS
          ================================== */}

          <section className="application-details__card">

            <SectionHeading
              number="05"
              icon={
                <FileCheck2
                  size={16}
                />
              }
              title="Terms and Conditions"
              description="Applicant agreement submitted with the form."
            />


            <div className="application-details__terms-status">

              <BadgeCheck
                size={17}
              />


              <div>

                <strong>
                  {application.termsAccepted
                    ? "Terms Accepted"
                    : "Terms Not Accepted"}
                </strong>


                <span>
                  Applicant agreed to the
                  PAWmilya adoption terms
                  and conditions.
                </span>

              </div>

            </div>

          </section>

        </div>


        {/* ===================================
            RIGHT SIDE
        ==================================== */}

        <div className="application-details__right">

          {/* SELECTED ANIMAL */}

          <section className="application-details__card">

            <SectionHeading
              icon={
                <HeartHandshake
                  size={16}
                />
              }
              title="Selected Animal"
              description="Animal selected by the applicant."
            />


            <div className="application-details__animal">

              <div className="application-details__animal-media">

              <div
                className="application-details__animal-photo"
                {...zoomProps(animalPhotoUrls, 0, "Animal photo")}
              >

                {application.petImage ? (
                  <SafeImage
                    src={
                      application.petImage
                    }
                    alt={
                      animalLabel(application)
                    }
                    onError={() => markBroken(application.petImage)}
                  />
                ) : (
                  <span>
                    Animal Photo
                  </span>
                )}

              </div>


              {application.petImages?.length > 1 && (
                <div className="application-details__animal-thumbs">
                  {application.petImages.slice(1).map((url, position) => (
                    <SafeImage
                      key={url}
                      src={url}
                      alt={`${animalLabel(application)} photo`}
                      onError={() => markBroken(url)}
                      {...zoomProps(animalPhotoUrls, position + 1, `Animal photo ${position + 2}`)}
                    />
                  ))}
                </div>
              )}

              </div>

              <div className="application-details__animal-info">

                <h3>
                  {
                    animalLabel(application)
                  }
                </h3>


                <span className="application-details__animal-type">
                  {
                    application.petType
                  }
                  {" · "}
                  {
                    application.petAge
                  }
                </span>


                <p>
                  {
                    application.petBreed
                  }
                </p>


                <p>
                  Sex:{" "}
                  {
                    application.petSex
                  }
                </p>


                <p className="application-details__location">
                  <MapPin
                    size={12}
                  />

                  {
                    application.petLocation
                  }
                </p>

              </div>

            </div>


            {application.petPersonality
              ?.length > 0 && (

              <div className="application-details__pet-traits">

                {application.petPersonality.map(
                  (trait) => (
                    <span
                      key={
                        trait
                      }
                    >
                      {trait}
                    </span>
                  )
                )}

              </div>

            )}

          </section>


          {/* VALID ID */}

          <section className="application-details__card">

            <SectionHeading
              icon={
                <ShieldCheck
                  size={16}
                />
              }
              title="Valid ID"
              description="Identification uploaded with the application."
            />


            <DocumentRow
              title="Uploaded Valid ID"
              subtitle={
                application.validId?.name ||
                "No ID uploaded"
              }
              status={
                application.idVerificationStatus
              }
            />


            {canVerifyId && currentStatus === "Pending" && (
              <div className="application-details__id-actions">

                <button
                  type="button"
                  className="application-details__id-verify"
                  disabled={busy || idVerified}
                  onClick={handleVerifyId}
                >
                  <Check size={14} />

                  Mark as Verified
                </button>

                <button
                  type="button"
                  className="application-details__id-reject"
                  disabled={busy}
                  onClick={handleRejectId}
                >
                  <X size={14} />

                  Reject ID
                </button>

              </div>
            )}

            {idNotice && (
              <p className="application-details__id-notice" role="status">
                {idNotice}
              </p>
            )}


            {application.validId?.url ? (

              <div
                className="application-details__id-preview"
                {...zoomProps([application.validId.url], 0, "Valid ID")}
              >

                <SafeImage
                  src={
                    application.validId.url
                  }
                  alt="Applicant valid ID"
                  onError={() => markBroken(application.validId.url)}
                />

              </div>

            ) : (

              <div className="application-details__id-placeholder">

                <FileText
                  size={25}
                />

                <span>
                  ID Preview
                </span>

                <small>
                  Image will display here
                  once file storage is
                  connected.
                </small>

              </div>

            )}

          </section>

          {/* =================================
                  04 ADOPTION QUESTIONS
              ================================== */}

              <section className="application-details__card">

                <SectionHeading
                  number="04"
                  icon={
                    <MessageSquareText size={16} />
                  }
                  title="Adoption Questions"
                  description="Applicant responses submitted with the adoption request."
                />

                <Question
                  number="01"
                  question={`Why would you like to adopt ${animalLabel(application)}?`}
                  answer={application.whyAdopt}
                />

                <Question
                  number="02"
                  question="How will you care for the pet?"
                  answer={application.howCare}
                />

              </section>


          {/* REVIEW SUMMARY */}

          <section className="application-details__card">

            <SectionHeading
              icon={
                <BadgeCheck
                  size={16}
                />
              }
              title="Review Summary"
              description="Current application review information."
            />


            <ReviewRow
              label="ID Verification"
              value={
                application.idVerificationStatus
              }
            />


            <ReviewRow
              label="Home Photos"
              value={
                application.homePhotos?.length
                  ? `${application.homePhotos.length} submitted`
                  : "None"
              }
            />


            <ReviewRow
              label="Terms"
              value={
                application.termsAccepted
                  ? "Accepted"
                  : "Not Accepted"
              }
            />


            <ReviewRow
              label="Application Status"
              value={
                currentStatus
              }
            />


            <ReviewRow
              label="Submission Date"
              value={
                application.date
              }
            />

          </section>


        </div>

      </section>



      {viewer && (
        <PhotoViewer
          images={viewer.images}
          start={viewer.start}
          label={viewer.label}
          onClose={() => setViewer(null)}
        />
      )}

    </div>
  );
}


function OverviewItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="application-details__review-item">

      <span className="application-details__review-icon">
        {icon}
      </span>


      <div>

        <small>
          {label}
        </small>

        <strong>
          {value ||
            "Not provided"}
        </strong>

      </div>

    </div>
  );
}


function SectionHeading({
  number,
  icon,
  title,
  description,
}) {
  return (
    <div className="application-details__card-heading">

      <div>

        <span className="application-details__card-icon">
          {number ||
            icon}
        </span>


        <div>

          <h2>
            {title}
          </h2>

          <p>
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}


function Detail({
  label,
  value,
}) {
  return (
    <div className="application-details__detail">

      <span>
        {label}
      </span>

      <strong>
        {value === 0
          ? "0"
          : value ||
            "Not provided"}
      </strong>

    </div>
  );
}


function ContactRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="application-details__contact-row">

      <span className="application-details__contact-icon">
        {icon}
      </span>


      <div>

        <small>
          {label}
        </small>

        <strong>
          {value ||
            "Not provided"}
        </strong>

      </div>

    </div>
  );
}


function Question({
  number,
  question,
  answer,
}) {
  return (
    <div className="application-details__question">

      <span className="application-details__question-number">
        {number}
      </span>


      <div>

        <strong>
          {question}
        </strong>

        <p>
          {answer ||
            "No answer provided."}
        </p>

      </div>

    </div>
  );
}


function DocumentRow({
  title,
  subtitle,
  status,
}) {
  return (
    <div className="application-details__document">

      <div className="application-details__document-icon">
        <FileText
          size={14}
        />
      </div>


      <div className="application-details__document-info">

        <strong>
          {title}
        </strong>

        <span>
          {subtitle}
        </span>

      </div>


      <div
        className={`application-details__document-status application-details__document-status--${
          status === "Verified"
            ? "verified"
            : status === "Rejected"
            ? "rejected"
            : "pending"
        }`}
      >

        <BadgeCheck
          size={14}
        />

        <span>
          {status}
        </span>

      </div>

    </div>
  );
}


function ReviewRow({
  label,
  value,
}) {
  return (
    <div className="application-details__review-row">

      <span>
        {label}
      </span>

      <strong>
        {value ||
          "Not provided"}
      </strong>

    </div>
  );
}


function StatusBadge({
  status,
}) {
  const statusClass =
    status === "Approved"
      ? "staff-status--approved"
      : status === "Rejected"
      ? "staff-status--rejected"
      : "staff-status--pending";


  return (
    <span
      className={`staff-status ${statusClass}`}
    >
      {status}
    </span>
  );
}


function formatBirthDate(
  value
) {
  if (!value) {
    return "Not provided";
  }


  const date =
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}


export default AdoptionApplicationDetails;