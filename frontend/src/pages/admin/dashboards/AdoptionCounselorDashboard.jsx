import {
  useMemo,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  PawPrint,
  Search,
  XCircle,
} from "lucide-react";

import useAdminLists from "../../../hooks/useAdminLists.js";
import MyShifts from "../../../components/admin/MyShifts.jsx";

import "./AdoptionCounselorDashboard.css";


function AdoptionCounselorDashboard() {
  const { applications, missingPets } = useAdminLists();


  /* =========================================
     APPLICATION STATISTICS
  ========================================= */

  const applicationStats =
    useMemo(() => {
      return {
        pending:
          applications.filter(
            (application) =>
              application.status === "Pending"
          ).length,

        approved:
          applications.filter(
            (application) =>
              application.status === "Approved"
          ).length,

        rejected:
          applications.filter(
            (application) =>
              application.status === "Rejected"
          ).length,
      };
    }, [applications]);


  /* =========================================
     APPLICATIONS NEEDING REVIEW
  ========================================= */

  const pendingApplications =
    useMemo(() => {
      return applications
        .filter(
          (application) =>
            application.status === "Pending"
        )
        .sort(
          (a, b) =>
            getApplicationDate(b) -
            getApplicationDate(a)
        )
        .slice(0, 4);
    }, [applications]);


  /* =========================================
     RECENT APPLICATIONS
  ========================================= */

  const recentApplications =
    useMemo(() => {
      return [...applications]
        .sort(
          (a, b) =>
            getApplicationDate(b) -
            getApplicationDate(a)
        )
        .slice(0, 4);
    }, [applications]);


  /* =========================================
     MISSING PETS REQUIRING ATTENTION
  ========================================= */

  const activeMissingReports =
    useMemo(() => {
      return missingPets
        .filter((pet) =>
          [
            "Lost",
            "Sighted",
            "Found",
          ].includes(pet.status)
        )
        .sort(
          (a, b) =>
            new Date(b.reportedAt) -
            new Date(a.reportedAt)
        );
    }, [missingPets]);


  const visibleMissingReports =
    activeMissingReports.slice(
      0,
      4
    );


  return (
    <div className="staff-page counselor-dashboard">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="counselor-dashboard__header">

        <div>


          <h1 className="staff-page__title">
            Adoption Counselor Dashboard
          </h1>


          <p className="staff-page__subtitle">
            Review adoption applications,
            monitor missing pet reports,
            and manage cases requiring
            attention.
          </p>

        </div>

      </div>


      {/* =====================================
          STAT CARDS
      ====================================== */}

      <section className="counselor-dashboard__stats">

        <StatCard
          icon={
            <ClipboardList size={21} />
          }
          label="Pending Applications"
          value={
            applicationStats.pending
          }
          description="Waiting for review"
          variant="pending"
          to="/admin/adoption-applications"
        />


        <StatCard
          icon={
            <CheckCircle2 size={21} />
          }
          label="Approved Applications"
          value={
            applicationStats.approved
          }
          description="Approved requests"
          variant="approved"
          to="/admin/adoption-applications"
        />


        <StatCard
          icon={
            <XCircle size={21} />
          }
          label="Rejected Applications"
          value={
            applicationStats.rejected
          }
          description="Rejected requests"
          variant="rejected"
          to="/admin/adoption-applications"
        />


        <StatCard
          icon={
            <Search size={21} />
          }
          label="Active Missing Reports"
          value={
            activeMissingReports.length
          }
          description="Lost, sighted, or found"
          variant="missing"
          to="/admin/missing-pets"
        />

      </section>


      {/* =====================================
          MAIN WORKSPACE
      ====================================== */}

      <section className="counselor-dashboard__workspace">

        {/* ===================================
            LEFT
        ==================================== */}

        <div className="counselor-dashboard__column">

          {/* APPLICATIONS NEEDING REVIEW */}

          <DashboardCard
            title="Applications Needing Review"
            subtitle="Pending adoption applications requiring counselor action."
            actionText="View All Applications"
            actionTo="/admin/adoption-applications"
          >

            {pendingApplications.length >
            0 ? (

              <div className="counselor-dashboard__applications">

                {pendingApplications.map(
                  (application) => (

                    <div
                      className="counselor-dashboard__application"
                      key={application.id}
                    >

                      <div className="counselor-dashboard__application-user">

                        <span className="counselor-dashboard__avatar">
                          {getInitials(
                            application.applicantName
                          )}
                        </span>


                        <div>

                          <strong>
                            {
                              application.applicantName
                            }
                          </strong>

                          <span>
                            Applying for{" "}
                            <b>
                              {
                                application.petName
                              }
                            </b>
                          </span>

                        </div>

                      </div>


                      <div className="counselor-dashboard__date">

                        <Clock3 size={14} />

                        {
                          application.date
                        }

                      </div>


                      <StatusBadge
                        status={
                          application.status
                        }
                      />


                      <Link
                        to={`/admin/adoption-applications/${application.id}`}
                        className="counselor-dashboard__review"
                      >
                        Review

                        <ArrowRight size={14} />
                      </Link>

                    </div>

                  )
                )}

              </div>

            ) : (

              <EmptyState
                title="No applications waiting"
                description="There are currently no pending adoption applications."
              />

            )}

          </DashboardCard>


          {/* RECENT ACTIVITY */}

          <DashboardCard
            title="Recent Adoption Activity"
            subtitle="Latest adoption applications and their current status."
            actionText="View Applications"
            actionTo="/admin/adoption-applications"
          >

            <div className="counselor-dashboard__activity-list">

              {recentApplications.map(
                (application) => (

                  <Link
                    to={`/admin/adoption-applications/${application.id}`}
                    className="counselor-dashboard__activity"
                    key={application.id}
                  >

                    <span
                      className={`counselor-dashboard__activity-icon counselor-dashboard__activity-icon--${application.status.toLowerCase()}`}
                    >

                      {application.status === "Approved" ? (

                        <CheckCircle2 size={18} />

                      ) : application.status === "Rejected" ? (

                        <XCircle size={18} />

                      ) : (

                        <Clock3 size={18} />

                      )}

                    </span>


                    <div className="counselor-dashboard__activity-info">

                      <strong>
                        {
                          application.applicantName
                        }
                      </strong>

                      <span>
                        Application for{" "}
                        <b>
                          {
                            application.petName
                          }
                        </b>
                      </span>

                    </div>


                    <div className="counselor-dashboard__activity-meta">

                      <StatusBadge
                        status={
                          application.status
                        }
                      />

                      <span>
                        {
                          application.date
                        }
                      </span>

                    </div>

                  </Link>

                )
              )}

            </div>

          </DashboardCard>

        </div>


        {/* ===================================
            RIGHT
        ==================================== */}

        <div className="counselor-dashboard__column">

          <DashboardCard
            title="Missing Pets Needing Attention"
            subtitle="Recently reported cases requiring review or follow-up."
            actionText="View All Reports"
            actionTo="/admin/missing-pets"
          >

            {visibleMissingReports.length >
            0 ? (

              <div className="counselor-dashboard__missing-list">

                {visibleMissingReports.map(
                  (pet) => {

                    const image =
                      pet.petImages?.[0] ||
                      pet.image;


                    return (
                      <Link
                        to={`/admin/missing-pets/${pet.id}`}
                        className="counselor-dashboard__missing"
                        key={pet.id}
                      >

                        <div className="counselor-dashboard__missing-photo">

                          {image ? (

                            <img
                              src={image}
                              alt={pet.name}
                            />

                          ) : (

                            <PawPrint size={21} />

                          )}

                        </div>


                        <div className="counselor-dashboard__missing-info">

                          <div className="counselor-dashboard__missing-title">

                            <strong>
                              {pet.name}
                            </strong>


                            <MissingStatus
                              status={
                                pet.status
                              }
                            />

                          </div>


                          <span>
                            {pet.type}
                            {" · "}
                            {pet.breed}
                          </span>


                          <p>
                            <MapPin size={14} />

                            {pet.location}
                          </p>


                          <small>
                            Reported{" "}
                            {formatTimestamp(
                              pet.reportedAt
                            )}
                          </small>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>

            ) : (

              <EmptyState
                title="No active missing reports"
                description="There are currently no missing pet cases requiring attention."
              />

            )}

          </DashboardCard>

        </div>

      </section>


      {/* =====================================
          QUICK ACTIONS
      ====================================== */}

      <section className="counselor-dashboard__quick">

        <div className="counselor-dashboard__quick-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Go directly to the counselor's
              primary work areas.
            </p>

          </div>

        </div>


        <div className="counselor-dashboard__quick-grid">

          <Link
            to="/admin/adoption-applications"
            className="counselor-dashboard__quick-action"
          >

            <span className="counselor-dashboard__quick-icon">
              <ClipboardList size={21} />
            </span>


            <div>

              <strong>
                Adoption Applications
              </strong>

              <span>
                Review and manage submitted
                adoption applications.
              </span>

            </div>


            <ArrowRight size={19} />

          </Link>


          <Link
            to="/admin/missing-pets"
            className="counselor-dashboard__quick-action"
          >

            <span className="counselor-dashboard__quick-icon">
              <Search size={21} />
            </span>


            <div>

              <strong>
                Missing Pet Reports
              </strong>

              <span>
                Review missing, sighted,
                and found pet reports.
              </span>

            </div>


            <ArrowRight size={19} />

          </Link>

        </div>

      </section>


      <MyShifts />

    </div>
  );
}


/* =========================================
   STAT CARD
========================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  variant,
  to,
}) {
  return (
    <Link
      to={to}
      className={`counselor-dashboard__stat counselor-dashboard__stat--${variant}`}
    >

      <span className="counselor-dashboard__stat-icon">
        {icon}
      </span>


      <div>

        <span className="counselor-dashboard__stat-label">
          {label}
        </span>


        <strong>
          {value}
        </strong>


        <small>
          {description}
        </small>

      </div>

    </Link>
  );
}


/* =========================================
   CARD
========================================= */

function DashboardCard({
  title,
  subtitle,
  actionText,
  actionTo,
  children,
}) {
  return (
    <section className="counselor-dashboard__card">

      <div className="counselor-dashboard__card-header">

        <div>

          <h2>
            {title}
          </h2>

          <p>
            {subtitle}
          </p>

        </div>


        <Link to={actionTo}>
          {actionText}

          <ArrowRight size={15} />
        </Link>

      </div>


      {children}

    </section>
  );
}


/* =========================================
   STATUS
========================================= */

function StatusBadge({
  status,
}) {
  return (
    <span
      className={`counselor-dashboard__status counselor-dashboard__status--${status
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}


function MissingStatus({
  status,
}) {
  return (
    <span
      className={`counselor-dashboard__missing-status counselor-dashboard__missing-status--${status
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}


/* =========================================
   EMPTY
========================================= */

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="counselor-dashboard__empty">

      <PawPrint size={26} />

      <strong>
        {title}
      </strong>

      <p>
        {description}
      </p>

    </div>
  );
}


/* =========================================
   HELPERS
========================================= */

function getInitials(name) {
  if (!name) {
    return "?";
  }


  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) =>
        word.charAt(0)
    )
    .join("")
    .toUpperCase();
}


function getApplicationDate(
  application
) {
  const date =
    new Date(
      application.date
    );


  return Number.isNaN(
    date.getTime()
  )
    ? application.id
    : date.getTime();
}


function formatTimestamp(value) {
  if (!value) {
    return "Date unavailable";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


export default AdoptionCounselorDashboard;