import {
  useParams,
} from "react-router-dom";

import {
  BadgeCheck,
  Check,
  Download,
  FileText,
  MapPin,
  MessageSquareText,
  X,
} from "lucide-react";

import applications from "../../../data/applications.js";

import "./AdoptionApplicationDetails.css";

function AdoptionApplicationDetails() {
  const { applicationId } =
    useParams();

  const application =
    applications.find(
      (item) =>
        item.id === Number(applicationId)
    );

  if (!application) {
    return (
      <div className="staff-page">
        <h1>
          Application not found.
        </h1>
      </div>
    );
  }

  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Adoption Applications /
            Application Details
          </p>

          <div className="application-details__heading">
            <h1 className="staff-page__title">
              Application Details
            </h1>

            <span className="staff-status staff-status--pending">
              {application.status}
            </span>
          </div>

          <p className="staff-page__subtitle">
            Submitted on{" "}
            {application.date}
          </p>
        </div>

        <button
          type="button"
          className="staff-button staff-button--outline"
        >
          <Download size={13} />
          Export Application
        </button>
      </div>

      <section className="application-details__grid">
        <div className="application-details__left">
          <section className="staff-detail-card">
            <div className="application-details__section-title">
              <h2>
                Applicant Information
              </h2>

              <button type="button">
                Edit
              </button>
            </div>

            <div className="staff-detail-grid">
              <Detail
                label="Full Name"
                value={
                  application.applicantName
                }
              />

              <Detail
                label="Sex"
                value={application.sex}
              />

              <Detail
                label="Age"
                value={application.age}
              />

              <Detail
                label="Email Address"
                value={application.email}
              />

              <Detail
                label="Contact Number"
                value={application.phone}
              />

              <Detail
                label="Address"
                value={
                  application.address
                }
              />

              <Detail
                label="Residence"
                value={
                  application.residence
                }
              />

              <Detail
                label="Household Members"
                value={
                  application.householdMembers
                }
              />

              <Detail
                label="Employment"
                value={
                  application.employmentStatus
                }
              />

              <Detail
                label="Occupation"
                value={
                  application.occupation
                }
              />

              <Detail
                label="Monthly Income"
                value={
                  application.monthlyIncome
                }
              />
            </div>
          </section>

          <section className="staff-detail-card">
            <h2 className="staff-detail-card__title">
              Application Form Answers
            </h2>

            <Question
              question="Why do you want to adopt a pet?"
              answer={
                application.reason
              }
            />

            <Question
              question="How will you care for the pet?"
              answer={
                application.carePlan
              }
            />

            <Question
              question="Current pets / pet care experience"
              answer={`${application.currentPets} · ${application.petExperience}`}
            />

            <Question
              question="Additional information"
              answer={
                application.additionalInfo ||
                "None provided."
              }
            />
          </section>
        </div>

        <div className="application-details__right">
          <section className="staff-detail-card">
            <h2 className="staff-detail-card__title">
              Animal Information
            </h2>

            <div className="application-details__animal">
              <div className="application-details__animal-photo">
                Animal Photo
              </div>

              <div>
                <h3>
                  {application.petName}
                </h3>

                <p>
                  {application.petType} ·{" "}
                  {application.petAge}
                </p>

                <p>
                  {application.petBreed}
                </p>

                <p className="application-details__location">
                  <MapPin size={11} />
                  {
                    application.petLocation
                  }
                </p>
              </div>
            </div>
          </section>

          <section className="staff-detail-card">
            <h2 className="staff-detail-card__title">
              Documents
            </h2>

            <DocumentRow
              title="Proof of Identification"
              subtitle={`${application.idType} · ${application.idVerificationStatus}`}
            />

            <DocumentRow
              title="Front of Addressed ID"
              subtitle={application.idNumber}
            />

            <DocumentRow
              title="Proof of Income"
              subtitle={`${application.incomeProofType} · ${application.incomeVerificationStatus}`}
            />

            <DocumentRow
              title="Pet Care Plan"
              subtitle="Uploaded document"
            />
          </section>
        </div>
      </section>

      <section className="application-details__actions">
        <span>Actions</span>

        <button
          type="button"
          className="application-details__approve"
        >
          <Check size={13} />
          Approve Application
        </button>

        <button
          type="button"
          className="application-details__reject"
        >
          <X size={13} />
          Reject Application
        </button>

        <button
          type="button"
          className="application-details__request"
        >
          <MessageSquareText size={13} />
          Request More Information
        </button>
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="staff-detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Question({
  question,
  answer,
}) {
  return (
    <div className="application-details__question">
      <span>{question}</span>

      <p>{answer}</p>
    </div>
  );
}

function DocumentRow({
  title,
  subtitle,
}) {
  return (
    <div className="application-details__document">
      <div className="application-details__document-icon">
        <FileText size={14} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

      <BadgeCheck size={14} />
    </div>
  );
}

export default AdoptionApplicationDetails;